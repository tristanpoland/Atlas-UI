import React, { memo, useState, useEffect } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation, Search, Compass, Map as MapIcon, Clock } from 'lucide-react';

const mapStyles = `
  .leaflet-tile {
    filter: invert(1) hue-rotate(200deg) saturate(0.7);
  }
  .leaflet-container {
    background: #1a1a1a;
    z-index: 1;
  }
  .leaflet-control-container {
    z-index: 1;
  }
`;

const CarNavigation = memo(() => {
  const [eta, setEta] = useState(null);
  const [distance, setDistance] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [showWaypointSearch, setShowWaypointSearch] = useState(false);
  const [map, setMap] = useState(null);
  const [route, setRoute] = useState(null);
  const [currentLocation, setCurrentLocation] = useState([37.7749, -122.4194]);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [searchHistory, setSearchHistory] = useState(() => {
    const saved = localStorage.getItem('searchHistory');
    return saved ? JSON.parse(saved) : [];
  });
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [speed, setSpeed] = useState('0');
  const [heading, setHeading] = useState('N');
  const [instructions, setInstructions] = useState([]);

  useEffect(() => {
    const newMap = L.map('map').setView(currentLocation, 13);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
    }).addTo(newMap);

    // Create initial user marker
    const userMarker = L.marker(currentLocation).addTo(newMap);
    newMap.userMarker = userMarker;
    
    setMap(newMap);

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const { latitude, longitude, speed, heading } = position.coords;
        const newLocation = [latitude, longitude];
        setCurrentLocation(newLocation);
        setSpeed(speed ? Math.round(speed * 2.237) : '0');
        setHeading(getHeadingDirection(heading));
        
        if (!map.userMarker) {
          map.userMarker = L.marker(newLocation).addTo(newMap);
        } else {
          map.userMarker.setLatLng(newLocation);
        }
        
        newMap.setView(newLocation);
        if (route) calculateRoute(newLocation, route.destination);
      },
      null,
      { enableHighAccuracy: true }
    );

    return () => {
      navigator.geolocation.clearWatch(watchId);
      newMap.remove();
    };
  }, []);

  const getHeadingDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees ?? 0) % 360) / 45) % 8;
    return directions[index];
  };

  const calculateRoute = async (start, end) => {
    if (!start || !end) return;

    try {
      const response = await fetch(
        `https://router.project-osrm.org/route/v1/driving/` +
        `${start[1]},${start[0]};${end[1]},${end[0]}` +
        `?overview=full&geometries=geojson&steps=true`
      );
      
      const data = await response.json();
      
      if (data.routes?.[0]) {
        if (route?.line) {
          map.removeLayer(route.line);
        }

        const routeLine = L.geoJSON(data.routes[0].geometry, {
          style: {
            color: '#3b82f6',
            weight: 4,
            opacity: 0.8
          }
        }).addTo(map);

        setRoute({ line: routeLine, destination: end });
        setEta(Math.round(data.routes[0].duration / 60));
        setDistance(Math.round(data.routes[0].distance / 1000));
        setInstructions(data.routes[0].legs[0].steps.map(step => ({
          instruction: step.maneuver.instruction,
          distance: Math.round(step.distance)
        })));

        map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  };

  const handleSearch = async (query) => {
    setSearchQuery(query);
    setShowSuggestions(true);
    
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`
      );
      const data = await response.json();
      setSuggestions(data.slice(0, 5));
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const selectPlace = async (place) => {
    setSearchQuery(place.display_name);
    setShowSuggestions(false);
    
    const destination = [parseFloat(place.lat), parseFloat(place.lon)];
    
    if (map.destMarker) {
      map.removeLayer(map.destMarker);
    }
    
    map.destMarker = L.marker(destination, {
      icon: L.divIcon({
        html: '📍',
        iconSize: [25, 25],
        className: 'destination-marker'
      })
    }).addTo(map);

    const newHistory = [
      { id: Date.now(), name: place.display_name, coordinates: destination },
      ...searchHistory.slice(0, 4)
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    
    await calculateRoute(currentLocation, destination);
  };

  return (
    <div className="relative h-screen w-screen bg-gray-900 overflow-hidden">
      <style>{mapStyles}</style>
      
      <div className="fixed top-0 left-0 right-0 z-20">
        <div className="bg-black/80 backdrop-blur-md p-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-4">
              <Compass className="text-blue-400" size={24} />
              <div className="text-white/90 text-lg">
                {speed} mph {heading}
              </div>
            </div>
          </div>
          
          <div className="relative">
            <div className="flex items-center space-x-4 bg-white/10 rounded-lg p-3">
              <Search className="text-white/70" size={20} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search destination..."
                className="w-full bg-transparent text-white outline-none"
              />
            </div>

            {showSuggestions && (searchQuery || searchHistory.length > 0) && (
              <div className="absolute w-full mt-2 bg-black/90 rounded-lg overflow-hidden">
                {searchQuery && suggestions.map((place) => (
                  <button
                    key={place.place_id}
                    onClick={() => selectPlace(place)}
                    className="w-full flex items-center p-4 hover:bg-white/10 text-left"
                  >
                    <MapIcon className="text-white/60 mr-3" size={20} />
                    <span className="text-white/90">{place.display_name}</span>
                  </button>
                ))}
                
                {!searchQuery && searchHistory.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => selectPlace({ 
                      display_name: item.name, 
                      lat: item.coordinates[0], 
                      lon: item.coordinates[1] 
                    })}
                    className="w-full flex items-center p-4 hover:bg-white/10 text-left"
                  >
                    <Clock className="text-white/60 mr-3" size={20} />
                    <span className="text-white/90">{item.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div id="map" className="h-screen w-screen" />

      {route && (
        <div className="fixed bottom-4 left-4 bg-black/80 backdrop-blur-md rounded-lg p-4 text-white z-10">
          <div className="flex items-center gap-4 mb-2">
            <div>
              <div className="text-sm text-white/60">Time to destination</div>
              <div className="text-xl font-semibold">{eta} min</div>
            </div>
            <div className="border-l border-white/20 pl-4">
              <div className="text-sm text-white/60">Distance</div>
              <div className="text-xl font-semibold">{distance} km</div>
            </div>
          </div>
          <button
            onClick={() => setShowWaypointSearch(true)}
            className="w-full mt-2 py-2 px-4 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-blue-400 text-sm"
          >
            Add stop
          </button>
        </div>
      )}

      {showWaypointSearch && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-30 p-4">
          <div className="max-w-lg mx-auto mt-20">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-white text-lg font-semibold">Add a stop</h2>
              <button
                onClick={() => setShowWaypointSearch(false)}
                className="text-white/60 hover:text-white"
              >
                ✕
              </button>
            </div>
            <div className="space-y-4">
              {waypoints.map((point, index) => (
                <div key={index} className="flex items-center gap-2 text-white">
                  <span>{index + 1}.</span>
                  <span className="flex-1">{point.name}</span>
                  <button
                    onClick={() => {
                      const newWaypoints = [...waypoints];
                      newWaypoints.splice(index, 1);
                      setWaypoints(newWaypoints);
                    }}
                    className="text-red-400 hover:text-red-300"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for a place..."
                  className="w-full bg-white/10 text-white p-3 rounded-lg outline-none"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                />
                {suggestions.length > 0 && (
                  <div className="absolute w-full mt-2 bg-gray-800 rounded-lg overflow-hidden">
                    {suggestions.map((place) => (
                      <button
                        key={place.place_id}
                        onClick={() => {
                          setWaypoints([...waypoints, {
                            name: place.display_name,
                            coordinates: [parseFloat(place.lat), parseFloat(place.lon)]
                          }]);
                          setSearchQuery('');
                          setSuggestions([]);
                        }}
                        className="w-full p-3 text-left text-white hover:bg-white/10"
                      >
                        {place.display_name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {instructions.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-black/80 text-white p-4 max-h-48 overflow-y-auto">
          <div className="flex items-center gap-2 mb-2">
            <Navigation className="text-blue-400" size={20} />
            <span className="font-semibold">Turn-by-turn Navigation</span>
          </div>
          {instructions.map((step, index) => (
            <div key={index} className="flex items-start gap-2 py-2 border-t border-white/10">
              <span className="text-blue-400 font-mono">{index + 1}.</span>
              <div>
                <div className="text-white/90">{step.instruction}</div>
                <div className="text-white/60 text-sm">{step.distance}m</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
});

export default CarNavigation;