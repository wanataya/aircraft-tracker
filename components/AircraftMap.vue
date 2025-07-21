<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <canvas 
      ref="mapCanvas" 
      width="1200" 
      height="600" 
      class="w-full border border-gray-600 rounded"
      @mousemove="onMouseMove"
      @click="onCanvasClick"
    ></canvas>
    <MouseTracker :mouse-coords="mouseCoords" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'

const props = defineProps({
  aircraftList: Array
})

const emit = defineEmits(['add-aircraft'])

const mapCanvas = ref(null)
const mouseCoords = ref({ lat: 0, lng: 0 })

const { 
  initializeCanvas, 
  render, 
  stopRendering,
  onMouseMove,
  onCanvasClick: handleCanvasClick 
} = useMapRenderer()

const onCanvasClick = (event) => {
  const coords = handleCanvasClick(event, mapCanvas.value)
  emit('add-aircraft', coords)
}

// Watch for aircraft changes and re-render
watch(() => props.aircraftList, render, { deep: true })

onMounted(() => {
  initializeCanvas(mapCanvas.value)
})

onUnmounted(() => {
  stopRendering()
})
</script>