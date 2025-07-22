<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-white">Indonesia Aircraft Tracker</h3>
      <div class="text-xs text-gray-400">
        Drag to pan • Scroll to zoom • Click to add aircraft
      </div>
    </div>
    
    <div class="relative">
      <ClientOnly>
        <div 
          ref="mapContainer" 
          class="w-full h-[700px] border border-gray-600 rounded bg-gray-900"
          style="min-height: 700px;"
        ></div>
        <template #fallback>
          <div class="w-full h-[700px] border border-gray-600 rounded bg-gray-900 flex items-center justify-center">
            <div class="text-white">Loading Map...</div>
          </div>
        </template>
      </ClientOnly>
      
      <!-- Error display -->
      <div v-if="mapError" class="absolute inset-0 bg-red-900 bg-opacity-80 flex items-center justify-center rounded z-50">
        <div class="text-white text-center p-4">
          <div class="text-lg font-bold mb-2">Map Load Error</div>
          <div class="text-sm mb-4">{{ mapError }}</div>
          <button @click="retryMapLoad" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded">
            Retry
          </button>
        </div>
      </div>
      
      <!-- Loading indicator -->
      <div v-if="isLoading" class="absolute inset-0 bg-gray-900 bg-opacity-80 flex items-center justify-center rounded z-40">
        <div class="text-white text-center">
          <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
          <div>Loading Map...</div>
        </div>
      </div>
    </div>
    
    <div class="text-xs text-gray-400 mt-2" v-if="mouseCoords.lat">
      Mouse: {{ mouseCoords.lat.toFixed(4) }}, {{ mouseCoords.lng.toFixed(4) }} | Click to add aircraft
    </div>
    
    <!-- Debug info -->
    <div class="text-xs text-gray-500 mt-2">
      Debug: Container loaded: {{ !!mapContainer }}, Map initialized: {{ !!map }}, Loading: {{ isLoading }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  aircraftList: Array
})

const emit = defineEmits(['add-aircraft'])

const mapContainer = ref(null)
const mouseCoords = ref({ lat: 0, lng: 0 })
const isLoading = ref(false)
const mapError = ref('')

let map
let L
let aircraftMarkers = []

// Indonesia bounds and center
const INDONESIA_BOUNDS = [
  [-11.0, 95.0], // Southwest
  [6.0, 141.0]   // Northeast
]

const INDONESIA_CENTER = [-2.5, 118.0]

const initLeafletMap = async () => {
  if (!process.client) {
    console.log('Not on client side, skipping map initialization')
    return
  }
  
  isLoading.value = true
  mapError.value = ''
  
  try {
    console.log('Starting Leaflet initialization...')
    
    // Wait for DOM to be ready
    await nextTick()
    
    if (!mapContainer.value) {
      throw new Error('Map container not found in DOM')
    }
    
    console.log('Map container found:', mapContainer.value)
    
    // Dynamic import for client-side only
    console.log('Importing Leaflet...')
    const leafletModule = await import('leaflet')
    L = leafletModule.default || leafletModule
    
    console.log('Leaflet imported successfully:', !!L)
    
    // Fix for default markers (common Leaflet issue)
    if (L.Icon && L.Icon.Default) {
      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      })
    }
    
    await initMap()
    console.log('Map initialized successfully')
    
  } catch (error) {
    console.error('Error initializing map:', error)
    mapError.value = `Failed to load map: ${error.message}`
  } finally {
    isLoading.value = false
  }
}

const initMap = async () => {
  try {
    console.log('Creating Leaflet map with container:', mapContainer.value)
    
    // Create map focused on Indonesia
    map = L.map(mapContainer.value, {
      center: INDONESIA_CENTER,
      zoom: 5,
      zoomControl: true,
      attributionControl: true
    })
    
    console.log('Map object created:', !!map)
    
    // Add OpenStreetMap tile layer
    const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 18,
      crossOrigin: true
    })
    
    tileLayer.addTo(map)
    console.log('Tile layer added')
    
    // Wait a bit for the map to render
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Force map to resize and update
    map.invalidateSize()
    
    // Add Indonesia airspace boundaries
    addIndonesianAirspace()
    
    // Add major airports
    addMajorAirports()
    
    // Setup mouse interaction
    setupMouseInteraction()
    
    console.log('Map fully initialized')
    
  } catch (error) {
    console.error('Error in initMap:', error)
    throw error
  }
}

const addIndonesianAirspace = () => {
  if (!map || !L) return
  
  try {
    // Indonesian FIR boundary
    const firBoundary = L.rectangle([
      [-11.0, 95.0],
      [6.0, 141.0]
    ], {
      color: '#ff0000',
      fillColor: '#ff0000',
      fillOpacity: 0.1,
      weight: 2,
      dashArray: '5, 5'
    }).addTo(map)
    
    firBoundary.bindPopup('Indonesian Flight Information Region (FIR)')
    
    console.log('Indonesian airspace added')
  } catch (error) {
    console.error('Error adding airspace:', error)
  }
}

const addMajorAirports = () => {
  if (!map || !L) return
  
  try {
    const majorAirports = [
      { 
        name: 'Soekarno-Hatta International (CGK)', 
        code: 'CGK',
        coords: [-6.1256, 106.6558],
        elevation: 112 // feet
      },
      { 
        name: 'Ngurah Rai International (DPS)', 
        code: 'DPS',
        coords: [-8.7467, 115.1673],
        elevation: 13 // feet
      },
      { 
        name: 'Juanda International (MLG)', 
        code: 'MLG',
        coords: [-7.3797, 112.7874],
        elevation: 10 // feet
      },
      { 
        name: 'Sultan Hasanuddin (UPG)', 
        code: 'UPG',
        coords: [-5.0617, 119.5547],
        elevation: 46 // feet
      },
      { 
        name: 'Kualanamu International (KNO)', 
        code: 'KNO',
        coords: [3.6425, 98.8851],
        elevation: 75 // feet
      }
    ]
    
    majorAirports.forEach(airport => {
      // Create simple circle marker for airports
      const marker = L.circleMarker(airport.coords, {
        radius: 8,
        fillColor: '#fbbf24',
        color: '#000',
        weight: 2,
        opacity: 1,
        fillOpacity: 0.8
      }).addTo(map)
      
      marker.bindPopup(`
        <div style="font-family: Arial, sans-serif; font-size: 12px;">
          <h3 style="margin: 0 0 8px 0; color: #2563eb;">${airport.name}</h3>
          <p style="margin: 0;"><strong>IATA Code:</strong> ${airport.code}</p>
          <p style="margin: 0;"><strong>Elevation:</strong> ${airport.elevation} ft</p>
          <p style="margin: 0;"><strong>Coordinates:</strong> ${airport.coords[0].toFixed(4)}, ${airport.coords[1].toFixed(4)}</p>
        </div>
      `)
    })
    
    console.log('Major airports added')
  } catch (error) {
    console.error('Error adding airports:', error)
  }
}

const createAircraftMarker = (aircraft) => {
  if (!map || !L) return null
  
  // Create simple circle marker with color based on status
  const marker = L.circleMarker([aircraft.position.lat, aircraft.position.lng], {
    radius: 6,
    fillColor: aircraft.status === 'active' ? '#10b981' : '#f59e0b',
    color: '#fff',
    weight: 2,
    opacity: 1,
    fillOpacity: 0.8
  }).addTo(map)
  
  marker.bindPopup(`
    <div style="font-family: Arial, sans-serif; font-size: 12px;">
      <h3 style="margin: 0 0 8px 0; color: #059669;">${aircraft.name}</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 2px 4px;"><strong>Status:</strong></td><td style="padding: 2px 4px; color: ${aircraft.status === 'active' ? '#10b981' : '#f59e0b'}">${aircraft.status.toUpperCase()}</td></tr>
        <tr><td style="padding: 2px 4px;"><strong>Altitude:</strong></td><td style="padding: 2px 4px;">${aircraft.altitude.toFixed(0)} ft</td></tr>
        <tr><td style="padding: 2px 4px;"><strong>Speed:</strong></td><td style="padding: 2px 4px;">${aircraft.speed.toFixed(0)} kts</td></tr>
        <tr><td style="padding: 2px 4px;"><strong>Heading:</strong></td><td style="padding: 2px 4px;">${aircraft.heading.toFixed(0)}°</td></tr>
        <tr><td style="padding: 2px 4px;"><strong>Position:</strong></td><td style="padding: 2px 4px;">${aircraft.position.lat.toFixed(4)}, ${aircraft.position.lng.toFixed(4)}</td></tr>
      </table>
    </div>
  `)
  
  return marker
}

const updateAircraftMarkers = () => {
  // Remove existing markers
  aircraftMarkers.forEach(marker => {
    if (map && marker) {
      map.removeLayer(marker)
    }
  })
  aircraftMarkers = []
  
  // Add new markers
  if (props.aircraftList && map) {
    props.aircraftList.forEach(aircraft => {
      const marker = createAircraftMarker(aircraft)
      if (marker) {
        aircraftMarkers.push(marker)
      }
    })
  }
}

const setupMouseInteraction = () => {
  if (!map || !L) return
  
  try {
    // Mouse move for coordinates
    map.on('mousemove', (e) => {
      mouseCoords.value = {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      }
    })
    
    // Click to add aircraft
    map.on('click', (e) => {
      emit('add-aircraft', {
        lat: e.latlng.lat,
        lng: e.latlng.lng
      })
    })
    
    console.log('Mouse interaction setup complete')
  } catch (error) {
    console.error('Error setting up mouse interaction:', error)
  }
}

const retryMapLoad = () => {
  console.log('Retrying map load...')
  if (map) {
    map.remove()
    map = null
  }
  mapError.value = ''
  initLeafletMap()
}

// Watchers
watch(() => props.aircraftList, updateAircraftMarkers, { deep: true })

// Lifecycle
onMounted(async () => {
  console.log('Component mounted, waiting before initializing map...')
  // Wait a bit to ensure DOM is fully ready
  setTimeout(async () => {
    await initLeafletMap()
  }, 100)
})

onUnmounted(() => {
  console.log('Component unmounting, cleaning up map...')
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<style>
/* Import Leaflet CSS from CDN */
@import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

/* Ensure map container has proper styling */
.leaflet-container {
  height: 100% !important;
  width: 100% !important;
  background: #1f2937;
}

/* Fix for map container */
div[ref="mapContainer"] {
  height: 700px !important;
  width: 100% !important;
}
</style>