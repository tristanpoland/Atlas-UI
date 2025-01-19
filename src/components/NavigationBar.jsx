import React from 'react';
import { Radio, Music, Navigation, Phone, Settings } from 'lucide-react';
import RadioTab from './RadioTab';
import MediaTab from './MediaTab';
import NavigationTab from './NavigationTab';
import PhoneTab from './PhoneTab';
import SettingsTab from './SettingsTab';

const NavigationBar = ({ activeTab, setActiveTab }) => (
  <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-10">
    <div className="bg-black/40 backdrop-blur-xl rounded-2xl px-6 py-4 shadow-lg
                    border border-white/10 transition-all">
      <div className="flex items-center space-x-12">
        {[
          { id: 'radio', icon: Radio, label: 'Radio' },
          { id: 'media', icon: Music, label: 'Media' },
          { id: 'nav', icon: Navigation, label: 'Nav' },
          { id: 'phone', icon: Phone, label: 'Phone' },
          { id: 'settings', icon: Settings, label: 'Settings' }
        ].map(({ id, icon: Icon, label }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className={`flex flex-col items-center space-y-1 transition-all
                      ${activeTab === id 
                        ? 'text-white scale-110' 
                        : 'text-white/50 hover:text-white/70'}`}
          >
            <Icon size={24} />
            <span className="text-xs">{label}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default NavigationBar;