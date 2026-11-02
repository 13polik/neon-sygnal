import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, StyleSheet, View, useWindowDimensions } from 'react-native';
import { C } from './theme';

// Ilustracje są generowane skryptem scripts/gen_art.py
export const ART = {
  street: require('../assets/scenes/street.jpg'),
  drone: require('../assets/scenes/drone.jpg'),
  bike: require('../assets/scenes/bike.jpg'),
  roofs: require('../assets/scenes/roofs.jpg'),
  bar: require('../assets/scenes/bar.jpg'),
  laundry: require('../assets/scenes/laundry.jpg'),
  sluza: require('../assets/scenes/sluza.jpg'),
  clinic: require('../assets/scenes/clinic.jpg'),
  tower: require('../assets/scenes/tower.jpg'),
  metro: require('../assets/scenes/metro.jpg'),
  station: require('../assets/scenes/station.jpg'),
  train: require('../assets/scenes/train.jpg'),
  agent: require('../assets/scenes/agent.jpg'),
  iglica: require('../assets/scenes/iglica.jpg'),
  blackout: require('../assets/scenes/blackout.jpg'),
  lab: require('../assets/scenes/lab.jpg'),
  server: require('../assets/scenes/server.jpg'),
  archive: require('../assets/scenes/archive.jpg'),
  ramp: require('../assets/scenes/ramp.jpg'),
  mem_kitchen: require('../assets/scenes/mem_kitchen.jpg'),
  mem_tower: require('../assets/scenes/mem_tower.jpg'),
  mem_clinic: require('../assets/scenes/mem_clinic.jpg'),
  dawn: require('../assets/scenes/dawn.jpg'),
  cell: require('../assets/scenes/cell.jpg'),
  whiteroom: require('../assets/scenes/whiteroom.jpg'),
  network: require('../assets/scenes/network.jpg'),
  billboard: require('../assets/scenes/billboard.jpg'),
  ash: require('../assets/scenes/ash.jpg'),
  flatline: require('../assets/scenes/flatline.jpg'),
};

// Sceny fabuły bez wpisu dostają ilustrację po prefiksie id (patrz artFor)
const BY_NODE = {
  start: 'street',
  haggle: 'street',
  street: 'drone',
  drone_win: 'drone',
  drone_lose: 'drone',
  bike_win: 'bike',
  bike_crash: 'bike',
  dolina_intro: 'street',
  bruno_map: 'bar',
  bruno_truth: 'bar',
  station: 'station',
  train_calm: 'train',
  train_warned: 'station',
  train_agent: 'agent',
  iglica_enter: 'iglica',
  iglica_blackout: 'blackout',
  lobby: 'lab',
  wren_doubt: 'lab',
  memory_1: 'mem_kitchen',
  memory_2: 'mem_tower',
  memory_3: 'mem_clinic',
  end_name: 'dawn',
  end_signal: 'dawn',
  end_martyr: 'cell',
  end_ghost: 'network',
  end_delivered: 'billboard',
  end_ash: 'ash',
  end_rats: 'metro',
  end_caught: 'whiteroom',
  end_flatline: 'flatline',
};

const BY_PREFIX = [
  ['bar', 'bar'],
  ['roofs', 'roofs'],
  ['mira_', 'laundry'],
  ['sluza', 'sluza'],
  ['clinic', 'clinic'],
  ['oko', 'tower'],
  ['rats', 'metro'],
  ['agent_', 'agent'],
  ['archive', 'archive'],
  ['server', 'server'],
  ['broadcast', 'ramp'],
  ['ramp', 'ramp'],
];

export function artFor(nodeId) {
  if (BY_NODE[nodeId]) return BY_NODE[nodeId];
  const hit = BY_PREFIX.find(([p]) => nodeId.startsWith(p));
  return hit ? hit[1] : 'street';
}

const RAINY = new Set(['street', 'drone', 'bike', 'roofs', 'sluza', 'tower', 'billboard', 'ash', 'station']);

function Drop({ x, height, delay, duration }) {
  const v = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([Animated.delay(delay), Animated.timing(v, { toValue: 1, duration, easing: Easing.linear, useNativeDriver: true })])
    );
    loop.start();
    return () => loop.stop();
  }, [v, delay, duration]);
  const translateY = v.interpolate({ inputRange: [0, 1], outputRange: [-30, height + 10] });
  const translateX = v.interpolate({ inputRange: [0, 1], outputRange: [0, 14] });
  return <Animated.View style={[s.drop, { left: x, transform: [{ translateY }, { translateX }, { rotate: '-12deg' }] }]} />;
}

// Ilustracja sceny: powolne przybliżenie, płynne wejście i deszcz na zewnątrz
export default function SceneArt({ art, height }) {
  const { width } = useWindowDimensions();
  const h = height ?? Math.min(220, Math.round(width * 0.52));
  const fade = useRef(new Animated.Value(0)).current;
  const zoom = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fade.setValue(0);
    zoom.setValue(0);
    Animated.timing(fade, { toValue: 1, duration: 500, useNativeDriver: true }).start();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(zoom, { toValue: 1, duration: 14000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
        Animated.timing(zoom, { toValue: 0, duration: 14000, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [art, fade, zoom]);

  const drops = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        x: (i / 16) * width + Math.random() * 20,
        delay: Math.random() * 900,
        duration: 650 + Math.random() * 500,
      })),
    [width]
  );

  const scale = zoom.interpolate({ inputRange: [0, 1], outputRange: [1.02, 1.1] });

  return (
    <View style={[s.wrap, { height: h }]}>
      <Animated.Image source={ART[art] || ART.street} resizeMode="cover" style={[s.img, { opacity: fade, transform: [{ scale }] }]} />
      {RAINY.has(art) ? drops.map((d, i) => <Drop key={i} {...d} height={h} />) : null}
      <View style={[s.shade, { height: h * 0.14, opacity: 0.25 }]} />
      <View style={[s.shade, { height: h * 0.08, opacity: 0.45 }]} />
      <View style={[s.shade, { height: h * 0.03, opacity: 0.8 }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: C.bg },
  img: { width: '100%', height: '100%' },
  drop: { position: 'absolute', top: 0, width: 1, height: 18, backgroundColor: 'rgba(190,215,255,0.45)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg },
});
