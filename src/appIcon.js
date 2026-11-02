import { Platform } from 'react-native';

// Zmiana ikony aplikacji (expo-alternate-app-icons). Działa w zbudowanej aplikacji,
// nie w przeglądarce ani w Expo Go, dlatego moduł ładujemy ostrożnie.
let mod = null;
if (Platform.OS !== 'web') {
  try {
    mod = require('expo-alternate-app-icons');
  } catch {}
}

// key to nazwa z app.json (null = ikona domyślna); ikony generuje scripts/gen_icons.py
export const ICONS = [
  { key: null, label: 'Neon', thumb: require('../assets/icons/thumb_neon.jpg') },
  { key: 'Mira', label: 'Mira', thumb: require('../assets/icons/thumb_mira.jpg') },
  { key: 'Wieza', label: 'Wieża', thumb: require('../assets/icons/thumb_wieza.jpg') },
  { key: 'Sokol', label: 'Sokół', thumb: require('../assets/icons/thumb_sokol.jpg') },
  { key: 'Dolina', label: 'Dolina', thumb: require('../assets/icons/thumb_dolina.jpg') },
  { key: 'Oko', label: 'Oko', thumb: require('../assets/icons/thumb_oko.jpg') },
  { key: 'Pchla', label: 'Pchła', thumb: require('../assets/icons/thumb_pchla.jpg') },
  { key: 'Igla', label: 'Igła', thumb: require('../assets/icons/thumb_igla.jpg') },
  { key: 'Gawron', label: 'Gawron', thumb: require('../assets/icons/thumb_gawron.jpg') },
  { key: 'Teodor', label: 'Teodor', thumb: require('../assets/icons/thumb_teodor.jpg') },
  { key: 'Wren', label: 'Wren', thumb: require('../assets/icons/thumb_wren.jpg') },
  { key: 'Prezes', label: 'Prezes', thumb: require('../assets/icons/thumb_prezes.jpg') },
  { key: 'Iglica', label: 'Iglica', thumb: require('../assets/icons/thumb_iglica.jpg') },
  { key: 'Chip', label: 'Chip', thumb: require('../assets/icons/thumb_chip.jpg') },
  { key: 'Poscig', label: 'Pościg', thumb: require('../assets/icons/thumb_poscig.jpg') },
  { key: 'Sygnal', label: 'Sygnał', thumb: require('../assets/icons/thumb_sygnal.jpg') },
  { key: 'Retro', label: 'Retro', thumb: require('../assets/icons/thumb_retro.jpg') },
];

export function iconSupported() {
  try {
    return !!mod?.supportsAlternateIcons;
  } catch {
    return false;
  }
}

export function currentIcon() {
  try {
    return mod?.getAppIconName() ?? null;
  } catch {
    return null;
  }
}

export async function setIcon(key) {
  if (!iconSupported()) return false;
  try {
    await mod.setAlternateAppIcon(key);
    return true;
  } catch {
    return false;
  }
}
