// pages/api/system/wifi/connect.js
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

const execAsync = util.promisify(exec);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { ssid, password } = req.body;

  if (!ssid) {
    return res.status(400).json({ error: 'SSID is required' });
  }

  try {
    // Create wpa_supplicant configuration
    const wpaConfig = `
network={
    ssid="${ssid}"
    ${password ? `psk="${password}"` : 'key_mgmt=NONE'}
    key_mgmt=${password ? 'WPA-PSK' : 'NONE'}
}`;

    // Write to temporary file
    await fs.writeFile('/tmp/wpa_supplicant.conf', wpaConfig);

    // Move file to system location and set permissions
    await execAsync('sudo mv /tmp/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf');
    await execAsync('sudo chmod 600 /etc/wpa_supplicant/wpa_supplicant.conf');

    // Restart wireless interface
    await execAsync('sudo ifconfig wlan0 down');
    await execAsync('sudo ifconfig wlan0 up');
    await execAsync('sudo wpa_cli -i wlan0 reconfigure');

    // Wait a bit for connection
    await new Promise(resolve => setTimeout(resolve, 5000));

    // Check connection status
    const { stdout: status } = await execAsync('iwconfig wlan0');
    const connected = status.includes(ssid);

    if (connected) {
      return res.status(200).json({ success: true, message: 'Connected successfully' });
    } else {
      return res.status(400).json({ error: 'Failed to connect' });
    }

  } catch (error) {
    console.error('Failed to connect to WiFi:', error);
    return res.status(500).json({ error: 'Failed to connect to WiFi network' });
  }
}