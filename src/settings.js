import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = 'neon-sygnal/settings';

export const DEFAULT_SETTINGS = { music: true, sound: true, haptics: true, speed: 'normal', big: false };

// Ile znaków tekstu pojawia się co klatkę animacji pisania
export const TEXT_SPEED = { slow: 1, normal: 3, fast: 7, instant: Infinity };

export async function loadSettings() {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    return { ...DEFAULT_SETTINGS, ...(raw ? JSON.parse(raw) : {}) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export async function saveSettings(settings) {
  try {
    await AsyncStorage.setItem(KEY, JSON.stringify(settings));
  } catch {}
}
