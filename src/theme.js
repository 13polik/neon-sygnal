import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';

export const C = {
  bg: '#07080f',
  panel: '#10121f',
  line: '#262a44',
  text: '#d9dcf2',
  dim: '#7a7fa6',
  pink: '#ff2e88',
  cyan: '#2ef2ff',
  yellow: '#ffd23f',
  green: '#3dff9a',
  red: '#ff4757',
};

export const F = {
  regular: 'ChakraPetch_400Regular',
  medium: 'ChakraPetch_500Medium',
  bold: 'ChakraPetch_700Bold',
};

// Wibracje działają tylko na telefonie, w przeglądarce są pomijane
export function buzz(kind) {
  if (Platform.OS === 'web') return;
  try {
    if (kind === 'ok') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    else if (kind === 'bad') Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    else Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {}
}
