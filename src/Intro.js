import { useRef } from 'react';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from './theme';

// Film intro renderowany skryptem scripts/gen_intro.py
const INTRO = require('../assets/video/intro.mp4');

export default function Intro({ onDone }) {
  const insets = useSafeAreaInsets();
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };
  const player = useVideoPlayer(INTRO, (p) => {
    p.loop = false;
    p.play();
  });
  useEventListener(player, 'playToEnd', finish);

  return (
    <View style={s.wrap}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      <Pressable onPress={finish} hitSlop={16} style={[s.skip, { top: insets.top + 12, right: insets.right + 16 }]}>
        <Text style={s.skipText}>POMIŃ ›</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000' },
  skip: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  skipText: { fontFamily: F.bold, fontSize: 13, letterSpacing: 2, color: C.text },
});
