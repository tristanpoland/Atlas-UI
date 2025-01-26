"use client";

import React from 'react';

const AssistantSphere = ({ isVisible, isListening, response }) => {
  if (!isVisible) return null;

  return (
    <div className="fixed bottom-20 right-4 z-50">
      <div className="relative w-32 h-32">
        <div className="absolute inset-0 bg-red-600 opacity-20 blur-xl rounded-full"></div>
        
        <div className={`absolute inset-0 bg-gradient-to-b from-red-500 to-red-700 rounded-full 
          ${isListening ? 'animate-pulse' : ''}`}>
          <div className="absolute inset-2 bg-gradient-to-t from-transparent to-red-400 rounded-full opacity-50"></div>
          
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
          <p className="text-lg font-light text-center text-white">{response.visual}</p>
        </div>
      )}

      <style jsx>{`
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

export default AssistantSphere;