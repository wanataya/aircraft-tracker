import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  // Simulasi data dari external API atau database
  const mockAircraftData = [
    {
      id: 'GA001',
      name: 'Garuda Indonesia 001',
      type: 'Boeing 777-300ER',
      position: { lat: -6.1256, lng: 106.6559 }, // Jakarta
      altitude: 11000,
      speed: 875,
      heading: 90,
      status: 'active',
      route: { from: 'CGK', to: 'DPS' },
      lastUpdate: new Date().toISOString()
    },
    {
      id: 'LNI123',
      name: 'Lion Air 123',
      type: 'Boeing 737-900ER',
      position: { lat: -7.7956, lng: 110.3695 }, // Yogyakarta
      altitude: 9500,
      speed: 720,
      heading: 180,
      status: 'active',
      route: { from: 'JOG', to: 'PLM' },
      lastUpdate: new Date().toISOString()
    }
  ]
  
  return {
    success: true,
    data: mockAircraftData,
    timestamp: new Date().toISOString()
  }
})
