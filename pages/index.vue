<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-center mb-6 text-white">
        Indonesia Aircraft Tracking System
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

      <!-- Aircraft Map -->
      <AircraftMap 
        :aircraft-list="aircraftList" 
        @add-aircraft="addAircraftAtPosition"
      />

      <!-- Aircraft List -->
      <div class="bg-gray-800 p-4 rounded-lg">
        <h2 class="text-xl font-semibold mb-4 text-white">Aircraft Status</h2>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div 
            v-for="aircraft in aircraftList" 
            :key="aircraft.id"
            class="bg-gray-700 p-3 rounded border-l-4"
            :class="getAircraftStatusColor(aircraft)"
          >
            <div class="flex justify-between items-start">
              <div>
                <h3 class="font-semibold text-white">{{ aircraft.name }}</h3>
                <p class="text-sm text-gray-300">{{ aircraft.type }}</p>
                <p class="text-xs text-gray-400 mt-1">
                  Lat: {{ aircraft.position.lat.toFixed(4) }}<br>
                  Lng: {{ aircraft.position.lng.toFixed(4) }}<br>
                  Alt: {{ aircraft.altitude.toFixed(0) }} ft<br>
                  Speed: {{ aircraft.speed.toFixed(0) }} kts<br>
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
import AircraftMap from '~/components/AircraftMap.vue'

// Reactive data
const aircraftList = ref([])
const isTracking = ref(false)
const lastUpdate = ref('')

let updateInterval = null

// Aircraft types and airlines
const aircraftTypes = [
  'Boeing 737-800', 'Airbus A320', 'Boeing 777-300ER', 'Airbus A380', 
  'Boeing 787-9', 'Embraer E190', 'ATR 72-600', 'Boeing 747-8F'
]

const airlines = [
  'Garuda Indonesia', 'Lion Air', 'Sriwijaya Air', 'Citilink',
  'Singapore Airlines', 'Emirates', 'Qatar Airways', 'AirAsia'
]

// Utility functions
const toRadians = (degrees) => degrees * Math.PI / 180
const toDegrees = (radians) => radians * 180 / Math.PI

const generateRandomAircraft = (customPos = null) => {
  const id = Date.now() + Math.random()
  
  // Generate position within Indonesia bounds if no custom position
  const position = customPos || {
    lat: Math.random() * 17 - 11,    // -11 to 6 (Indonesia latitude range)
    lng: Math.random() * 46 + 95     // 95 to 141 (Indonesia longitude range)
  }
  
  return {
    id,
    name: `${airlines[Math.floor(Math.random() * airlines.length)]} ${Math.floor(Math.random() * 900 + 100)}`,
    type: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
    position,
    altitude: Math.random() * 38000 + 5000, // 5,000-43,000 ft (typical cruising altitudes)
    speed: Math.random() * 400 + 200,       // 200-600 kts (typical airliner speeds)
    heading: Math.random() * 360,           // 0-360 degrees
    status: Math.random() > 0.1 ? 'active' : 'warning'
  }
}

const updateAircraftPositions = () => {
  aircraftList.value.forEach(aircraft => {
    // Update position based on speed and heading
    const speedKts = aircraft.speed
    const speedKmh = speedKts * 1.852 // knots to km/h
    const speedMs = speedKmh / 3.6    // km/h to m/s
    const distanceKm = (speedMs * 2) / 1000 // distance in 2 seconds in km
    
    // Convert to lat/lng changes (simplified great circle calculation)
    const latChange = (distanceKm / 111) * Math.cos(toRadians(aircraft.heading))
    const lngChange = (distanceKm / 111) * Math.sin(toRadians(aircraft.heading)) / Math.cos(toRadians(aircraft.position.lat))
    
    aircraft.position.lat += latChange
    aircraft.position.lng += lngChange
    
    // Keep aircraft within Indonesia bounds roughly
    if (aircraft.position.lng > 141) aircraft.position.lng = 141
    if (aircraft.position.lng < 95) aircraft.position.lng = 95
    if (aircraft.position.lat > 6) aircraft.position.lat = 6
    if (aircraft.position.lat < -11) aircraft.position.lat = -11
    
    // Bounce off boundaries
    if (aircraft.position.lat >= 6 || aircraft.position.lat <= -11 ||
        aircraft.position.lng >= 141 || aircraft.position.lng <= 95) {
      aircraft.heading = (aircraft.heading + 180 + Math.random() * 60 - 30) % 360
    }
    
    // Small random variations for realistic movement
    aircraft.altitude += (Math.random() - 0.5) * 500  // ±250 ft variation
    aircraft.speed += (Math.random() - 0.5) * 20      // ±10 kts variation
    aircraft.heading += (Math.random() - 0.5) * 10    // ±5° heading variation
    
    // Keep within realistic bounds
    aircraft.altitude = Math.max(1000, Math.min(45000, aircraft.altitude))  // 1,000-45,000 ft
    aircraft.speed = Math.max(150, Math.min(650, aircraft.speed))           // 150-650 kts
    aircraft.heading = (aircraft.heading + 360) % 360
    
    // Random status changes (rare)
    if (Math.random() < 0.005) { // 0.5% chance per update
      aircraft.status = aircraft.status === 'active' ? 'warning' : 'active'
    }
  })
}

// Event handlers
const toggleTracking = () => {
  isTracking.value = !isTracking.value
  
  if (isTracking.value) {
    updateInterval = setInterval(() => {
      updateAircraftPositions()
      lastUpdate.value = new Date().toLocaleTimeString()
    }, 2000) // Update every 2 seconds
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

const addAircraftAtPosition = (position) => {
  aircraftList.value.push(generateRandomAircraft(position))
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

const getAircraftStatusColor = (aircraft) => {
  return aircraft.status === 'active' ? 'border-green-500' : 'border-yellow-500'
}

// Lifecycle
onMounted(() => {
  // Initialize with some sample aircraft within Indonesia
  for (let i = 0; i < 5; i++) {
    aircraftList.value.push(generateRandomAircraft())
  }
  
  // Auto start tracking
  toggleTracking()
})

onUnmounted(() => {
  if (updateInterval) clearInterval(updateInterval)
})
</script>