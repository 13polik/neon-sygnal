import { useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { C, F } from './theme';

// Film intro renderowany skryptem scripts/gen_intro.py
const INTRO = require('../assets/video/intro.mp4');

export default function Intro({ onDone }) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('Wczytywanie filmu…');
  const finished = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };
  const player = useVideoPlayer(null, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    let alive = true;
    const subs = [
      player.addListener('statusChange', ({ status, error }) => {
        if (status === 'readyToPlay') {
          setNote(null);
          player.play();
        } else if (status === 'error') {
          setNote(`Nie udało się odtworzyć filmu${error?.message ? `: ${error.message}` : ''}`);
          setTimeout(finish, 2500);
        }
      }),
      player.addListener('playToEnd', finish),
    ];
    // Pełna ścieżka do pliku z expo-asset jest pewniejsza w zbudowanej aplikacji niż sam require
    Asset.fromModule(INTRO)
      .downloadAsync()
      .then((asset) => alive && player.replaceAsync({ uri: asset.localUri || asset.uri }))
      .then(() => alive && player.play())
      .catch((e) => {
        if (!alive) return;
        setNote(`Nie udało się wczytać filmu: ${e?.message || e}`);
        setTimeout(finish, 2500);
      });
    // Gdyby film nie ruszył w ciągu 10 s, nie trzymamy gracza na czarnym ekranie
    const guard = setTimeout(() => alive && player.status !== 'readyToPlay' && !player.playing && finish(), 10000);
    return () => {
      alive = false;
      clearTimeout(guard);
      subs.forEach((s) => s.remove());
    };
  }, [player]);

  return (
    <View style={s.wrap}>
      <VideoView player={player} style={StyleSheet.absoluteFill} contentFit="cover" nativeControls={false} />
      {/* Stuknięcie w ekran uruchamia film, gdyby system wstrzymał automatyczne odtwarzanie */}
      <Pressable style={StyleSheet.absoluteFill} onPress={() => player.play()} />
      {note ? <Text style={s.note} pointerEvents="none">{note}</Text> : null}
      <Pressable onPress={finish} hitSlop={16} style={[s.skip, { top: insets.top + 12, right: insets.right + 16 }]}>
        <Text style={s.skipText}>POMIŃ ›</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center' },
  note: { fontFamily: F.medium, fontSize: 14, color: C.dim, textAlign: 'center', paddingHorizontal: 32 },
  skip: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  skipText: { fontFamily: F.bold, fontSize: 13, letterSpacing: 2, color: C.text },
});
