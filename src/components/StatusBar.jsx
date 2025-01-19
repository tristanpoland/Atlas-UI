import React from 'react';
import { Wifi, Signal, Battery } from 'lucide-react';

const StatusBar = ({ currentTime }) => (
  <div className="h-8 bg-black/40 backdrop-blur-md flex justify-between items-center px-4 text-sm">
    <div>{currentTime}</div>
    <div className="flex items-center space-x-4">
      <Wifi size={16} />
      <Signal size={16} />
      <Battery size={16} />
    </div>
  </div>
);

export default StatusBar;