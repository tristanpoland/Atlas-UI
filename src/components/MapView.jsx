import React, { memo, useState, useEffect } from 'react';
import { Map, Marker } from 'pigeon-maps';
import { Navigation, Search, Compass, Map as MapIcon, Clock } from 'lucide-react';

// Add CSS to invert map tiles
const mapStyles = `
  .pigeon-tiles img {
    filter: invert(1) hue-rotate(200deg) saturate(0.7);
  }
`;

const CarNavigation = memo(() => {
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
  const [mapCenter, setMapCenter] = useState([37.7749, -122.4194]);

  useEffect(() => {
    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const newLocation = [position.coords.latitude, position.coords.longitude];
        setCurrentLocation(newLocation);
        setMapCenter(newLocation);
        setSpeed(position.coords.speed ? Math.round(position.coords.speed * 2.237) : '0');
        setHeading(getHeadingDirection(position.coords.heading));
      },
      null,
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const getHeadingDirection = (degrees) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(((degrees ?? 0) % 360) / 45) % 8;
    return directions[index];
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

  const selectPlace = (place) => {
    setSearchQuery(place.display_name);
    setShowSuggestions(false);
    
    const newLocation = [parseFloat(place.lat), parseFloat(place.lon)];
    const newHistory = [
      { 
        id: Date.now(), 
        name: place.display_name, 
        coordinates: newLocation
      },
      ...searchHistory.slice(0, 4)
    ];
    setSearchHistory(newHistory);
    localStorage.setItem('searchHistory', JSON.stringify(newHistory));
    setMapCenter(newLocation);
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

      <div className="h-screen w-screen">
        <Map
          center={mapCenter}
          zoom={15}
          animate={true}
          style={{ height: '100%' }}
        >
          <Marker 
            width={50}
            anchor={currentLocation}
          />
        </Map>
      </div>
    </div>
  );
});

export default CarNavigation;