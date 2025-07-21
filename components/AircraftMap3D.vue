<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div class="flex justify-between items-center mb-4">
      <h3 class="text-lg font-semibold text-white">3D Global View</h3>
      <div class="text-xs text-gray-400">
        Use mouse to rotate • Wheel to zoom • Right-click to pan
      </div>
    </div>
    <div 
      ref="mapContainer" 
      class="w-full h-[700px] border border-gray-600 rounded bg-black"
      @click="onMapClick"
      @mousemove="onMouseMove"
    ></div>
    <div class="text-xs text-gray-400 mt-2" v-if="mouseCoords.lat">
      Mouse: {{ mouseCoords.lat.toFixed(4) }}, {{ mouseCoords.lng.toFixed(4) }} | Click to add aircraft
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'

const props = defineProps({
  aircraftList: Array
})

const emit = defineEmits(['add-aircraft'])

const mapContainer = ref(null)
const mouseCoords = ref({ lat: 0, lng: 0 })

let scene, camera, renderer, controls
let earth, atmosphere
let aircraftMeshes = []
let animationId
let raycaster, mouse

// Earth parameters
const EARTH_RADIUS = 100
const AIRCRAFT_HEIGHT_SCALE = 0.01 // Scale altitude to be visible

const init3DScene = () => {
  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000011)

  // Camera setup
  const width = mapContainer.value.clientWidth
  const height = 700
  camera = new THREE.PerspectiveCamera(60, width / height, 1, 10000)
  camera.position.set(200, 100, 200)
  camera.lookAt(0, 0, 0)

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(width, height)
  renderer.shadowMap.enabled = true
  renderer.shadowMap.type = THREE.PCFSoftShadowMap
  mapContainer.value.appendChild(renderer.domElement)

  // Simple orbital controls (manual implementation)
  setupControls()

  // Raycaster for mouse interaction
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Enhanced lighting for better texture visibility
  const ambientLight = new THREE.AmbientLight(0x404040, 0.6)
  scene.add(ambientLight)

  const sunLight = new THREE.DirectionalLight(0xffffff, 1.2)
  sunLight.position.set(500, 300, 200)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 4096
  sunLight.shadow.mapSize.height = 4096
  sunLight.shadow.camera.near = 0.5
  sunLight.shadow.camera.far = 2000
  scene.add(sunLight)
  
  // Add subtle fill light
  const fillLight = new THREE.DirectionalLight(0x4488ff, 0.3)
  fillLight.position.set(-200, -100, -200)
  scene.add(fillLight)

  // Add stars
  createStarField()

  // Create Earth
  createEarth()

  // Start animation loop
  animate()
}

const createStarField = () => {
  const starGeometry = new THREE.BufferGeometry()
  const starCount = 5000
  const positions = new Float32Array(starCount * 3)

  for (let i = 0; i < starCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 4000
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4000
    positions[i * 3 + 2] = (Math.random() - 0.5) * 4000
  }

  starGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  
  const starMaterial = new THREE.PointsMaterial({ 
    color: 0xffffff, 
    size: 2,
    sizeAttenuation: false 
  })
  
  const stars = new THREE.Points(starGeometry, starMaterial)
  scene.add(stars)
}

const createEarth = () => {
  // Earth sphere with higher resolution for better texture display
  const earthGeometry = new THREE.SphereGeometry(EARTH_RADIUS, 128, 64)
  
  // Texture loader
  const textureLoader = new THREE.TextureLoader()
  
  // Load realistic Earth textures
  const earthTexture = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/land_ocean_ice_cloud_2048.jpg',
    (texture) => {
      console.log('Earth texture loaded successfully')
    },
    (progress) => {
      console.log('Loading Earth texture...', Math.round(progress.loaded / progress.total * 100) + '%')
    },
    (error) => {
      console.error('Error loading Earth texture:', error)
      // Fallback to basic texture if loading fails
      createFallbackEarth()
      return
    }
  )
  
  // Normal map for surface detail
  const earthNormalMap = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/earth_normal_2048.jpg',
    undefined,
    undefined,
    (error) => {
      console.warn('Normal map failed to load, using without normal mapping')
    }
  )
  
  // Specular map for ocean reflection
  const earthSpecularMap = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/earth_specular_2048.jpg',
    undefined,
    undefined,
    (error) => {
      console.warn('Specular map failed to load, using basic material')
    }
  )
  
  // Create realistic Earth material
  const earthMaterial = new THREE.MeshPhongMaterial({
    map: earthTexture,
    normalMap: earthNormalMap,
    normalScale: new THREE.Vector2(0.5, 0.5),
    specularMap: earthSpecularMap,
    specular: new THREE.Color(0x222222),
    shininess: 25
  })
  
  earth = new THREE.Mesh(earthGeometry, earthMaterial)
  earth.receiveShadow = true
  earth.castShadow = true
  scene.add(earth)
  
  // Add realistic clouds layer
  createClouds()

  // Create realistic atmosphere
  createAtmosphere()

  // Add subtle grid lines (optional, can be toggled)
  // addGridLines()
}

const createFallbackEarth = () => {
  console.log('Using fallback Earth texture')
  // Fallback to canvas-generated texture if CDN fails
  const earthCanvas = document.createElement('canvas')
  earthCanvas.width = 2048
  earthCanvas.height = 1024
  const ctx = earthCanvas.getContext('2d')
  
  // Ocean base
  ctx.fillStyle = '#1e40af'
  ctx.fillRect(0, 0, 2048, 1024)
  
  // More detailed continents
  ctx.fillStyle = '#22c55e'
  
  // Africa
  ctx.fillRect(960, 350, 160, 300)
  // Europe
  ctx.fillRect(920, 240, 120, 120)
  // Asia
  ctx.fillRect(1040, 200, 400, 240)
  // North America
  ctx.fillRect(400, 200, 240, 300)
  // South America
  ctx.fillRect(560, 500, 160, 280)
  // Australia
  ctx.fillRect(1360, 600, 120, 80)
  
  // Highlight Indonesia region
  ctx.fillStyle = '#34d399'
  ctx.fillRect(1280, 440, 100, 60)

  const earthTexture = new THREE.CanvasTexture(earthCanvas)
  
  const earthMaterial = new THREE.MeshPhongMaterial({ 
    map: earthTexture
  })
  
  if (earth) {
    earth.material = earthMaterial
  }
}

const createClouds = () => {
  const textureLoader = new THREE.TextureLoader()
  
  // Load cloud texture
  const cloudTexture = textureLoader.load(
    'https://cdn.jsdelivr.net/gh/mrdoob/three.js@dev/examples/textures/earth_clouds_1024.png',
    undefined,
    undefined,
    (error) => {
      console.warn('Cloud texture failed to load')
      return
    }
  )
  
  // Create clouds geometry slightly larger than Earth
  const cloudsGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 1, 64, 64)
  const cloudsMaterial = new THREE.MeshLambertMaterial({
    map: cloudTexture,
    transparent: true,
    opacity: 0.4,
    depthWrite: false
  })
  
  const clouds = new THREE.Mesh(cloudsGeometry, cloudsMaterial)
  scene.add(clouds)
  
  // Store reference for animation
  scene.userData.clouds = clouds
}

const createAtmosphere = () => {
  // More realistic atmosphere with gradient
  const atmosphereGeometry = new THREE.SphereGeometry(EARTH_RADIUS + 8, 32, 32)
  
  // Create gradient atmosphere shader
  const atmosphereMaterial = new THREE.ShaderMaterial({
    uniforms: {
      time: { value: 0 }
    },
    vertexShader: `
      varying vec3 vNormal;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
      }
    `,
    fragmentShader: `
      varying vec3 vNormal;
      void main() {
        float intensity = pow(0.7 - dot(vNormal, vec3(0, 0, 1.0)), 2.0);
        gl_FragColor = vec4(0.3, 0.6, 1.0, 1.0) * intensity;
      }
    `,
    blending: THREE.AdditiveBlending,
    side: THREE.BackSide,
    transparent: true
  })
  
  atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial)
  scene.add(atmosphere)
}

const addGridLines = () => {
  const gridMaterial = new THREE.LineBasicMaterial({ 
    color: 0x444444, 
    transparent: true, 
    opacity: 0.3 
  })

  // Latitude lines
  for (let lat = -80; lat <= 80; lat += 20) {
    const latGeometry = new THREE.BufferGeometry()
    const latPoints = []
    for (let lng = 0; lng <= 360; lng += 5) {
      const pos = latLngToVector3(lat, lng, EARTH_RADIUS + 0.5)
      latPoints.push(pos.x, pos.y, pos.z)
    }
    latGeometry.setAttribute('position', new THREE.Float32BufferAttribute(latPoints, 3))
    const latLine = new THREE.Line(latGeometry, gridMaterial)
    scene.add(latLine)
  }

  // Longitude lines
  for (let lng = 0; lng < 360; lng += 20) {
    const lngGeometry = new THREE.BufferGeometry()
    const lngPoints = []
    for (let lat = -90; lat <= 90; lat += 5) {
      const pos = latLngToVector3(lat, lng, EARTH_RADIUS + 0.5)
      lngPoints.push(pos.x, pos.y, pos.z)
    }
    lngGeometry.setAttribute('position', new THREE.Float32BufferAttribute(lngPoints, 3))
    const lngLine = new THREE.Line(lngGeometry, gridMaterial)
    scene.add(lngLine)
  }
}

const latLngToVector3 = (lat, lng, radius) => {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  
  return new THREE.Vector3(
    -radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  )
}

const vector3ToLatLng = (vector) => {
  const radius = vector.length()
  const lat = 90 - Math.acos(vector.y / radius) * (180 / Math.PI)
  let lng = Math.atan2(vector.z, -vector.x) * (180 / Math.PI) - 180
  if (lng < -180) lng += 360
  if (lng > 180) lng -= 360
  return { lat, lng }
}

const createAircraftMesh = (aircraft) => {
  // Create aircraft geometry (simplified airplane shape)
  const aircraftGroup = new THREE.Group()
  
  // Fuselage
  const fuselageGeometry = new THREE.CylinderGeometry(0.3, 0.5, 4, 8)
  const fuselageMaterial = new THREE.MeshLambertMaterial({ 
    color: aircraft.status === 'active' ? 0x00ff00 : 0xffaa00 
  })
  const fuselage = new THREE.Mesh(fuselageGeometry, fuselageMaterial)
  fuselage.rotation.z = Math.PI / 2
  aircraftGroup.add(fuselage)
  
  // Wings
  const wingGeometry = new THREE.BoxGeometry(5, 0.2, 1)
  const wingMaterial = new THREE.MeshLambertMaterial({ color: 0x666666 })
  const wings = new THREE.Mesh(wingGeometry, wingMaterial)
  aircraftGroup.add(wings)
  
  // Position aircraft on Earth surface
  const altitude = EARTH_RADIUS + aircraft.altitude * AIRCRAFT_HEIGHT_SCALE
  const position = latLngToVector3(aircraft.position.lat, aircraft.position.lng, altitude)
  aircraftGroup.position.copy(position)
  
  // Orient aircraft
  const earthCenter = new THREE.Vector3(0, 0, 0)
  const up = position.clone().normalize()
  aircraftGroup.lookAt(earthCenter)
  aircraftGroup.rotateOnWorldAxis(up, aircraft.heading * Math.PI / 180)
  
  // Add label
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const context = canvas.getContext('2d')
  context.fillStyle = 'rgba(0, 0, 0, 0.7)'
  context.fillRect(0, 0, 256, 64)
  context.fillStyle = 'white'
  context.font = '16px Arial'
  context.textAlign = 'center'
  context.fillText(aircraft.name, 128, 25)
  context.fillText(`${aircraft.altitude.toFixed(0)}m`, 128, 45)
  
  const labelTexture = new THREE.CanvasTexture(canvas)
  const labelMaterial = new THREE.SpriteMaterial({ map: labelTexture })
  const label = new THREE.Sprite(labelMaterial)
  label.scale.set(8, 2, 1)
  label.position.set(0, 0, 3)
  aircraftGroup.add(label)
  
  aircraftGroup.userData = { aircraft }
  return aircraftGroup
}

const updateAircraftMeshes = () => {
  // Remove old aircraft meshes
  aircraftMeshes.forEach(mesh => {
    scene.remove(mesh)
  })
  aircraftMeshes = []
  
  // Create new aircraft meshes
  props.aircraftList.forEach(aircraft => {
    const mesh = createAircraftMesh(aircraft)
    scene.add(mesh)
    aircraftMeshes.push(mesh)
  })
}

let isMouseDown = false
let mouseX = 0
let mouseY = 0

const setupControls = () => {
  const canvas = renderer.domElement
  
  canvas.addEventListener('mousedown', (event) => {
    if (event.button === 0) { // Left mouse button
      isMouseDown = true
      mouseX = event.clientX
      mouseY = event.clientY
    }
  })
  
  canvas.addEventListener('mousemove', (event) => {
    if (isMouseDown) {
      const deltaX = event.clientX - mouseX
      const deltaY = event.clientY - mouseY
      
      // Rotate camera around earth
      const spherical = new THREE.Spherical()
      spherical.setFromVector3(camera.position)
      
      spherical.theta -= deltaX * 0.01
      spherical.phi += deltaY * 0.01
      spherical.phi = Math.max(0.1, Math.min(Math.PI - 0.1, spherical.phi))
      
      camera.position.setFromSpherical(spherical)
      camera.lookAt(0, 0, 0)
      
      mouseX = event.clientX
      mouseY = event.clientY
    }
  })
  
  canvas.addEventListener('mouseup', () => {
    isMouseDown = false
  })
  
  canvas.addEventListener('wheel', (event) => {
    const distance = camera.position.length()
    const newDistance = Math.max(150, Math.min(800, distance + event.deltaY * 0.5))
    camera.position.normalize().multiplyScalar(newDistance)
  })
}

const onMouseMove = (event) => {
  const rect = mapContainer.value.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1
  
  // Raycast to earth surface
  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObject(earth)
  
  if (intersects.length > 0) {
    const point = intersects[0].point
    const coords = vector3ToLatLng(point)
    mouseCoords.value = coords
  }
}

const onMapClick = (event) => {
  if (mouseCoords.value.lat !== undefined) {
    emit('add-aircraft', {
      lat: mouseCoords.value.lat,
      lng: mouseCoords.value.lng
    })
  }
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  
  // Slowly rotate earth
  if (earth) {
    earth.rotation.y += 0.001
  }
  
  // Rotate clouds slightly faster for realism
  if (scene.userData.clouds) {
    scene.userData.clouds.rotation.y += 0.0015
  }
  
  // Update atmosphere animation
  if (atmosphere && atmosphere.material.uniforms) {
    atmosphere.material.uniforms.time.value += 0.01
  }
  
  renderer.render(scene, camera)
}

// Watchers
watch(() => props.aircraftList, updateAircraftMeshes, { deep: true })

// Lifecycle
onMounted(() => {
  init3DScene()
  updateAircraftMeshes()
})

onUnmounted(() => {
  if (animationId) cancelAnimationFrame(animationId)
  if (renderer) {
    renderer.dispose()
    mapContainer.value.innerHTML = ''
  }
})
</script>