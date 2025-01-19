import React from 'react';

const RoadNetwork = () => (
  <div className="absolute inset-0">
    {/* Horizontal road */}
    <div className="absolute w-full h-1 bg-white/20 top-1/2 transform -translate-y-1/2 blur-sm" />
    <div className="absolute w-full h-1 bg-white/10 top-1/2 transform -translate-y-1/2" />
    
    {/* Vertical road */}
    <div className="absolute h-full w-1 bg-white/20 left-1/2 transform -translate-x-1/2 blur-sm" />
    <div className="absolute h-full w-1 bg-white/10 left-1/2 transform -translate-x-1/2" />
  </div>
);

const Buildings = () => (
  <>
    {[...Array(30)].map((_, i) => {
      const x = Math.random() * 100;
      const y = Math.random() * 100;
      const height = 20 + Math.random() * 60;
      
      return (
        <div 
          key={i} 
          className="absolute bg-gradient-to-b from-zinc-700/80 to-zinc-800/80 backdrop-blur-sm"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: '30px',
            height: '30px',
            transform: `translateZ(${height}px)`,
            boxShadow: '0 0 20px rgba(0,0,0,0.3)',
          }} 
        />
      );
    })}
  </>
);

const RouteLine = () => (
  <div className="absolute inset-0">
    <div className="absolute h-full w-2 left-1/2 transform -translate-x-1/2">
      {/* Route base */}
      <div className="h-full w-full bg-blue-500/30 blur-sm" />
      <div className="h-full w-full bg-blue-400/50" />
      
      {/* Animated pulse effect */}
      <div className="absolute top-0 left-0 right-0 h-full">
        <div 
          className="h-40 w-full bg-gradient-to-b from-blue-400/50 to-transparent 
                     animate-pulse transform translate-y-full" 
          style={{animationDuration: '2s'}} 
        />
      </div>
    </div>
  </div>
);

const TerrainView = () => (
  <div 
    className="absolute inset-0 transform-gpu"
    style={{
      transform: 'rotateX(60deg) scale(1.5)',
      transformOrigin: 'center center'
    }}
  >
    <RoadNetwork />
    <Buildings />
    <RouteLine />
  </div>
);

export default TerrainView;