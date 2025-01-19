// pages/api/system/bluetooth/toggle.js
import { exec } from 'child_process';
import util from 'util';

const execAsync = util.promisify(exec);

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
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return res.status(400).json({ error: 'enabled parameter must be a boolean' });
  }

  try {
    // Enable/disable bluetooth adapter
    await runBluetoothCommand(enabled ? 'power on' : 'power off');
    
    // Get current status
    const status = await runBluetoothCommand('show');
    const isPowered = status.includes('Powered: yes');

    return res.status(200).json({ 
      bluetooth: isPowered,
      state: isPowered ? 'on' : 'off'
    });

  } catch (error) {
    console.error('Failed to toggle Bluetooth:', error);
    return res.status(500).json({ 
      error: 'Failed to toggle Bluetooth',
      details: error.message
    });
  }
}