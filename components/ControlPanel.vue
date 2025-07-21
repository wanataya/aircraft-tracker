<template>
  <div class="min-h-screen bg-gray-900">
    <div class="container mx-auto p-4">
      <h1 class="text-3xl font-bold text-center mb-6 text-white">
        Aircraft Tracking System
      </h1>
      
      <ControlPanel 
        :is-tracking="isTracking"
        :aircraft-count="aircraftList.length"
        :last-update="lastUpdate"
        @toggle-tracking="toggleTracking"
        @add-aircraft="addRandomAircraft"
        @clear-aircraft="clearAllAircraft"
      />
      
      <AircraftMap 
        :aircraft-list="aircraftList"
        @add-aircraft="addAircraftAtPosition"
      />
      
      <AircraftList 
        :aircraft-list="aircraftList"
        @remove-aircraft="removeAircraft"
      />
    </div>
  </div>
</template>

<script setup>
const {
  aircraftList,
  isTracking,
  lastUpdate,
  toggleTracking,
  addRandomAircraft,
  addAircraftAtPosition,
  removeAircraft,
  clearAllAircraft
} = useAircraftTracker()
</script>