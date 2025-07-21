const aircraftTypes = [
  'Boeing 737', 'Airbus A320', 'Boeing 777', 'Airbus A380', 
  'Boeing 787', 'Embraer E190', 'Cessna 172', 'Boeing 747'
]

const airlines = [
  'Garuda Indonesia', 'Lion Air', 'Sriwijaya Air', 'Citilink',
  'Singapore Airlines', 'Emirates', 'Qatar Airways', 'AirAsia'
]

export const generateRandomAircraft = (customPos = null) => {
  const id = Date.now() + Math.random()
  const position = customPos || {
    lat: Math.random() * 180 - 90,
    lng: Math.random() * 360 - 180
  }
  
  return {
    id,
    name: `${airlines[Math.floor(Math.random() * airlines.length)]} ${Math.floor(Math.random() * 9000 + 1000)}`,
    type: aircraftTypes[Math.floor(Math.random() * aircraftTypes.length)],
    position,
    altitude: Math.random() * 12000 + 1000,
    speed: Math.random() * 900 + 200,
    heading: Math.random() * 360,
    status: Math.random() > 0.1 ? 'active' : 'warning'
  }
}