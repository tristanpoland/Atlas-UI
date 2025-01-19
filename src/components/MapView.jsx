import React, { memo } from 'react';
import { Search, Navigation, Home, Building2, Car, Coffee } from 'lucide-react';

// Memoized UI Components to prevent unnecessary re-renders
const SearchBar = memo(() => (
  <div className="fixed top-4 left-1/2 -translate-x-1/2 w-2/3">
    <div className="bg-white/10 rounded-2xl p-4 shadow-lg border border-white/20">
      <div className="flex items-center space-x-4">
        <Search size={24} className="text-white/70" />
        <input 
          type="text"
          placeholder="Where to?"
          className="w-full bg-transparent outline-none placeholder-white/50 text-white"
        />
      </div>
    </div>
  </div>
));

const QuickActions = memo(() => (
  <div className="fixed bottom-32 left-1/2 -translate-x-1/2">
    <div className="bg-black/40 rounded-2xl p-2 shadow-lg border border-white/10">
      <div className="grid grid-cols-4 gap-2">
        {[
          { icon: Home, label: 'Home' },
          { icon: Building2, label: 'Work' },
          { icon: Car, label: 'Gas' },
          { icon: Coffee, label: 'Food' }
        ].map(({ icon: Icon, label }) => (
          <button
            key={label}
            className="flex flex-col items-center p-3 rounded-xl hover:bg-white/10"
          >
            <Icon size={24} className="text-white/70 mb-1" />
            <span className="text-xs text-white/70">{label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
));

const NavigationInstructions = memo(() => (
  <div className="fixed top-20 left-4">
    <div className="bg-black/40 rounded-2xl p-4 shadow-lg border border-white/10">
      <div className="flex items-center space-x-4">
        <div className="rounded-xl bg-blue-500/20 p-2">
          <Navigation size={24} className="text-blue-400" />
        </div>
        <div>
          <div className="text-white/50 text-sm">Next Turn</div>
          <div className="text-white font-medium">Turn right on Main St</div>
          <div className="text-white/50 text-sm">0.5 mi • 2 min</div>
        </div>
      </div>
    </div>
  </div>
));

const MapControls = memo(() => (
  <div className="fixed right-4 bottom-32">
    <div className="bg-black/40 rounded-2xl shadow-lg border border-white/10">
      <button className="p-4 hover:bg-white/10 text-white/70 text-xl w-12 h-12 flex items-center justify-center">+</button>
      <div className="h-px bg-white/10" />
      <button className="p-4 hover:bg-white/10 text-white/70 text-xl w-12 h-12 flex items-center justify-center">−</button>
    </div>
  </div>
));

// Simplified Terrain Components with reduced visual effects
const RoadNetwork = memo(() => (
  <div className="absolute inset-0">
    <div className="absolute w-full h-0.5 bg-white/20 top-1/2 -translate-y-1/2" />
    <div className="absolute h-full w-0.5 bg-white/20 left-1/2 -translate-x-1/2" />
  </div>
));

// Reduced number of buildings and simplified styling
const Buildings = memo(() => (
  <>
    {[...Array(15)].map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      
      return (
        <div 
          key={i} 
          className="absolute bg-zinc-800/80"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '30px',
            height: '30px',
          }} 
        />
      );
    })}
  </>
));

const RouteLine = memo(() => (
  <div className="absolute inset-0">
    <div className="absolute h-full w-1 left-1/2 -translate-x-1/2">
      <div className="h-full w-full bg-blue-400/50" />
    </div>
  </div>
));

const TerrainView = memo(() => (
  <div className="absolute inset-0">
    <RoadNetwork />
    <Buildings />
    <RouteLine />
  </div>
));

// Main MapView Component
const MapView = () => (
  <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900">
    <TerrainView />
    <SearchBar />
    <QuickActions />
    <NavigationInstructions />
    <MapControls />
  </div>
);

export default MapView;