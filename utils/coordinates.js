export const toRadians = (degrees) => degrees * Math.PI / 180
export const toDegrees = (radians) => radians * 180 / Math.PI

export const latLngToCanvas = (lat, lng, canvasWidth, canvasHeight) => {
  const x = ((lng + 180) / 360) * canvasWidth
  const y = ((90 - lat) / 180) * canvasHeight
  return { x, y }
}

export const canvasToLatLng = (x, y, canvasWidth, canvasHeight) => {
  const lng = (x / canvasWidth) * 360 - 180
  const lat = 90 - (y / canvasHeight) * 180
  return { lat, lng }
}