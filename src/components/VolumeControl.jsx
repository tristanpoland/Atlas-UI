import React from 'react';
import { Volume2 } from 'lucide-react';

const VolumeControl = ({ volume, setVolume, showVolumeControl }) => (
  showVolumeControl && (
    <div className="fixed top-12 right-6 bg-black/40 backdrop-blur-xl rounded-full px-4 py-2
                    border border-white/10 shadow-lg transition-all">
      <div className="flex items-center space-x-3">
        <Volume2 size={24} className="text-white/70" />
        <input
          type="range"
          min="0"
          max="100"
          value={volume}
          onChange={(e) => setVolume(parseInt(e.target.value))}
          className="w-32"
        />
        <span className="text-sm text-white/70 w-8">{volume}%</span>
      </div>
    </div>
  )
);

export default VolumeControl;