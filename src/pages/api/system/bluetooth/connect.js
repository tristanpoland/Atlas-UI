import React, { lazy, Suspense, useState, useEffect } from 'react';

// Splash screen component
const SplashScreen = () => {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 3000); // Show warning for 3 seconds

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-black text-white">
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${showWarning ? 'opacity-100' : 'opacity-0'}`}>
        {/* Warning Screen */}
        <div className="max-w-lg px-8 text-center">
          <div className="mb-8">
            <svg className="w-16 h-16 mx-auto mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h1 className="text-2xl font-bold mb-4">WARNING</h1>
            <p className="text-lg mb-4">
              To reduce the risk of serious injury or accident, always keep your eyes on the road and your hands on the wheel.
            </p>
            <p className="text-sm text-gray-400">
              Some features require a compatible phone and may require cellular service.
            </p>
          </div>
        </div>
      </div>

      {/* Logo/Brand (shows after warning fades) */}
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-opacity duration-500 ${showWarning ? 'opacity-0' : 'opacity-100'}`}>
        <div className="text-center">
          <div className="mb-8">
            <h1 className="text-4xl font-bold mb-2">MAZDA</h1>
            <div className="w-32 h-1 bg-red-600 mx-auto"></div>
          </div>
          <p className="text-sm text-gray-400">Loading...</p>
        </div>
      </div>
    </div>
  );
};

// Main component
const MazdaInterface = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 4000); // Total splash screen time (warning + logo)

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return <SplashScreen />;
  }

  return (
    <Suspense fallback={<SplashScreen />}>
      <MainInterface />
    </Suspense>
  );
};

// Separate file: MainInterface.js (your original interface code)
const MainInterface = () => {
  const [activeTab, setActiveTab] = useState('radio');
  const [currentTime, setCurrentTime] = useState('');
  const [volume, setVolume] = useState(50);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let timeout;
    if (showVolumeControl) {
      timeout = setTimeout(() => setShowVolumeControl(false), 3000);
    }
    return () => clearTimeout(timeout);
  }, [showVolumeControl, volume]);

  return (
    <div className="fixed inset-0 bg-black text-white">
      <StatusBar currentTime={currentTime} />
      
      <div className="absolute inset-0 top-8">
        {activeTab === 'radio' && <RadioTab isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
        {activeTab === 'media' && <MediaTab isPlaying={isPlaying} setIsPlaying={setIsPlaying} />}
        {activeTab === 'nav' && <NavigationTab />}
        {activeTab === 'phone' && <PhoneTab />}
        {activeTab === 'settings' && <SettingsTab />}
      </div>

      <VolumeControl 
        volume={volume} 
        setVolume={setVolume} 
        showVolumeControl={showVolumeControl} 
      />
      <NavigationBar activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  );
};

export default MazdaInterface;