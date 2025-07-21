<template>
  <div 
    class="bg-gray-700 p-3 rounded border-l-4"
    :class="getStatusColor(aircraft.status)"
  >
    <div class="flex justify-between items-start">
      <div>
        <h3 class="font-semibold">{{ aircraft.name }}</h3>
        <p class="text-sm text-gray-300">{{ aircraft.type }}</p>
        <div class="text-xs text-gray-400 mt-1">
          <div>Lat: {{ aircraft.position.lat.toFixed(4) }}</div>
          <div>Lng: {{ aircraft.position.lng.toFixed(4) }}</div>
          <div>Alt: {{ aircraft.altitude.toFixed(0) }}m</div>
          <div>Speed: {{ aircraft.speed.toFixed(0) }} km/h</div>
          <div>Heading: {{ aircraft.heading.toFixed(0) }}°</div>
        </div>
      </div>
      <button 
        @click="$emit('remove')"
        class="text-red-400 hover:text-red-300 text-sm"
      >
        ✕
      </button>
    </div>
  </div>
</template>

<script setup>
defineProps({
  aircraft: Object
})

defineEmits(['remove'])

const getStatusColor = (status) => {
  return status === 'active' ? 'border-green-500' : 'border-yellow-500'
}
</script>
