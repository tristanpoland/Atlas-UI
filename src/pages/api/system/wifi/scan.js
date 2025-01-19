// pages/api/system/wifi/scan.js
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Helper to convert signal level to percentage
const signalToPercentage = (level) => {
  // Signal level is typically between -100 dBm (worst) and -50 dBm (best)
  const min = -100;
  const max = -50;
  const normalized = Math.min(Math.max(level, min), max);
  return Math.round(((normalized - min) / (max - min)) * 100);
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // First ensure the interface is up
    await execAsync('sudo ip link set wlan0 up');
    
    // Wait a moment for the interface to come up
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Scan for networks using iwlist
    const { stdout } = await execAsync('sudo iwlist wlan0 scan');
    
    // Parse the iwlist output
    const networks = [];
    let currentNetwork = null;

    stdout.split('\n').forEach(line => {
      line = line.trim();
      
      // Start of a new cell indicates a new network
      if (line.startsWith('Cell')) {
        if (currentNetwork && currentNetwork.ssid) {
          networks.push(currentNetwork);
        }
        currentNetwork = {
          ssid: '',
          signal: 0,
          quality: 0,
          secured: false,
          encryption: '',
          frequency: '',
          channel: ''
        };
        
        // Extract MAC address
        const macMatch = line.match(/Address: ([0-9A-F:]+)/i);
        if (macMatch) {
          currentNetwork.mac = macMatch[1];
        }
      } 
      // Extract SSID
      else if (line.startsWith('ESSID:')) {
        currentNetwork.ssid = line.split(':')[1].replace(/"/g, '').trim();
      }
      // Extract signal level
      else if (line.includes('Signal level=')) {
        const signalMatch = line.match(/Signal level=(-\d+)/);
        if (signalMatch) {
          const dbm = parseInt(signalMatch[1]);
          currentNetwork.signal = signalToPercentage(dbm);
        }

        const qualityMatch = line.match(/Quality=(\d+)\/(\d+)/);
        if (qualityMatch) {
          currentNetwork.quality = Math.round((parseInt(qualityMatch[1]) / parseInt(qualityMatch[2])) * 100);
        }
      }
      // Check encryption
      else if (line.includes('Encryption key:')) {
        currentNetwork.secured = line.includes('on');
      }
      // Get encryption type
      else if (line.includes('IE: IEEE 802.11i/WPA2')) {
        currentNetwork.encryption = 'WPA2';
      }
      else if (line.includes('IE: WPA Version 1')) {
        currentNetwork.encryption = 'WPA';
      }
      // Get frequency
      else if (line.includes('Frequency:')) {
        const freqMatch = line.match(/Frequency:([\d.]+ GHz)/);
        if (freqMatch) {
          currentNetwork.frequency = freqMatch[1];
        }
        const channelMatch = line.match(/\(Channel (\d+)\)/);
        if (channelMatch) {
          currentNetwork.channel = channelMatch[1];
        }
      }
    });

    // Add the last network if it exists
    if (currentNetwork && currentNetwork.ssid) {
      networks.push(currentNetwork);
    }

    // Filter out hidden networks and duplicates
    const filteredNetworks = networks
      .filter(n => n.ssid && n.ssid !== '')
      .filter((network, index, self) => 
        index === self.findIndex(n => n.ssid === network.ssid)
      )
      .sort((a, b) => b.signal - a.signal);

    return res.status(200).json(filteredNetworks);

  } catch (error) {
    console.error('Failed to scan WiFi networks:', error);
    return res.status(500).json({ 
      error: 'Failed to scan WiFi networks',
      details: error.message
    });
  }
}

// Configure body parser
export const config = {
  api: {
    bodyParser: true,
  },
};