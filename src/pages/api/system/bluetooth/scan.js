// pages/api/system/bluetooth/scan.js
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

// Helper function to execute bluetoothctl commands
const runBluetoothCommand = async (command) => {
  try {
    const { stdout } = await execAsync(`echo "${command}" | bluetoothctl`);
    return stdout;
  } catch (error) {
    console.error(`Bluetooth command failed: ${command}`, error);
    throw error;
  }
};

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  try {
    // First ensure bluetooth is powered on
    await runBluetoothCommand('power on');
    
    // Start scanning
    await runBluetoothCommand('scan on');

    // Wait a few seconds for devices to be discovered
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Stop scanning
    await runBluetoothCommand('scan off');

    // Get list of devices
    const devicesOutput = await runBluetoothCommand('devices');
    
    // Get paired devices
    const pairedOutput = await runBluetoothCommand('paired-devices');

    // Parse the device lists
    const devices = [];
    const seenDevices = new Set();

    // Helper to parse device info
    const parseDeviceLine = (line, isPaired = false) => {
      const match = line.match(/Device\s+([0-9A-F:]+)\s+(.*)/i);
      if (match && match[1] && !seenDevices.has(match[1])) {
        seenDevices.add(match[1]);
        return {
          mac: match[1],
          name: match[2] || 'Unknown Device',
          paired: isPaired,
          connected: false, // Will be updated later
          type: 'unknown'   // Will be updated with info command
        };
      }
      return null;
    };

    // Parse regular devices
    devicesOutput.split('\n').forEach(line => {
      const device = parseDeviceLine(line, false);
      if (device) devices.push(device);
    });

    // Parse paired devices
    pairedOutput.split('\n').forEach(line => {
      const device = parseDeviceLine(line, true);
      if (device) devices.push(device);
    });

    // Get additional info for each device
    for (const device of devices) {
      try {
        const info = await runBluetoothCommand(`info ${device.mac}`);
        
        // Update connection status
        device.connected = info.includes('Connected: yes');
        
        // Determine device type
        if (info.includes('Icon: audio-card')) {
          device.type = 'audio';
        } else if (info.includes('Icon: input-keyboard')) {
          device.type = 'keyboard';
        } else if (info.includes('Icon: input-mouse')) {
          device.type = 'mouse';
        } else if (info.includes('Icon: phone')) {
          device.type = 'phone';
        }

        // Get signal strength if connected
        if (device.connected) {
          const { stdout: rssi } = await execAsync(`hcitool rssi ${device.mac}`);
          const rssiMatch = rssi.match(/RSSI return value: (-?\d+)/);
          if (rssiMatch) {
            device.signal = parseInt(rssiMatch[1]);
          }
        }
      } catch (error) {
        console.warn(`Failed to get info for device ${device.mac}:`, error);
      }
    }

    return res.status(200).json(devices);

  } catch (error) {
    console.error('Failed to scan Bluetooth devices:', error);
    return res.status(500).json({ 
      error: 'Failed to scan Bluetooth devices',
      details: error.message
    });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};