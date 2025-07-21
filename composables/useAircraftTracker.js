import { ref, onMounted, onUnmounted } from 'vue'
import { generateRandomAircraft } from '~/utils/aircraft-generator'
import { updateAircraftPositions } from '~/utils/aircraft-updater'

export const useAircraftTracker = () => {
  const aircraftList = ref([])
  const isTracking = ref(false)
  const lastUpdate = ref('')
  
  let updateInterval = null

  const toggleTracking = () => {
    isTracking.value = !isTracking.value
    
    if (isTracking.value) {
      updateInterval = setInterval(() => {
        updateAircraftPositions(aircraftList.value)
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

  // Initialize with sample aircraft
  onMounted(() => {
    for (let i = 0; i < 5; i++) {
      aircraftList.value.push(generateRandomAircraft())
    }
    toggleTracking()
  })

  onUnmounted(() => {
    if (updateInterval) clearInterval(updateInterval)
  })

  return {
    aircraftList,
    isTracking,
    lastUpdate,
    toggleTracking,
    addRandomAircraft,
    addAircraftAtPosition,
    removeAircraft,
    clearAllAircraft
  }
}