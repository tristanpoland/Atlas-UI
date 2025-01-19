import React from 'react';
import { Play, Pause, SkipBack, SkipForward, Repeat, Shuffle } from 'lucide-react';

interface QueueItemProps {
  title: string;
  artist: string;
  duration: string;
  isActive?: boolean;
}

const QueueItem: React.FC<QueueItemProps> = ({ title, artist, duration, isActive }) => (
  <div className={`flex items-center justify-between p-3 rounded-xl transition-colors ${isActive ? 'bg-blue-500/20' : 'hover:bg-white/5'}`}>
    <div className="flex items-center space-x-3">
      <div className="w-10 h-10 rounded-lg overflow-hidden bg-white/10">
        <img 
          src="/image.png" 
          alt="Track Cover"
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        <div className={`text-sm font-medium ${isActive ? 'text-blue-400' : 'text-white'}`}>{title}</div>
        <div className="text-xs text-white/50">{artist}</div>
      </div>
    </div>
    <div className="text-xs text-white/50">{duration}</div>
  </div>
);

interface NowPlayingProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const NowPlaying: React.FC<NowPlayingProps> = ({ isPlaying, setIsPlaying }) => (
    <div className="relative h-full flex flex-col">
      {/* Content area with automatic sizing */}
      <div className="flex-1 p-4 sm:p-8">
        <div className="h-full flex flex-col items-center justify-center">
          {/* Album cover */}
          <div className="relative w-full aspect-square max-w-[300px] sm:max-w-[200px] mx-auto rounded-xl backdrop-blur-xl border border-white/10 shadow-lg overflow-hidden">
            <img 
              src="/image.png" 
              alt="Album Cover"
              className="w-full h-full object-cover"
            />
          </div>
  
          {/* Track info */}
          <div className="mt-4 sm:mt-8 text-center">
            <div className="text-lg sm:text-2xl font-bold text-white truncate">Test For Echo</div>
            <div className="text-sm sm:text-lg text-white/70 truncate">Rush</div>
            <div className="text-xs sm:text-sm text-white/50 truncate">1996 • Test For Echo</div>
          </div>
        </div>
      </div>
  
      {/* Controls */}
      <div className="absolute bottom-0 left-0 right-0">
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          <div className="flex items-center justify-between space-x-2 sm:space-x-4">
            <button className="p-1 sm:p-2 rounded-full hover:bg-white/10 transition-all">
              <Shuffle size={20} className="text-white/50" />
            </button>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <button className="p-1 sm:p-2 rounded-full hover:bg-white/10 transition-all active:scale-95">
                <SkipBack size={20} className="text-white/70" />
              </button>
              <button 
                className="p-3 sm:p-4 rounded-full bg-blue-500/20 hover:bg-blue-500/30 transition-all active:scale-95"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 
                  <Pause size={24} className="text-blue-400" /> : 
                  <Play size={24} className="text-blue-400" />}
              </button>
              <button className="p-1 sm:p-2 rounded-full hover:bg-white/10 transition-all active:scale-95">
                <SkipForward size={20} className="text-white/70" />
              </button>
            </div>
            <button className="p-1 sm:p-2 rounded-full hover:bg-white/10 transition-all">
              <Repeat size={20} className="text-white/50" />
            </button>
          </div>
  
          {/* Progress bar */}
          <div className="space-y-2">
            <div className="relative h-1 sm:h-2 bg-white/20 rounded-full overflow-hidden">
              <div className="absolute h-full w-1/2 bg-blue-400 rounded-full"></div>
            </div>
            <div className="flex justify-between text-xs sm:text-sm text-white/50">
              <div>2:15</div>
              <div>4:49</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
  

const MediaQueue = () => {
  const queueItems = [
    { title: "Test For Echo", artist: "Rush", duration: "4:49", isActive: true },
    { title: "Driven", artist: "Rush", duration: "4:27" },
    { title: "Half the World", artist: "Rush", duration: "3:43" },
    { title: "The Color of Right", artist: "Rush", duration: "4:48" },
    { title: "Time and Motion", artist: "Rush", duration: "5:01" },
    { title: "Totem", artist: "Rush", duration: "4:58" },
    { title: "Dog Years", artist: "Rush", duration: "4:41" },
    { title: "Virtuality", artist: "Rush", duration: "5:43" },
    { title: "Resist", artist: "Rush", duration: "4:23" },
    { title: "Limbo", artist: "Rush", duration: "5:28" },
    { title: "Carve Away the Stone", artist: "Rush", duration: "4:06" },
  ];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-shrink-0 p-6 border-b border-white/10">
        <div className="text-xl font-medium text-white">Queue</div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4">
        <div className="space-y-2">
          {queueItems.map((item, index) => (
            <QueueItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  );
};

interface MediaTabProps {
  isPlaying: boolean;
  setIsPlaying: (isPlaying: boolean) => void;
}

const MediaTab: React.FC<MediaTabProps> = ({ isPlaying, setIsPlaying }) => {
  return (
    <div className="">
        <div className="absolute inset-0"> {/* Fixed positioning with explicit bottom margin */}
          {/* Full-screen blurred background */}
          <div className="absolute inset-0">
            <img
              src="/image.png"
              alt="Background Album Art"
              className="absolute w-full h-full object-cover brightness-50 blur-2xl scale-110 z-[-1]"
            />
            <div className="absolute inset-0" />
          </div>
        
          {/* Main content */}
          <div className="relative w-full h-full bg-gradient-to-b from-black/80 via-transparent to-black/90">
            <div className="grid h-full grid-cols-2">
              <div className=" border-r border-white/10 overflow-hidden mb-24">
                <NowPlaying isPlaying={isPlaying} setIsPlaying={setIsPlaying} />
              </div>
              <div className="overflow-hidden  mb-28">
                <MediaQueue />
              </div>
            </div>
          </div>
        </div>
    </div>
  );
};

export default MediaTab;