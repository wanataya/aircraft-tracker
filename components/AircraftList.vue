<template>
  <div class="bg-gray-800 p-4 rounded-lg">
    <h2 class="text-xl font-semibold mb-4">Aircraft Status</h2>
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AircraftCard 
        v-for="aircraft in aircraftList" 
        :key="aircraft.id"
        :aircraft="aircraft"
        @remove="$emit('remove-aircraft', aircraft.id)"
      />
    </div>
  </div>
</template>

<script setup>
defineProps({
  aircraftList: Array
})

defineEmits(['remove-aircraft'])
</script>