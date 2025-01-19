import React from 'react';
import { Bluetooth, Clock, User, PhoneCall, MessageSquare } from 'lucide-react';

const ConnectionStatus = () => (
  <div className="relative z-10 mb-6">
    <div className="bg-black/40 rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Phone</div>
        <div className="flex items-center space-x-2 text-blue-400">
          <Bluetooth size={20} />
          <span>Connected</span>
        </div>
      </div>
    </div>
  </div>
);

const QuickActionsGrid = () => (
  <div className="relative z-10 grid grid-cols-2 gap-4 mb-6">
    {[
      { icon: Clock, label: 'Recent' },
      { icon: User, label: 'Contacts' },
      { icon: PhoneCall, label: 'Keypad' },
      { icon: MessageSquare, label: 'Messages' }
    ].map(({ icon: Icon, label }) => (
      <button
        key={label}
        className="bg-black/40 rounded-2xl p-6 border border-white/10 
                   hover:bg-white/5 transition-all active:scale-95 shadow-lg"
      >
        <Icon size={32} className="text-white/70 mx-auto mb-2" />
        <div className="text-white/70">{label}</div>
      </button>
    ))}
  </div>
);

const RecentCalls = () => (
  <div className="relative z-10">
    <div className="bg-black/40 rounded-2xl p-4 border border-white/10 shadow-lg">
      <div className="text-xl font-semibold text-white mb-4">Recent Calls</div>
      <div className="space-y-3">
        {[
          { name: 'John Doe', time: '5m ago', type: 'incoming' },
          { name: 'Jane Smith', time: '1h ago', type: 'outgoing' },
          { name: 'Mom', time: '2h ago', type: 'missed' }
        ].map(call => (
          <div key={call.name} 
               className="flex items-center justify-between p-3 rounded-xl
                        hover:bg-white/5 transition-all">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                <User size={20} className="text-white/70" />
              </div>
              <div>
                <div className="text-white">{call.name}</div>
                <div className="text-sm text-white/50">{call.time}</div>
              </div>
            </div>
            <PhoneCall size={20} className="text-blue-400" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

const PhoneTab = () => (
  <div className="relative h-full w-full p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black"></div>
    <ConnectionStatus />
    <QuickActionsGrid />
    <RecentCalls />
  </div>
);

export default PhoneTab;