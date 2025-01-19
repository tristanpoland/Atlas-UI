import React from 'react';
import { Signal, Play, Pause, SkipBack, SkipForward } from 'lucide-react';

const NowPlaying = () => (
    <div className="relative z-10 mt-6">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
        <h2 className="text-2xl font-semibold text-white mb-4">Now Playing</h2>
        <div className="text-xl text-white/70 mb-2">Symphony No. 5 in C minor</div>
        <div className="text-lg text-white/50">Ludwig van Beethoven</div>
      </div>
    </div>
  );

const PlaybackControls = ({ isPlaying, setIsPlaying }) => (
    <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-4 border border-white/10 shadow-lg">
        <div className="flex items-center space-x-8">
          <button className="p-4 rounded-full hover:bg-white/10 transition-all active:scale-95">
            <SkipBack size={32} className="text-white/70" />
          </button>
          <button 
            className="p-4 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-all active:scale-95"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? 
              <Pause size={32} className="text-blue-400" /> : 
              <Play size={32} className="text-blue-400" />}
          </button>
          <button className="p-4 rounded-full hover:bg-white/10 transition-all active:scale-95">
            <SkipForward size={32} className="text-white/70" />
          </button>
        </div>
      </div>
    </div>
  );


const RadioTab = ({ isPlaying, setIsPlaying }) => (
  <div className="relative h-full w-full p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-black"></div>
    
    <div className="relative z-10">
      <div className="bg-black/40 backdrop-blur-xl rounded-2xl p-6 border border-white/10 shadow-lg">
        <div className="flex items-baseline space-x-4 mb-4">
          <div className="text-6xl font-bold text-blue-400">98.1</div>
          <div className="text-2xl text-white/70">WQXR Classical</div>
        </div>
        <div className="flex items-center space-x-2 text-white/50">
          <Signal size={16} />
          <span>Strong Signal</span>
        </div>
      </div>
    </div>

    <NowPlaying />
    <PlaybackControls isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
  </div>
);

export default RadioTab;