import { defineEventHandler } from 'h3'

export default defineEventHandler(async (event) => {
  const indonesianAirports = [
    { code: 'CGK', name: 'Soekarno-Hatta International', city: 'Jakarta', lat: -6.1256, lng: 106.6559 },
    { code: 'DPS', name: 'Ngurah Rai International', city: 'Denpasar', lat: -8.7467, lng: 115.1671 },
    { code: 'JOG', name: 'Yogyakarta International', city: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
    { code: 'PLM', name: 'Sultan Mahmud Badaruddin II', city: 'Palembang', lat: -2.8989, lng: 104.7019 },
    { code: 'BPN', name: 'Sultan Aji Muhammad Sulaiman', city: 'Balikpapan', lat: -1.2683, lng: 116.8938 },
    { code: 'MLG', name: 'Abdul Rachman Saleh', city: 'Malang', lat: -7.9266, lng: 112.7144 },
    { code: 'PKU', name: 'Sultan Syarif Kasim II', city: 'Pekanbaru', lat: 0.4606, lng: 101.4447 },
    { code: 'BDO', name: 'Husein Sastranegara', city: 'Bandung', lat: -6.9006, lng: 107.5761 }
  ]
  
  return {
    success: true,
    data: indonesianAirports
  }
})


