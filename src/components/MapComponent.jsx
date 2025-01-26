import React, { forwardRef, useImperativeHandle, useState, useEffect, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import leafletRoutingMachine from 'leaflet-routing-machine';

// Ensure marker icons work correctly
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png'
});

const MapComponent = forwardRef(({ 
  initialLocation = [37.7749, -122.4194], 
  onLocationUpdate, 
  onRouteUpdate 
}, ref) => {
  const [map, setMap] = useState(null);
  const [userMarker, setUserMarker] = useState(null);
  const [routingControl, setRoutingControl] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(initialLocation);
  const [destination, setDestination] = useState(null);

  // Imperative handle for parent component
  useImperativeHandle(ref, () => ({
    updateRouteLocation: (newLocation) => {
      updateUserMarker(newLocation);
      if (destination) {
        updateRoute(newLocation, destination);
      }
    },
    updateRoute: (start, end, waypoints = []) => {
      setDestination(end);
      createRoute(start, end, waypoints);
    },
    clearRoute: () => {
      clearRouting();
    },
    getDestination: () => destination
  }));

  // Initialize map
  useEffect(() => {
    if (!map) {
      const newMap = L.map('map').setView(initialLocation, 13);
      
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap contributors'
      }).addTo(newMap);

      const marker = L.marker(initialLocation, {
        icon: L.divIcon({
          html: '🚗',
          iconSize: [30, 30],
          className: 'userMarker'
        })
      }).addTo(newMap);

      setMap(newMap);
      setUserMarker(marker);

      // Start geolocation watching
      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed, heading } = position.coords;
          const newLocation = [latitude, longitude];
          
          // Update location state
          setCurrentLocation(newLocation);
          
          // Update user marker
          updateUserMarker(newLocation);
          
          // Call parent location update handler
          onLocationUpdate(
            latitude, 
            longitude, 
            speed, 
            heading
          );
        },
        (error) => {
          console.error('Geolocation error:', error);
        },
        { 
          enableHighAccuracy: true, 
          maximumAge: 30000, 
          timeout: 27000 
        }
      );

      // Cleanup function
      return () => {
        navigator.geolocation.clearWatch(watchId);
        newMap.remove();
      };
    }
  }, []);

  // Update user marker position
  const updateUserMarker = useCallback((newLocation) => {
    if (userMarker) {
      userMarker.setLatLng(newLocation);
      
      // Optional: Pan map to user location
      map?.panTo(newLocation);
    }
  }, [userMarker, map]);

  // Clear existing routing
  const clearRouting = useCallback(() => {
    if (routingControl) {
      map.removeControl(routingControl);
      setRoutingControl(null);
    }

    // Remove any existing route layers
    map.eachLayer((layer) => {
      if (layer instanceof L.Polyline || layer instanceof L.Marker) {
        if (!layer.options.icon?.options?.className?.includes('userMarker')) {
          map.removeLayer(layer);
        }
      }
    });
  }, [map, routingControl]);

  // Create route
  const createRoute = useCallback((start, end, waypoints = []) => {
    // Clear any existing routing
    clearRouting();

    // Prepare waypoints
    const allWaypoints = [
      L.latLng(start[0], start[1]),
      ...waypoints.map(wp => L.latLng(wp[0], wp[1])),
      L.latLng(end.lat, end.lng)
    ];

    try {
      // Create new routing control
      const control = leafletRoutingMachine.control({
        waypoints: allWaypoints,
        routeWhileDragging: false,
        addWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        lineOptions: {
          styles: [{ color: '#3b82f6', weight: 4, opacity: 0.8 }]
        }
      }).addTo(map);

      // Add destination marker
      L.marker([end.lat, end.lng], {
        icon: L.divIcon({
          html: '📍',
          iconSize: [25, 25],
          className: 'destination-marker'
        })
      }).addTo(map);

      // Handle route found event
      control.on('routesfound', (e) => {
        const route = e.routes[0];
        
        // Prepare route information
        const routeInfo = {
          eta: Math.round(route.summary.totalTime / 60),
          distance: Math.round(route.summary.totalDistance / 1000),
          instructions: route.instructions.map(step => ({
            instruction: step.text,
            distance: Math.round(step.distance)
          }))
        };

        // Call parent route update handler
        onRouteUpdate(routeInfo);
      });

      // Handle routing errors
      control.on('routingerror', (e) => {
        console.error('Routing error:', e);
      });

      // Store routing control
      setRoutingControl(control);
    } catch (error) {
      console.error('Route creation error:', error);
    }
  }, [map, clearRouting, onRouteUpdate]);

  return <div id="map" className="h-full w-full absolute inset-0" />;
});

MapComponent.displayName = 'MapComponent';
export default MapComponent;