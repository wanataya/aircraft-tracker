<template>
  <div class="text-xs text-gray-400 mt-2">
    Mouse: {{ mouseCoords.lat.toFixed(4) }}, {{ mouseCoords.lng.toFixed(4) }} | 
    Click to add aircraft at cursor position
  </div>
</template>

<script setup>
defineProps({
  mouseCoords: Object
})
</script>