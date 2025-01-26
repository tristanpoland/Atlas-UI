import React, { useState, useEffect, useRef } from 'react';
import StatusBar from '../components/StatusBar';
import NavigationBar from '../components/NavigationBar';
import VolumeControl from '../components/VolumeControl';
import RadioTab from '../components/RadioTab';
import MediaTab from '../components/MediaTab';
import NavigationTab from '../components/NavigationTab';
import PhoneTab from '../components/PhoneTab';
import SettingsTab from '../components/SettingsTab';
import voiceCommands from './commands.json';

const SplashScreen = () => {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowWarning(false);
    }, 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden">
      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out transform ${
        showWarning ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
      }`}>
        <div className="max-w-2xl px-8 text-center relative">
          <div className="absolute inset-0 bg-red-600 opacity-5 blur-xl rounded-full"></div>
          <div className="relative z-10">
            <div className="mb-8 relative">
              <div className="absolute inset-0 bg-red-500 opacity-20 blur-md rounded-full animate-pulse"></div>
              <svg className="w-20 h-20 mx-auto mb-4 text-red-500" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold mb-6 tracking-wider">WARNING</h1>
            <p className="text-xl mb-6 leading-relaxed font-light">
              To reduce the risk of serious injury or accident, always keep your eyes on the road and your hands on the wheel.
            </p>
            <div className="w-32 h-0.5 bg-red-600 mx-auto mb-6"></div>
            <p className="text-sm text-gray-400 font-light">
              Some features require a compatible phone and may require cellular service.
            </p>
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 flex flex-col items-center justify-center transition-all duration-1000 ease-in-out ${
        showWarning ? 'opacity-0 scale-95' : 'opacity-100 scale-100'
      }`}>
        <div className="text-center relative">
          <div className="absolute inset-0 bg-red-600 opacity-10 blur-2xl rounded-full"></div>
          <div className="relative z-10">
            <div className="relative mb-12">
              <svg className="w-32 h-32 mx-auto mb-4" viewBox="0 0 100 100" fill="currentColor">
                <path d="M50 20c-16.5 0-30 13.5-30 30s13.5 30 30 30 30-13.5 30-30-13.5-30-30-30zm0 55c-13.8 0-25-11.2-25-25s11.2-25 25-25 25 11.2 25 25-11.2 25-25 25z"/>
                <path d="M50 35c-8.3 0-15 6.7-15 15s6.7 15 15 15 15-6.7 15-15-6.7-15-15-15zm0 25c-5.5 0-10-4.5-10-10s4.5-10 10-10 10 4.5 10 10-4.5 10-10 10z"/>
                <path d="M85 50h-5c0-16.5-13.5-30-30-30v-5c19.3 0 35 15.7 35 35z"/>
                <path d="M15 50h5c0 16.5 13.5 30 30 30v5c-19.3 0-35-15.7-35-35z"/>
              </svg>
              <h1 className="text-5xl font-bold mb-2 tracking-widest">MAZDA</h1>
            </div>
            <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-red-600 to-transparent mx-auto mb-8"></div>
            <div className="relative">
              <div className="w-8 h-8 border-t-2 border-r-2 border-white rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-sm text-gray-400 tracking-wider uppercase">Initializing System</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AssistantSphere = ({ isVisible, isListening, response }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative w-32 h-32">
        {/* Outer glow */}
        <div className="absolute inset-0 bg-red-600 opacity-20 blur-xl rounded-full"></div>
        
        {/* Main sphere */}
        <div className={`absolute inset-0 bg-gradient-to-b from-red-500 to-red-700 rounded-full 
          ${isListening ? 'animate-pulse' : ''}`}>
          
          {/* Inner light effect */}
          <div className="absolute inset-2 bg-gradient-to-t from-transparent to-red-400 rounded-full opacity-50"></div>
          
          {/* Dynamic wave effect */}
          <div className="absolute inset-0">
            <div className="w-full h-full relative overflow-hidden rounded-full">
              <div className={`absolute inset-0 ${isListening ? 'animate-wave' : ''}`}>
                <div className="absolute top-1/2 left-0 w-full h-1 bg-red-300 opacity-30 transform -translate-y-1/2"></div>
                <div className="absolute top-1/2 left-0 w-full h-2 bg-red-200 opacity-20 transform -translate-y-1/2 translate-x-1/4"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {response && (
        <div className="absolute top-full mt-4 left-1/2 transform -translate-x-1/2 bg-black/80 p-4 rounded-lg min-w-[200px]">
          <p className="text-lg font-light text-center">{response.visual}</p>
        </div>
      )}
    </div>
  );
};

const MainInterface = ({ currentTime, volume, setVolume, showVolumeControl, setShowVolumeControl }) => {
  const [activeTab, setActiveTab] = useState('radio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState(null);
  const recognitionRef = useRef(null);
  const commandsRef = useRef(voiceCommands);

  const handleCommand = async (transcript) => {
    for (const [category, config] of Object.entries(commandsRef.current.commands)) {
      // Handle special system activation
      if (category === 'system') {
        const systemPatterns = config.patterns;
        const systemMatch = systemPatterns.some(pattern => 
          transcript.toLowerCase().includes(pattern)
        );
        if (systemMatch) {
          const response = config.responses.success;
          setShowAssistant(true);
          setAssistantResponse({
            speech: response.speech,
            visual: response.visual
          });
          const speech = new SpeechSynthesisUtterance(response.speech);
          window.speechSynthesis.speak(speech);
          return;
        }
      }
  
      // Handle other command categories
      for (const [action, patterns] of Object.entries(config.patterns)) {
        const matchedPattern = patterns.find(pattern => 
          transcript.toLowerCase().includes(pattern)
        );
  
        if (matchedPattern) {
          const params = transcript
            .toLowerCase()
            .replace('hey mazda', '')
            .replace(matchedPattern, '')
            .trim();
  
          const response = config.responses[action]?.success;
          
          if (response) {
            // Execute command action
            switch (response.action) {
              case 'PLAY_MEDIA':
                setActiveTab('media');
                setIsPlaying(true);
                break;
              case 'START_NAVIGATION':
                setActiveTab('nav');
                break;
              case 'START_CALL':
                setActiveTab('phone');
                break;
              case 'SET_CLIMATE':
                setActiveTab('settings');
                break;
            }
  
            // Display response
            setAssistantResponse({
              speech: response.speech.replace(/\{.*?\}/g, params),
              visual: response.visual.replace(/\{.*?\}/g, params)
            });
  
            // Text to speech
            const speech = new SpeechSynthesisUtterance(
              response.speech.replace(/\{.*?\}/g, params)
            );
            window.speechSynthesis.speak(speech);
            return;
          }
        }
      }
    }
  
    // Fallback if no command matched
    const fallback = commandsRef.current.fallback.noMatch;
    setAssistantResponse({
      speech: fallback.speech,
      visual: fallback.visual
    });
    const speech = new SpeechSynthesisUtterance(fallback.speech);
    window.speechSynthesis.speak(speech);
  };
  
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join('');
          
        if (transcript.includes('hey mazda')) {
          setShowAssistant(true);
          setIsListening(true);
          handleCommand(transcript);
          setTimeout(() => {
            setIsListening(false);
            setShowAssistant(false);
            setAssistantResponse(null);
          }, 5000);
        }
      };

      recognitionRef.current.onend = () => {
        recognitionRef.current.start();
      };
      
      recognitionRef.current.start();
      
      return () => {
        if (recognitionRef.current) {
          recognitionRef.current.stop();
        }
      };
    }
  }, []);

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
      
      <AssistantSphere 
        isVisible={showAssistant}
        isListening={isListening}
        response={assistantResponse}
      />

      <style jsx global>{`
        @keyframes wave {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-wave {
          animation: wave 2s linear infinite;
        }
      `}</style>
    </div>
  );
};

const MazdaInterface = () => {
  const [tailwindLoaded, setTailwindLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [volume, setVolume] = useState(50);
  const [showVolumeControl, setShowVolumeControl] = useState(false);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/tailwind.js';
    script.onload = () => setTailwindLoaded(true);
    document.head.appendChild(script);
  }, []);

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

  useEffect(() => {
    if (tailwindLoaded) {
      const timer = setTimeout(() => {
        setIsLoading(false);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [tailwindLoaded]);

  if (!tailwindLoaded) return null;
  if (isLoading) return <SplashScreen />;

  return (
    <MainInterface 
      currentTime={currentTime}
      volume={volume}
      setVolume={setVolume}
      showVolumeControl={showVolumeControl}
      setShowVolumeControl={setShowVolumeControl}
    />
  );
};

export default MazdaInterface;