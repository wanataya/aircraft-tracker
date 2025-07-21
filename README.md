# Aircraft Tracking System

a cool, real-time plane tracking app made with Nuxt 3, Vue 3, and HTML5 Canvas. it’s got an interactive world map that shows planes moving live, plus a bunch of handy features to manage aircraft.

## Features

### 🛩️ Real-time Aircraft Tracking

- tracks planes in real-time with smooth flight paths
- planes move based on their speed and direction
- updates every 2 seconds
- planes bounce off polar regions like they would in real life

### 🗺️ Interactive World Map

- grid overlay with latitude/longitude lines
- special highlighting for Indonesia region
- shows mouse coordinates
- click to drop a new plane on the map

### ✈️ Aircraft Management

- add random planes with realistic info
- delete single planes
- wipe all planes with one click
- monitor plane status (Active or Warning)
- full details on each plane

### 📊 Real-time Data Display

- shows how many planes are up
- displays last update time
- details for each plane::
  - Position (Lat/Lng)
  - Altitude
  - Speed
  - Heading
  - Aircraft type and airline

## Technology Stack

- **Frontend Framework**: Nuxt 3 with Vue 3 Composition API
- **Styling**: Tailwind CSS
- **Graphics**: HTML5 Canvas API
- **State Management**: Vue 3 Reactivity System
- **Animation**: RequestAnimationFrame for smooth rendering

## Project Structure

```
aircraft-tracker/
├── components/
│   ├── AircraftMap.vue          # Canvas map component
│   ├── ControlPanel.vue         # Tracking controls
│   ├── AircraftList.vue         # Aircraft status display
│   └── MouseTracker.vue         # Mouse coordinate display
├── composables/
│   ├── useAircraft.js           # Aircraft data management
│   ├── useMapRenderer.js        # Canvas rendering logic
│   └── useTracking.js           # Position tracking system
├── utils/
│   ├── coordinates.js           # Coordinate conversion utilities
│   ├── aircraft-generator.js    # Aircraft data generation
│   └── map-data.js              # World map data
├── assets/
│   └── css/
│       └── main.css             # Global styles
├── pages/
│   └── index.vue                # Main application page
└── server/
    └── api/
        ├── aircraft.get.ts      # Aircraft data API
        └── airport.get.ts       # Airport data API
```

## Installation & Setup

### Prerequisites

- Node.js 16.10.0 or later
- npm or yarn package manager

### Installation Steps

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd aircraft-tracker
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Run in development mode**

   ```bash
   npm run dev
   ```

4. **Build for production**

   ```bash
   npm run build
   ```

5. **Preview production build**
   ```bash
   npm run preview
   ```

## Usage Guide

### Basic Operations

1. **Start/Stop Tracking**: Use the green/red button to toggle real-time updates
2. **Add Aircraft**: Click "Add Aircraft" for random placement or click anywhere on the map
3. **Remove Aircraft**: Click the "✕" button on any aircraft card
4. **Clear All**: Remove all aircraft from the tracking system

### Map Interaction

- **Mouse Movement**: Shows real-time lat/lng coordinates
- **Click to Add**: Click anywhere on the map to add an aircraft at that location
- **Visual Feedback**: Aircraft appear as colored triangles pointing in their heading direction

### Aircraft Information

Each aircraft displays:

- **Name**: Airline and flight number
- **Type**: Aircraft model (Boeing 737, Airbus A320, etc.)
- **Position**: Latitude and longitude coordinates
- **Altitude**: Current flight level in meters
- **Speed**: Ground speed in km/h
- **Heading**: Direction of travel in degrees

## Configuration

### Tracking Settings

```javascript
// Update frequency (milliseconds)
const UPDATE_INTERVAL = 2000;

// Animation frame rate
const ANIMATION_FPS = 60;
```

### Aircraft Parameters

```javascript
// Altitude range (meters)
const ALTITUDE_RANGE = { min: 1000, max: 13000 };

// Speed range (km/h)
const SPEED_RANGE = { min: 200, max: 1100 };

// Number of initial aircraft
const INITIAL_AIRCRAFT_COUNT = 5;
```

## API Endpoints

### GET /api/aircraft

Returns list of active aircraft with their current positions and status.

### GET /api/airport

Returns airport information and runway data.

## Customization

### Adding New Aircraft Types

Edit `utils/aircraft-generator.js`:

```javascript
const aircraftTypes = [
  "Boeing 737",
  "Airbus A320",
  // Add new types here
];
```

### Modifying Map Appearance

Edit `composables/useMapRenderer.js` to customize:

- Colors and styling
- Grid density
- Continent shapes
- Special regions

### Extending Aircraft Data

Add new properties in `composables/useAircraft.js`:

```javascript
const generateAircraft = () => ({
  // Existing properties...
  fuel: Math.random() * 100,
  passengers: Math.floor(Math.random() * 300),
  // New properties here
});
```

## Performance Considerations

- **Canvas Optimization**: Uses requestAnimationFrame for smooth 60fps rendering
- **Memory Management**: Efficient aircraft list management with Vue reactivity
- **Update Frequency**: Configurable tracking intervals to balance realism and performance

## Browser Compatibility

- Modern browsers with HTML5 Canvas support
- ES6+ JavaScript features
- CSS Grid and Flexbox support

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit your changes (`git commit -am 'Add new feature'`)
4. Push to the branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

MIT License - see LICENSE file for details

---
