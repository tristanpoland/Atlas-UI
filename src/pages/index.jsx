"use client";

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';

const StatusBar = dynamic(() => import('../components/StatusBar'), { ssr: false });
const NavigationBar = dynamic(() => import('../components/NavigationBar'), { ssr: false });
const VolumeControl = dynamic(() => import('../components/VolumeControl'), { ssr: false });
const RadioTab = dynamic(() => import('../components/RadioTab'), { ssr: false });
const MediaTab = dynamic(() => import('../components/MediaTab'), { ssr: false });
const NavigationTab = dynamic(() => import('../components/NavigationTab'), { ssr: false });
const PhoneTab = dynamic(() => import('../components/PhoneTab'), { ssr: false });
const SettingsTab = dynamic(() => import('../components/SettingsTab'), { ssr: false });
const AssistantSphere = dynamic(() => import('./AssistantSphere'), { ssr: false });

const SplashScreen = () => {
  const [showWarning, setShowWarning] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowWarning(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-b from-black via-gray-900 to-black text-white overflow-hidden">
      <script src="/tailwind.js" />
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

const MainInterface = ({ currentTime, volume, setVolume, showVolumeControl, setShowVolumeControl }) => {
  const [activeTab, setActiveTab] = useState('radio');
  const [isPlaying, setIsPlaying] = useState(false);
  const [showAssistant, setShowAssistant] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [assistantResponse, setAssistantResponse] = useState(null);
  const recognitionRef = useRef(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      recognitionRef.current = new window.webkitSpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      
      recognitionRef.current.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map(result => result[0].transcript.toLowerCase())
          .join('');

        console.log('Transcript:', transcript);
          
        if (transcript.includes('hey mazda')) {
          setShowAssistant(true);
          setIsListening(true);
          console.log('Listening...');
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
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const handleCommand = async (transcript) => {
    if (typeof window === 'undefined') return;
    
    // Command handling logic here...
    const speech = new window.SpeechSynthesisUtterance('Command received');
    window.speechSynthesis.speak(speech);
  };

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
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState('');
  const [volume, setVolume] = useState(50);
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
    const timer = setTimeout(() => setIsLoading(false), 4000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (showVolumeControl) {
      const timeout = setTimeout(() => setShowVolumeControl(false), 3000);
      return () => clearTimeout(timeout);
    }
  }, [showVolumeControl, volume]);

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