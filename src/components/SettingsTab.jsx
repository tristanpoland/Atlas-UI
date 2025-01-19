import React, { useState, useRef, useEffect } from 'react';
import { 
  Volume2, 
  Moon, 
  Languages, 
  ChevronRight, 
  Wifi, 
  Car, 
  RefreshCw,
  Lock,
  Signal,
  Bluetooth,
  Smartphone
} from 'lucide-react';

const hostAPI = {
  async getSystemSettings() {
    const response = await fetch('/api/system/settings');
    return response.json();
  },
  
  async toggleBluetooth(enabled) {
    const response = await fetch('/api/system/bluetooth/toggle', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ enabled })
    });
    return response.json();
  },

  async updateSystemSetting(category, setting, value) {
    const response = await fetch('/api/system/settings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        category,
        setting,
        value
      })
    });
    return response.json();
  },

  async scanWifiNetworks() {
    const response = await fetch('/api/system/wifi/scan');
    return response.json();
  },

  async connectToWifi(ssid, password) {
    const response = await fetch('/api/system/wifi/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        ssid,
        password
      })
    });
    return response.json();
  },

  async scanBluetoothDevices() {
    const response = await fetch('/api/system/bluetooth/scan');
    return response.json();
  },

  async bluetoothAction(mac, action) {
    const response = await fetch('/api/system/bluetooth/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        mac,
        action
      })
    });
    return response.json();
  }
};

const DraggableSlider = ({ value, onChange, category, setting }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [localValue, setLocalValue] = useState(value);
  const sliderRef = useRef(null);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleMove = (clientX) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(100, 
      ((clientX - rect.left) / rect.width) * 100
    ));
    setLocalValue(Math.round(percentage));
  };

  const handleChangeComplete = async () => {
    if (category && setting) {
      onChange?.(localValue);
    }
  };

  const handleTouchMove = (e) => {
    handleMove(e.touches[0].clientX);
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      handleMove(e.clientX);
    }
  };

  useEffect(() => {
    const stopDragging = () => {
      if (isDragging) {
        handleChangeComplete();
      }
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', stopDragging);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', stopDragging);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', stopDragging);
      document.removeEventListener('touchmove', handleTouchMove);
      document.removeEventListener('touchend', stopDragging);
    };
  }, [isDragging]);

  return (
    <div 
      ref={sliderRef}
      className="w-full h-12 relative flex items-center"
      onMouseDown={(e) => {
        handleMove(e.clientX);
        setIsDragging(true);
      }}
      onTouchStart={(e) => {
        handleMove(e.touches[0].clientX);
        setIsDragging(true);
      }}
    >
      <div className="absolute inset-y-0 left-0 right-0 bg-white/20 rounded-full"></div>
      <div 
        className="absolute left-0 top-1/2 -translate-y-1/2 bg-white/50 rounded-full h-full"
        style={{width: `${localValue}%`}}
      ></div>
      <div 
        className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full"
        style={{left: `${localValue}%`, transform: 'translate(-50%, -50%)'}}
      />
    </div>
  );
};

const SettingsList = () => {
  const [activeSubscreen, setActiveSubscreen] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState({
    connectivity: {
      wifi: false,
      bluetooth: false,
      networks: []
    },
    display: {
      brightness: 50
    },
    sound: {
      volume: 50
    },
    system: {
      language: 'English',
      navigation: false,
      temperature: 'N/A'
    }
  });

  const [isScanning, setIsScanning] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState(null);
  const [wifiPassword, setWifiPassword] = useState('');
  const [connectingNetwork, setConnectingNetwork] = useState(null);
  
  // Bluetooth state
  const [isBluetoothScanning, setIsBluetoothScanning] = useState(false);
  const [bluetoothDevices, setBluetoothDevices] = useState([]);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setIsLoading(true);
    try {
      const hostSettings = await hostAPI.getSystemSettings();
      setSettings(prev => ({
        ...prev,
        ...hostSettings
      }));
    } catch (error) {
      console.error('Failed to load settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleWifiScan = async () => {
    setIsScanning(true);
    try {
      const networks = await hostAPI.scanWifiNetworks();
      setSettings(prev => ({
        ...prev,
        connectivity: {
          ...prev.connectivity,
          networks
        }
      }));
    } catch (error) {
      console.error('Failed to scan networks:', error);
    } finally {
      setIsScanning(false);
    }
  };

  const handleBluetoothScan = async () => {
    setIsBluetoothScanning(true);
    try {
      const devices = await hostAPI.scanBluetoothDevices();
      setBluetoothDevices(devices);
    } catch (error) {
      console.error('Failed to scan Bluetooth devices:', error);
    } finally {
      setIsBluetoothScanning(false);
    }
  };

  const handleBluetoothAction = async (mac, action) => {
    try {
      const result = await hostAPI.bluetoothAction(mac, action);
      // Refresh device list after action
      handleBluetoothScan();
      return result;
    } catch (error) {
      console.error('Bluetooth action failed:', error);
    }
  };

  const handleWifiConnect = async (ssid, password) => {
    setConnectingNetwork(ssid);
    try {
      await hostAPI.connectToWifi(ssid, password);
      await loadSettings();
      setSelectedNetwork(null);
      setWifiPassword('');
    } catch (error) {
      console.error('Failed to connect:', error);
    } finally {
      setConnectingNetwork(null);
    }
  };

  const handleSliderChange = async (category, setting, value) => {
    try {
      const newSettings = await hostAPI.updateSystemSetting(category, setting, value);
      setSettings(prev => ({
        ...prev,
        ...newSettings
      }));
    } catch (error) {
      console.error(`Failed to update ${category}.${setting}:`, error);
    }
  };

  const ConnectivitySubscreen = () => (
    <div className="absolute inset-0 bg-black/40 rounded-2xl p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setActiveSubscreen(null)} 
          className="mr-4"
        >
          <ChevronRight size={24} className="text-white rotate-180" />
        </button>
        <div className="text-2xl font-bold text-white">Connectivity</div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        {/* WiFi Section */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white/50 px-4">WiFi</div>
          <button 
            onClick={async () => {
              await handleSliderChange('connectivity', 'wifi', !settings.connectivity.wifi);
            }}
            className="w-full flex justify-between items-center p-4 bg-white/5 rounded-xl"
          >
            <span className="text-white">WiFi</span>
            <div 
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.connectivity.wifi ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.connectivity.wifi ? 'right-1' : 'left-1'
                }`} 
              />
            </div>
          </button>

          {settings.connectivity.wifi && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <span className="text-white/70">Available Networks</span>
                <button 
                  onClick={handleWifiScan}
                  className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
                    isScanning ? 'animate-spin' : ''
                  }`}
                >
                  <RefreshCw size={16} className="text-white" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {settings.connectivity.networks.map((network) => (
                  <button
                    key={network.ssid}
                    onClick={() => setSelectedNetwork(network)}
                    className="w-full p-4 bg-white/5 rounded-xl flex items-center justify-between hover:bg-white/10 transition-colors"
                  >
                    <div className="flex items-center space-x-3">
                      <Signal size={16} className="text-white/70" />
                      <span className="text-white">{network.ssid}</span>
                    </div>
                    {network.secured && <Lock size={16} className="text-white/70" />}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Bluetooth Section */}
        <div className="space-y-4">
          <div className="text-sm font-medium text-white/50 px-4">Bluetooth</div>
          <button 
            onClick={async () => {
              try {
                const result = await hostAPI.toggleBluetooth(!settings.connectivity.bluetooth);
                setSettings(prev => ({
                  ...prev,
                  connectivity: {
                    ...prev.connectivity,
                    bluetooth: result.bluetooth
                  }
                }));
                if (result.bluetooth) {
                  handleBluetoothScan();
                } else {
                  setBluetoothDevices([]);
                }
              } catch (error) {
                console.error('Failed to toggle Bluetooth:', error);
              }
            }}
            className="w-full flex justify-between items-center p-4 bg-white/5 rounded-xl"
          >
            <span className="text-white">Bluetooth</span>
            <div 
              className={`w-12 h-6 rounded-full relative transition-colors ${
                settings.connectivity.bluetooth ? 'bg-green-500' : 'bg-gray-600'
              }`}
            >
              <span 
                className={`absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full transition-transform ${
                  settings.connectivity.bluetooth ? 'right-1' : 'left-1'
                }`} 
              />
            </div>
          </button>

          {settings.connectivity.bluetooth && (
            <div className="space-y-2">
              <div className="flex justify-between items-center px-4">
                <span className="text-white/70">Available Devices</span>
                <button 
                  onClick={handleBluetoothScan}
                  className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${
                    isBluetoothScanning ? 'animate-spin' : ''
                  }`}
                >
                  <RefreshCw size={16} className="text-white" />
                </button>
              </div>
              
              <div className="space-y-2 max-h-[calc(100vh-16rem)] overflow-y-auto">
                {bluetoothDevices.map((device) => (
                  <div
                    key={device.mac}
                    className="w-full p-4 bg-white/5 rounded-xl flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-3">
                      <Bluetooth size={16} className="text-white/70" />
                      <div>
                        <div className="text-white">{device.name}</div>
                        <div className="text-xs text-white/50">{device.mac}</div>
                      </div>
                    </div>
                    {device.paired ? (
                      <button
                        onClick={() => handleBluetoothAction(device.mac, device.connected ? 'disconnect' : 'connect')}
                        className={`px-3 py-1 rounded-full text-sm ${
                          device.connected 
                            ? 'bg-green-500/20 text-green-500' 
                            : 'bg-white/10 text-white/70'
                        }`}
                      >
                        {device.connected ? 'Connected' : 'Connect'}
                      </button>
                    ) : (
                      <button
                        onClick={() => handleBluetoothAction(device.mac, 'pair')}
                        className="px-3 py-1 rounded-full text-sm bg-white/10 text-white/70 hover:bg-white/20"
                      >
                        Pair
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {selectedNetwork && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h3 className="text-xl font-bold text-white mb-4">
              Connect to {selectedNetwork.ssid}
            </h3>
            
            {selectedNetwork.secured && (
              <input
                type="password"
                value={wifiPassword}
                onChange={(e) => setWifiPassword(e.target.value)}
                placeholder="Network Password"
                className="w-full p-3 rounded-lg bg-black/40 text-white mb-4"
              />
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setSelectedNetwork(null);
                  setWifiPassword('');
                }}
                className="px-4 py-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleWifiConnect(selectedNetwork.ssid, wifiPassword)}
                disabled={selectedNetwork.secured && !wifiPassword}
                className="px-4 py-2 rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {connectingNetwork === selectedNetwork.ssid ? 'Connecting...' : 'Connect'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  const SoundSubscreen = () => (
    <div className="absolute inset-0 bg-black/40 rounded-2xl p-4">
      <div className="flex items-center mb-6">
        <button 
          onClick={() => setActiveSubscreen(null)} 
          className="mr-4"
        >
          <ChevronRight size={24} className="text-white rotate-180" />
        </button>
        <div className="text-2xl font-bold text-white">Sound</div>
      </div>
      <div className="space-y-4">
        <div className="p-4 bg-white/5 rounded-xl">
          <div className="flex justify-between items-center mb-2">
            <span className="text-white">Volume</span>
            <span className="text-white/50">{settings.sound.volume}%</span>
          </div>
          <DraggableSlider 
            value={settings.sound.volume}
            onChange={(val) => handleSliderChange('sound', 'volume', val)}
          />
        </div>
      </div>
    </div>
  );

  if (isLoading) {
    return (
      <div className="relative z-10">
        <div className="bg-black/40 rounded-2xl p-4 border border-white/10 shadow-lg">
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
          </div>
        </div>
      </div>
    );
  }

  if (activeSubscreen === 'connectivity') return <ConnectivitySubscreen />;
  if (activeSubscreen === 'display') return <DisplaySubscreen />;
  if (activeSubscreen === 'sound') return <SoundSubscreen />;

  const settingsGroups = [
    {
      title: 'Connectivity',
      items: [
        { 
          icon: Wifi,
          label: 'Wireless',
          value: settings.connectivity.wifi ? 'Connected' : 'Disconnected',
          onClick: () => setActiveSubscreen('connectivity')
        },
        {
          icon: Bluetooth,
          label: 'Bluetooth',
          value: settings.connectivity.bluetooth 
            ? `${bluetoothDevices.filter(d => d.connected).length} Connected`
            : 'Off',
          onClick: () => setActiveSubscreen('connectivity')
        },
        {
          icon: Signal,
          label: 'System Status',
          value: `CPU: ${settings.system.temperature}`,
          onClick: () => {}
        }
      ]
    },
    {
      title: 'Display & Sound',
      items: [
        { 
          icon: Volume2, 
          label: 'Sound', 
          value: `Volume: ${settings.sound.volume}%`,
          onClick: () => setActiveSubscreen('sound')
        },
        { 
          icon: Moon, 
          label: 'Display', 
          value: `Brightness: ${settings.display.brightness}%`,
          onClick: () => setActiveSubscreen('display')
        }
      ]
    },
    {
      title: 'System',
      items: [
        { 
          icon: Languages, 
          label: 'Language', 
          value: settings.system.language,
          onClick: () => {}
        },
        { 
          icon: Car, 
          label: 'Navigation', 
          value: settings.system.navigation ? 'Enabled' : 'Disabled',
          onClick: async () => {
            await handleSliderChange('system', 'navigation', !settings.system.navigation);
          }
        }
      ]
    }
  ];

  return (
    <div className="relative z-10">
      <div className="bg-black/40 rounded-2xl p-4 border border-white/10 shadow-lg">
        <div className="text-2xl font-bold text-white mb-6">Settings</div>
        {settingsGroups.map((group) => (
          <div key={group.title} className="mb-6 last:mb-0">
            <div className="text-sm font-medium text-white/50 mb-2 px-4">{group.title}</div>
            <div className="space-y-1">
              {group.items.map(setting => (
                <button
                  key={setting.label}
                  onClick={setting.onClick}
                  className="w-full flex items-center justify-between p-4 rounded-xl
                             hover:bg-white/5 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center">
                      <setting.icon size={20} className="text-white/70" />
                    </div>
                    <div className="text-left">
                      <div className="text-white">{setting.label}</div>
                      <div className="text-sm text-white/50">{setting.value}</div>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-white/30" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const SettingsTab = () => (
  <div className="relative h-full w-full p-6">
    <div className="absolute inset-0 bg-gradient-to-br from-gray-900/20 to-black"></div>
    <SettingsList />
  </div>
);

export default SettingsTab;