import { toRadians } from './coordinates'

export const updateAircraftPositions = (aircraftList) => {
  aircraftList.forEach(aircraft => {
    const speedMs = aircraft.speed / 3.6
    const distanceKm = (speedMs * 2) / 1000
    
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
    
    // Random variations
    aircraft.altitude += (Math.random() - 0.5) * 100
    aircraft.speed += (Math.random() - 0.5) * 20
    aircraft.heading += (Math.random() - 0.5) * 5
    
    // Keep within bounds
    aircraft.altitude = Math.max(500, Math.min(15000, aircraft.altitude))
    aircraft.speed = Math.max(150, Math.min(1200, aircraft.speed))
    aircraft.heading = (aircraft.heading + 360) % 360
    
    // Random status changes
    if (Math.random() < 0.01) {
      aircraft.status = aircraft.status === 'active' ? 'warning' : 'active'
    }
  })
}