import { createElement, useEffect, useRef, useState } from 'react';
import { Asset } from 'expo-asset';
import { Directory, File, Paths } from 'expo-file-system';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { WebView } from 'react-native-webview';
import { C, F } from './theme';

// Film intro renderowany skryptem scripts/gen_intro.py
const INTRO = require('../assets/video/intro.mp4');

// Odtwarzacz HTML5 w WebView: na iPhonie VideoView z expo-video grał sam dźwięk na czarnym tle,
// a wideo w WKWebView wyświetla obraz pewnie. Strona zgłasza stan filmu przez postMessage.
const PAGE = `<!doctype html>
<html><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">
<style>
html,body{margin:0;width:100%;height:100%;background:#000;overflow:hidden}
video{position:fixed;top:0;left:0;width:100%;height:100%;object-fit:cover;background:#000}
</style></head>
<body><video id="v" src="intro.mp4" playsinline webkit-playsinline preload="auto"></video>
<script>
var v = document.getElementById('v');
function send(m) { if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(m); }
function play() { var p = v.play(); if (p && p.catch) p.catch(function () { send('blocked'); }); }
v.addEventListener('playing', function () { send('playing'); });
v.addEventListener('ended', function () { send('ended'); });
v.addEventListener('error', function () { send('error'); });
document.addEventListener('touchend', play);
play();
</script></body></html>`;

// WebView czyta pliki tylko z jednego katalogu, więc film i strona lądują razem w cache
async function prepareFiles() {
  const asset = await Asset.fromModule(INTRO).downloadAsync();
  const dir = new Directory(Paths.cache, 'intro');
  if (!dir.exists) dir.create({ intermediates: true });
  const src = new File(asset.localUri || asset.uri);
  const video = new File(dir, 'intro.mp4');
  if (!video.exists || video.size !== src.size) {
    if (video.exists) video.delete();
    await src.copy(video);
  }
  const page = new File(dir, 'intro.html');
  if (!page.exists) page.create();
  await page.write(PAGE);
  return { page: page.uri, dir: dir.uri };
}

export default function Intro({ onDone }) {
  const insets = useSafeAreaInsets();
  const [note, setNote] = useState('Wczytywanie filmu…');
  const [files, setFiles] = useState(null);
  const finished = useRef(false);
  const started = useRef(false);
  const finish = () => {
    if (finished.current) return;
    finished.current = true;
    onDone();
  };
  const fail = (msg) => {
    setNote(msg);
    setTimeout(finish, 2500);
  };
  const onState = (state) => {
    if (state === 'playing') {
      started.current = true;
      setNote(null);
    } else if (state === 'ended') finish();
    else if (state === 'blocked') {
      // System wstrzymał autoodtwarzanie: czekamy na stuknięcie zamiast przerywać po czasie
      started.current = true;
      setNote('Stuknij ekran, aby odtworzyć film');
    }
    else if (state === 'error') fail('Nie udało się odtworzyć filmu');
  };

  useEffect(() => {
    let alive = true;
    if (Platform.OS !== 'web') {
      prepareFiles()
        .then((f) => alive && setFiles(f))
        .catch((e) => alive && fail(`Nie udało się wczytać filmu: ${e?.message || e}`));
    }
    // Gdyby film nie ruszył w ciągu 12 s, nie trzymamy gracza na czarnym ekranie
    const guard = setTimeout(() => alive && !started.current && finish(), 12000);
    return () => {
      alive = false;
      clearTimeout(guard);
    };
  }, []);

  let player = null;
  if (Platform.OS === 'web') {
    // Podgląd w przeglądarce: zwykły element <video>
    player = createElement('video', {
      src: Asset.fromModule(INTRO).uri,
      autoPlay: true,
      playsInline: true,
      onPlaying: () => onState('playing'),
      onEnded: () => onState('ended'),
      onError: () => onState('error'),
      style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' },
    });
  } else if (files) {
    player = (
      <WebView
        source={{ uri: files.page }}
        allowingReadAccessToURL={files.dir}
        originWhitelist={['*']}
        allowFileAccess
        allowFileAccessFromFileURLs
        allowsInlineMediaPlayback
        mediaPlaybackRequiresUserAction={false}
        scrollEnabled={false}
        bounces={false}
        style={s.web}
        containerStyle={StyleSheet.absoluteFill}
        onMessage={(e) => onState(e.nativeEvent.data)}
        onError={() => onState('error')}
      />
    );
  }

  return (
    <View style={s.wrap}>
      {player}
      {note ? <Text style={s.note} pointerEvents="none">{note}</Text> : null}
      <Pressable onPress={finish} hitSlop={16} style={[s.skip, { top: insets.top + 12, right: insets.right + 16 }]}>
        <Text style={s.skipText}>POMIŃ ›</Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { ...StyleSheet.absoluteFillObject, backgroundColor: '#000', justifyContent: 'center' },
  web: { flex: 1, backgroundColor: '#000' },
  note: { position: 'absolute', left: 0, right: 0, fontFamily: F.medium, fontSize: 14, color: C.dim, textAlign: 'center', paddingHorizontal: 32 },
  skip: { position: 'absolute', borderWidth: 1, borderColor: 'rgba(255,255,255,0.4)', paddingVertical: 6, paddingHorizontal: 12, backgroundColor: 'rgba(0,0,0,0.35)' },
  skipText: { fontFamily: F.bold, fontSize: 13, letterSpacing: 2, color: C.text },
});
