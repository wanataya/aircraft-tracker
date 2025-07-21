<template>
  <div class="bg-gray-800 p-4 rounded-lg mb-4">
    <div 
      ref="mapContainer" 
      class="w-full h-[600px] border border-gray-600 rounded"
    ></div>
    <MouseTracker :mouse-coords="mouseCoords" />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'

const props = defineProps({
  aircraftList: Array
})

const mapContainer = ref(null)
const mouseCoords = ref({ lat: 0, lng: 0 })

let scene, camera, renderer, controls, animationId

const init3DScene = () => {
  scene = new THREE.Scene()

  const width = mapContainer.value.clientWidth
  const height = 600

  camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000)
  camera.position.set(150, 150, 150) // Move camera out of top-down!
  camera.lookAt(0, 0, 0)

  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(width, height)
  mapContainer.value.appendChild(renderer.domElement)

  controls = new OrbitControls(camera, renderer.domElement)
  controls.enableDamping = true

  // Light
  const ambient = new THREE.AmbientLight(0xffffff, 0.5)
  const directional = new THREE.DirectionalLight(0xffffff, 1)
  directional.position.set(100, 100, 100)
  scene.add(ambient, directional)

  // Ground
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(500, 500),
    new THREE.MeshStandardMaterial({ color: 0x444444 })
  )
  ground.rotation.x = -Math.PI / 2
  scene.add(ground)

  animate()
}

const renderAircraft = () => {
  // Remove previous aircraft (except light & ground)
  for (let i = scene.children.length - 1; i >= 0; i--) {
    const obj = scene.children[i]
    if (obj.type === 'Mesh' && obj.geometry.type === 'BoxGeometry') {
      scene.remove(obj)
    }
  }

  props.aircraftList.forEach(ac => {
    const box = new THREE.Mesh(
      new THREE.BoxGeometry(5, 2, 2),
      new THREE.MeshStandardMaterial({ color: 0x00ff00 })
    )
    box.position.set(ac.x, ac.altitude, ac.y)
    scene.add(box)
  })
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  controls.update()
  renderer.render(scene, camera)
}

onMounted(() => {
  init3DScene()
  renderAircraft()
})

watch(() => props.aircraftList, renderAircraft, { deep: true })

onUnmounted(() => {
  cancelAnimationFrame(animationId)
  renderer.dispose()
  mapContainer.value.innerHTML = ''
})
</script>
