// pages/api/system/settings.js
import { exec } from 'child_process';
import util from 'util';
import fs from 'fs/promises';

const execAsync = util.promisify(exec);

// Check what brightness control method is available
async function checkBrightnessMethod() {
  try {
    await fs.access('/sys/class/backlight/rpi_backlight/brightness');
    return 'backlight';
  } catch {
    try {
      await execAsync('which xrandr');
      return 'xrandr';
    } catch {
      return 'none';
    }
  }
}

// Raspbian-specific system commands
const systemCommands = {
  // Display settings
  async setBrightness(value) {
    try {
      const method = await checkBrightnessMethod();
      
      if (method === 'backlight') {
        const pwmValue = Math.round((value / 100) * 255);
        await execAsync(`sudo sh -c 'echo ${pwmValue} > /sys/class/backlight/rpi_backlight/brightness'`);
      } else if (method === 'xrandr') {
        const xrandrValue = value / 100;
        await execAsync(`xrandr --output $(xrandr | grep " connected" | cut -f1 -d " ") --brightness ${xrandrValue}`);
      }
      return true;
    } catch (error) {
      console.error('Failed to set brightness:', error);
      return false;
    }
  },

  // Sound settings using amixer
  async setVolume(value) {
    try {
      await execAsync(`amixer set Master ${value}% -M`);
      return true;
    } catch (error) {
      console.error('Failed to set volume:', error);
      return false;
    }
  },

  // Network settings using rfkill
  async setWifi(enabled) {
    try {
      const command = enabled 
        ? 'sudo rfkill unblock wifi' 
        : 'sudo rfkill block wifi';
      await execAsync(command);
      return true;
    } catch (error) {
      console.error('Failed to set WiFi:', error);
      return false;
    }
  },

  // Get current system settings
  async getCurrentSettings() {
    try {
      // Get brightness
      let brightness = 50; // Default value
      const brightnessMethod = await checkBrightnessMethod();
      
      if (brightnessMethod === 'backlight') {
        const { stdout: brightnessValue } = await execAsync(
          'cat /sys/class/backlight/rpi_backlight/brightness'
        );
        brightness = Math.round((parseInt(brightnessValue) / 255) * 100);
      }

      // Get volume
      let volume = 50; // Default value
      try {
        const { stdout: volumeValue } = await execAsync(
          "amixer get Master | grep -o '[0-9]*%' | head -1 | tr -d '%'"
        );
        volume = parseInt(volumeValue);
      } catch (error) {
        console.error('Failed to get volume:', error);
      }

      // Get WiFi status using rfkill
      let wifiEnabled = false;
      try {
        const { stdout: wifiStatus } = await execAsync(
          'rfkill list wifi | grep "Soft blocked"'
        );
        wifiEnabled = !wifiStatus.includes('yes');
      } catch (error) {
        console.error('Failed to get WiFi status:', error);
      }

      // Get system temperature
      let temp = 'N/A';
      try {
        const { stdout: tempValue } = await execAsync(
          'vcgencmd measure_temp'
        );
        temp = tempValue.replace('temp=', '').trim();
      } catch (error) {
        console.error('Failed to get temperature:', error);
      }

      return {
        connectivity: {
          wifi: wifiEnabled,
          bluetooth: false,
          mobileData: false,
          networks: []
        },
        display: {
          brightness,
          theme: 'dark'
        },
        sound: {
          volume,
          audioProfile: 'standard'
        },
        system: {
          language: 'English',
          units: 'metric',
          navigation: true,
          temperature: temp
        }
      };
    } catch (error) {
      console.error('Failed to get system settings:', error);
      throw error;
    }
  }
};

export default async function handler(req, res) {
  try {
    if (req.method === 'GET') {
      const settings = await systemCommands.getCurrentSettings();
      return res.status(200).json(settings);
    }

    if (req.method === 'POST') {
      const { category, setting, value } = req.body;

      let success = false;

      switch (`${category}.${setting}`) {
        case 'display.brightness':
          success = await systemCommands.setBrightness(value);
          break;
        case 'sound.volume':
          success = await systemCommands.setVolume(value);
          break;
        case 'connectivity.wifi':
          success = await systemCommands.setWifi(value);
          break;
        default:
          return res.status(400).json({ error: 'Invalid setting' });
      }

      if (success) {
        // Get updated settings after change
        const newSettings = await systemCommands.getCurrentSettings();
        return res.status(200).json(newSettings);
      } else {
        return res.status(500).json({ error: 'Failed to update setting' });
      }
    }

    // Handle unsupported methods
    res.setHeader('Allow', ['GET', 'POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });

  } catch (error) {
    console.error('API error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}