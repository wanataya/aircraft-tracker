<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-center mb-6 text-white">
        Aircraft Tracking System
      </h1>
      
      <!-- Control Panel -->
      <div class="bg-gray-800 p-4 rounded-lg mb-4 flex justify-between items-center">
        <div class="flex space-x-4">
          <button 
            @click="toggleTracking" 
            :class="isTracking ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'"
            class="px-4 py-2 rounded text-white font-medium transition-colors"
          >
            {{ isTracking ? 'Stop Tracking' : 'Start Tracking' }}
          </button>
          <button 
            @click="addRandomAircraft" 
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded text-white font-medium transition-colors"
          >
            Add Aircraft
          </button>
          <button 
            @click="clearAllAircraft" 
            class="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white font-medium transition-colors"
          >
            Clear All
          </button>
        </div>
        <div class="text-sm text-gray-300">
          Active Aircraft: {{ aircraftList.length }} | Last Update: {{ lastUpdate }}
        </div>
      </div>

      <!-- Map Canvas -->
      <div class="bg-gray-800 p-4 rounded-lg mb-4">
        <canvas 
          ref="mapCanvas" 
          width="1200" 
          height="600" 
          class="w-full border border-gray-600 rounded"
          @mousemove="onMouseMove"
          @click="onCanvasClick"
        ></canvas>
        <div class="text-xs text-gray-400 mt-2">
          Mouse: {{ mouseCoords.lat.toFixed(4) }}, {{ mouseCoords.lng.toFixed(4) }} | 
          Click to add aircraft at cursor position
        </div>
      </div>

      <!-- Aircraft List -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4">Aircraft Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="aircraft in aircraftList" 
            :key="aircraft.id"
            class="bg-gray-700 p-3 rounded border-l-4"
            :class="getAircraftStatusColor(aircraft)"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold">{{ aircraft.name }}</h3>
                <p class="text-sm text-gray-300">{{ aircraft.type }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  Lat: {{ aircraft.position.lat.toFixed(4) }}<br>
                  Lng: {{ aircraft.position.lng.toFixed(4) }}<br>
                  Alt: {{ aircraft.altitude.toFixed(0) }}m<br>
                  Speed: {{ aircraft.speed.toFixed(0) }} km/h<br>
                  Heading: {{ aircraft.heading.toFixed(0) }}°
                </p>
              </div>
              <button 
                @click="removeAircraft(aircraft.id)"
                class="text-red-400 hover:text-red-300 text-sm"
              >
                ✕
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

// Reactive data
const mapCanvas = ref(null)
const aircraftList = ref([])
const isTracking = ref(false)
const lastUpdate = ref('')
const mouseCoords = ref({ lat: 0, lng: 0 })

let updateInterval = null
let animationFrame = null
let ctx = null

// Aircraft types and colors
const aircraftTypes = [
  'Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380', 
  'Boeing 787', 'Embraer E190', 'Cessna 172', 'Boeing 747'
]

const airlines = [
  'Garuda Indonesia', 'Lion Air', 'Sriwijaya Air', 'Citilink',
  'Singapore Airlines', 'Emirates', 'Qatar Airways', 'AirAsia'
]

// World map data (simplified coastlines)
const worldMapData = {
  // Simplified world coastlines for canvas drawing
  coastlines: [
    // Indonesia outline (simplified)
    { points: [[95, -6], [141, -6], [141, 6], [95, 6], [95, -6]] },
    // Major continents (very simplified)
    { points: [[-180, 70], [180, 70], [180, -70], [-180, -70], [-180, 70]] }
  ]
}

// Utility functions
const toRadians = (degrees) => degrees * Math.PI / 180
const toDegrees = (radians) => radians * 180 / Math.PI

const latLngToCanvas = (lat, lng, canvasWidth, canvasHeight) => {
  const x = ((lng + 180) / 360) * canvasWidth
  const y = ((90 - lat) / 180) * canvasHeight
  return { x, y }
}

const canvasToLatLng = (x, y, canvasWidth, canvasHeight) => {
  const lng = (x / canvasWidth) * 360 - 180
  const lat = 90 - (y / canvasHeight) * 180
  return { lat, lng }
}

const generateRandomAircraft = (customPos = null) => {
  const id = Date.now() + Math.random()
  const position = customPos || {
    lat: Math.random() * 180 - 90,  // -90 to 90
    lng: Math.random() * 360 - 180  // -180 to 180
  }
  
  return {
    id,
    name: `${airlines[Math.floor(Math.random() * airlines.length)]} ${Math.floor(Math.random() * 9000 + 1000)}`,
    type: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
    position,
    altitude: Math.random() * 12000 + 1000, // 1000-13000m
    speed: Math.random() * 900 + 200, // 200-1100 km/h
    heading: Math.random() * 360, // 0-360 degrees
    status: Math.random() > 0.1 ? 'active' : 'warning'
  }
}

const updateAircraftPositions = () => {
  aircraftList.value.forEach(aircraft => {
    // Update position based on speed and heading
    const speedMs = aircraft.speed / 3.6 // km/h to m/s
    const distanceKm = (speedMs * 2) / 1000 // distance in 2 seconds in km
    
    // Convert to lat/lng changes (very simplified)
    const latChange = (distanceKm / 111) * Math.cos(toRadians(aircraft.heading))
    const lngChange = (distanceKm / 111) * Math.sin(toRadians(aircraft.heading)) / Math.cos(toRadians(aircraft.position.lat))
    
    aircraft.position.lat += latChange
    aircraft.position.lng += lngChange
    
    // Wrap longitude
    if (aircraft.position.lng > 180) aircraft.position.lng -= 360
    if (aircraft.position.lng < -180) aircraft.position.lng += 360
    
    // Bounce off poles
    if (aircraft.position.lat > 85 || aircraft.position.lat < -85) {
      aircraft.heading = (aircraft.heading + 180) % 360
    }
    
    // Small random variations
    aircraft.altitude += (Math.random() - 0.5) * 100
    aircraft.speed += (Math.random() - 0.5) * 20
    aircraft.heading += (Math.random() - 0.5) * 5
    
    // Keep within realistic bounds
    aircraft.altitude = Math.max(500, Math.min(15000, aircraft.altitude))
    aircraft.speed = Math.max(150, Math.min(1200, aircraft.speed))
    aircraft.heading = (aircraft.heading + 360) % 360
    
    // Random status changes
    if (Math.random() < 0.01) {
      aircraft.status = aircraft.status === 'active' ? 'warning' : 'active'
    }
  })
}

const drawWorldMap = () => {
  if (!ctx) return
  
  const canvas = mapCanvas.value
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  // Draw ocean background
  ctx.fillStyle = '#1a365d'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  
  // Draw grid lines
  ctx.strokeStyle = '#2d3748'
  ctx.lineWidth = 1
  ctx.setLineDash([2, 2])
  
  // Latitude lines
  for (let lat = -90; lat <= 90; lat += 30) {
    const y = ((90 - lat) / 180) * canvas.height
    ctx.beginPath()
    ctx.moveTo(0, y)
    ctx.lineTo(canvas.width, y)
    ctx.stroke()
  }
  
  // Longitude lines
  for (let lng = -180; lng <= 180; lng += 30) {
    const x = ((lng + 180) / 360) * canvas.width
    ctx.beginPath()
    ctx.moveTo(x, 0)
    ctx.lineTo(x, canvas.height)
    ctx.stroke()
  }
  
  ctx.setLineDash([])
  
  // Draw simplified continents
  ctx.fillStyle = '#2d5016'
  ctx.strokeStyle = '#4a7c59'
  ctx.lineWidth = 1
  
  // Draw major landmasses (very simplified rectangles)
  const landmasses = [
    // Asia
    { lat1: 10, lng1: 60, lat2: 70, lng2: 180 },
    // Europe
    { lat1: 35, lng1: -10, lat2: 70, lng2: 60 },
    // Africa
    { lat1: -35, lng1: -20, lat2: 35, lng2: 55 },
    // North America
    { lat1: 25, lng1: -170, lat2: 75, lng2: -50 },
    // South America
    { lat1: -55, lng1: -85, lat2: 15, lng2: -35 },
    // Australia
    { lat1: -45, lng1: 110, lat2: -10, lng2: 155 }
  ]
  
  landmasses.forEach(land => {
    const topLeft = latLngToCanvas(land.lat2, land.lng1, canvas.width, canvas.height)
    const bottomRight = latLngToCanvas(land.lat1, land.lng2, canvas.width, canvas.height)
    
    ctx.fillRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
    ctx.strokeRect(topLeft.x, topLeft.y, bottomRight.x - topLeft.x, bottomRight.y - topLeft.y)
  })
  
  // Highlight Indonesia region
  ctx.fillStyle = '#3d5a2b'
  ctx.strokeStyle = '#5a8a3a'
  ctx.lineWidth = 2
  
  const indonesiaTopLeft = latLngToCanvas(8, 92, canvas.width, canvas.height)
  const indonesiaBottomRight = latLngToCanvas(-12, 142, canvas.width, canvas.height)
  
  ctx.fillRect(indonesiaTopLeft.x, indonesiaTopLeft.y, 
               indonesiaBottomRight.x - indonesiaTopLeft.x, 
               indonesiaBottomRight.y - indonesiaTopLeft.y)
  ctx.strokeRect(indonesiaTopLeft.x, indonesiaTopLeft.y, 
                 indonesiaBottomRight.x - indonesiaTopLeft.x, 
                 indonesiaBottomRight.y - indonesiaTopLeft.y)
}

const drawAircraft = () => {
  if (!ctx) return
  
  const canvas = mapCanvas.value
  
  aircraftList.value.forEach(aircraft => {
    const pos = latLngToCanvas(aircraft.position.lat, aircraft.position.lng, canvas.width, canvas.height)
    
    // Skip if outside canvas
    if (pos.x < 0 || pos.x > canvas.width || pos.y < 0 || pos.y > canvas.height) return
    
    ctx.save()
    
    // Aircraft color based on status
    const color = aircraft.status === 'active' ? '#00ff00' : '#ffaa00'
    
    // Draw aircraft icon (triangle pointing in heading direction)
    ctx.translate(pos.x, pos.y)
    ctx.rotate(toRadians(aircraft.heading))
    
    ctx.fillStyle = color
    ctx.strokeStyle = '#ffffff'
    ctx.lineWidth = 1
    
    ctx.beginPath()
    ctx.moveTo(0, -8)
    ctx.lineTo(-4, 6)
    ctx.lineTo(4, 6)
    ctx.closePath()
    ctx.fill()
    ctx.stroke()
    
    ctx.restore()
    
    // Draw aircraft label
    ctx.fillStyle = '#ffffff'
    ctx.font = '10px Arial'
    ctx.textAlign = 'center'
    ctx.fillText(aircraft.name.split(' ').pop(), pos.x, pos.y - 12)
    
    // Draw altitude
    ctx.font = '8px Arial'
    ctx.fillStyle = '#cccccc'
    ctx.fillText(`${aircraft.altitude.toFixed(0)}m`, pos.x, pos.y + 20)
  })
}

const render = () => {
  drawWorldMap()
  drawAircraft()
  animationFrame = requestAnimationFrame(render)
}

// Event handlers
const toggleTracking = () => {
  isTracking.value = !isTracking.value
  
  if (isTracking.value) {
    updateInterval = setInterval(() => {
      updateAircraftPositions()
      lastUpdate.value = new Date().toLocaleTimeString()
    }, 2000)
  } else {
    if (updateInterval) {
      clearInterval(updateInterval)
      updateInterval = null
    }
  }
}

const addRandomAircraft = () => {
  aircraftList.value.push(generateRandomAircraft())
}

const removeAircraft = (id) => {
  const index = aircraftList.value.findIndex(a => a.id === id)
  if (index !== -1) {
    aircraftList.value.splice(index, 1)
  }
}

const clearAllAircraft = () => {
  aircraftList.value = []
}

const onMouseMove = (event) => {
  const canvas = mapCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  
  const coords = canvasToLatLng(x, y, canvas.width, canvas.height)
  mouseCoords.value = coords
}

const onCanvasClick = (event) => {
  const canvas = mapCanvas.value
  const rect = canvas.getBoundingClientRect()
  const x = (event.clientX - rect.left) * (canvas.width / rect.width)
  const y = (event.clientY - rect.top) * (canvas.height / rect.height)
  
  const coords = canvasToLatLng(x, y, canvas.width, canvas.height)
  aircraftList.value.push(generateRandomAircraft(coords))
}

const getAircraftStatusColor = (aircraft) => {
  return aircraft.status === 'active' ? 'border-green-500' : 'border-yellow-500'
}

// Lifecycle
onMounted(() => {
  const canvas = mapCanvas.value
  ctx = canvas.getContext('2d')
  
  // Initialize with some sample aircraft
  for (let i = 0; i < 5; i++) {
    aircraftList.value.push(generateRandomAircraft())
  }
  
  // Start rendering
  render()
  
  // Auto start tracking
  toggleTracking()
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
  if (animationFrame) cancelAnimationFrame(animationFrame)
})
</script>
