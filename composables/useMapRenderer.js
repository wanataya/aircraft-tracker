import { ref } from 'vue'
import { latLngToCanvas, canvasToLatLng } from '~/utils/coordinates'
import { drawWorldMap, drawAircraft } from '~/utils/map-drawer'

export const useMapRenderer = () => {
  const mouseCoords = ref({ lat: 0, lng: 0 })
  
  let ctx = null
  let canvas = null
  let animationFrame = null

  const initializeCanvas = (canvasElement) => {
    canvas = canvasElement
    ctx = canvas.getContext('2d')
    render()
  }

  const render = () => {
    if (!ctx || !canvas) return
    
    drawWorldMap(ctx, canvas)
    drawAircraft(ctx, canvas, aircraftList?.value || [])
    
    animationFrame = requestAnimationFrame(render)
  }

  const stopRendering = () => {
    if (animationFrame) {
      cancelAnimationFrame(animationFrame)
    }
  }

  const onMouseMove = (event) => {
    if (!canvas) return
    
    const rect = canvas.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvas.width / rect.width)
    const y = (event.clientY - rect.top) * (canvas.height / rect.height)
    
    mouseCoords.value = canvasToLatLng(x, y, canvas.width, canvas.height)
  }

  const onCanvasClick = (event, canvasElement) => {
    const rect = canvasElement.getBoundingClientRect()
    const x = (event.clientX - rect.left) * (canvasElement.width / rect.width)
    const y = (event.clientY - rect.top) * (canvasElement.height / rect.height)
    
    return canvasToLatLng(x, y, canvasElement.width, canvasElement.height)
  }

  return {
    mouseCoords,
    initializeCanvas,
    render,
    stopRendering,
    onMouseMove,
    onCanvasClick
  }
}
