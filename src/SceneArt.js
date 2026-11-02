import { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Image, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { C, F } from './theme';

// Ilustracje i portrety pochodzą z generatora AI (scripts/gen_ai_art.py, obróbka: scripts/grade_art.py)
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
  bazar: require('../assets/scenes/bazar.jpg'),
  checkpoint: require('../assets/scenes/checkpoint.jpg'),
  capsule: require('../assets/scenes/capsule.jpg'),
  pigeon: require('../assets/scenes/pigeon.jpg'),
  bridge: require('../assets/scenes/bridge.jpg'),
  canteen: require('../assets/scenes/canteen.jpg'),
  security: require('../assets/scenes/security.jpg'),
  summit: require('../assets/scenes/summit.jpg'),
  port: require('../assets/scenes/port.jpg'),
  basement: require('../assets/scenes/basement.jpg'),
};

// Sceny fabuły bez wpisu dostają ilustrację po prefiksie id (patrz artFor)
const BY_NODE = {
  start: 'ramp',
  cold_2: 'ramp',
  sh_1: 'laundry',
  sh_1b: 'laundry',
  sh_1c: 'laundry',
  sh_2: 'station',
  sh_2b: 'station',
  sh_3: 'iglica',
  sh_3b: 'iglica',
  sh_3c: 'iglica',
  kk_shadow: 'server',
  bruno_call: 'street',
  haggle: 'street',
  mira_talk: 'network',
  canteen: 'canteen',
  security: 'security',
  summit: 'iglica',
  end_deal: 'summit',
  end_crown: 'summit',
  job_blood: 'bike',
  job_blood_ok: 'bike',
  job_blood_late: 'bike',
  job_box_oko: 'tower',
  job_ashes2: 'port',
  job_clinic: 'sluza',
  job_clinic_open: 'sluza',
  job_clinic_igla: 'clinic',
  job_clinic_deliver: 'port',
  ok_halina2: 'sluza',
  ok_halina3: 'sluza',
  laundry: 'laundry',
  job_ashes_done: 'port',
  job_gift3: 'station',
  job_gift4: 'station',
  job_gift_done: 'train',
  lab_night: 'lab',
  lab_night2: 'lab',
  ward: 'whiteroom',
  ep_name_antoni: 'port',
  ep_name_mom: 'station',
  ep_signal_nowak: 'checkpoint',
  ep_ghost_pchla: 'pigeon',
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
  sokol_give: 'lab',
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

export const PORTRAITS = {
  mira: require('../assets/portraits/mira.jpg'),
  bruno: require('../assets/portraits/bruno.jpg'),
  oko: require('../assets/portraits/oko.jpg'),
  kret: require('../assets/portraits/kret.jpg'),
  wren: require('../assets/portraits/wren.jpg'),
  sokol: require('../assets/portraits/sokol.jpg'),
  igla: require('../assets/portraits/igla.jpg'),
  halina: require('../assets/portraits/halina.jpg'),
  pchla: require('../assets/portraits/pchla.jpg'),
  sroka: require('../assets/portraits/sroka.jpg'),
  gawron: require('../assets/portraits/gawron.jpg'),
  prezes: require('../assets/portraits/prezes.jpg'),
  teodor: require('../assets/portraits/teodor.jpg'),
};

const NAMES = {
  mira: 'Mira',
  bruno: 'Bruno',
  oko: 'Oko',
  kret: 'Kret',
  wren: 'dr Wren',
  sokol: 'Sokół',
  igla: 'Igła',
  halina: 'pani Halina',
  pchla: 'Pchła',
  sroka: 'Sroka',
  gawron: 'Gawron',
  prezes: 'Wolański',
  teodor: 'Teodor',
};
const RIM = { mira: C.pink, sokol: C.red, oko: C.cyan, wren: '#e8eef5', prezes: C.yellow };

// Kto pojawia się w scenie: najpierw wpisy dokładne, potem po prefiksie id
const CAST_BY_NODE = {
  start: ['sokol'],
  cold_2: ['prezes'],
  sh_2: ['mira'],
  sh_2b: ['mira'],
  kk_shadow: ['prezes'],
  bruno_call: ['bruno'],
  pr_corridor: ['pchla'],
  pr_pchla_bird: ['pchla'],
  pr_pchla_info: ['pchla'],
  pr_halina: ['halina'],
  pr_teodor: ['teodor'],
  pr_marek: ['teodor'],
  pr_pay: ['teodor'],
  sl_teodor_kind: ['teodor'],
  sl_teodor_plain: ['teodor'],
  sl_roof: ['mira'],
  sl_roof2: ['mira'],
  sl_diary3: ['mira'],
  fn_gangs: ['kret', 'gawron'],
  ep_name_marek: ['teodor'],
  ep_name_witek: ['kret'],
  ep_name_bruno: ['bruno'],
  ep_name_igla: ['igla'],
  ep_name_pchla: ['pchla', 'oko'],
  ep_name_halina: ['halina', 'oko'],
  ep_name_8: ['mira', 'oko'],
  ep_signal_3: ['mira'],
  ep_martyr_pchla: ['pchla'],
  ep_martyr_bruno: ['bruno'],
  ep_deliv_bruno: ['bruno'],
  ep_deal_1: ['prezes'],
  ep_deal_3: ['mira'],
  pc_mom: ['pchla'],
  kr_betrayed: [],
  kr_ania: ['kret'],
  bz_sroka_story: ['sroka'],
  br_photo: ['bruno'],
  ps_sokol: ['sokol'],
  ps_sokol2: ['sokol'],
  ps_sokol3: [],
  ep_ash_oko: ['oko'],
  kk_ring: [],
  kk_mech: ['mira'],
  kk_edward: [],
  kk_gawron: ['gawron', 'kret'],
  kk_pigeon: ['pchla'],
  kk_leon: ['pchla'],
  kr_meeting: ['kret', 'gawron'],
  kr_meeting2: ['kret', 'gawron'],
  ok_halina2: ['halina', 'oko'],
  ok_halina3: ['oko'],
  job_clinic_igla: ['igla'],
  ln_sit: ['mira'],
  pc_mom2: ['pchla'],
  lab_night: [],
  lab_night2: ['prezes'],
  ep_name_mom: ['pchla'],
  ep_martyr_sokol: ['sokol'],
  ep_ghost_pchla: ['pchla'],
  tr_edward: [],
  haggle: ['bruno'],
  sluza: ['halina', 'mira'],
  oko_sister: ['oko', 'mira'],
  sokol_give: ['sokol', 'wren'],
  train_calm: ['mira'],
  server_nokey: ['mira'],
  server_key: ['oko'],
  server_fail: ['oko'],
  ramp: ['mira'],
  ramp_hurt: ['mira'],
  end_name: ['mira', 'oko'],
  end_signal: ['mira'],
  end_ghost: ['mira'],
  end_delivered: ['wren'],
  end_flatline: ['mira'],
};

const CAST_BY_PREFIX = [
  ['sh_', ['mira', 'prezes']],
  ['mt_', ['mira']],
  ['rd_', ['halina', 'teodor']],
  ['sl_hub', ['halina']],
  ['sl_hania', ['halina']],
  ['sl_meds', ['halina']],
  ['br_', ['bruno']],
  ['ig_quest', ['igla']],
  ['ig_meds', ['igla']],
  ['ig_done', ['igla']],
  ['ig_thanks', ['igla']],
  ['kr_', ['kret']],
  ['ok_', ['oko']],
  ['pc_', ['pchla']],
  ['bz_sroka', ['sroka']],
  ['bz_fake', ['sroka']],
  ['bz_coil', ['sroka']],
  ['bz_id', ['sroka']],
  ['bz_watch', ['sroka']],
  ['bz_gawron', ['gawron']],
  ['bz_peace', ['gawron']],
  ['bz_war', ['gawron']],
  ['bz_betray', ['gawron']],
  ['ic_top', ['prezes']],
  ['ic_offer', ['prezes']],
  ['ic_blackmail', ['prezes']],
  ['ic_leave', ['prezes']],
  ['fn_', ['sokol']],
  ['bar', ['bruno']],
  ['bruno', ['bruno']],
  ['mira_', ['mira']],
  ['memory_', ['mira']],
  ['clinic', ['igla']],
  ['oko', ['oko']],
  ['rats', ['kret']],
  ['train_agent', ['sokol']],
  ['agent_', ['sokol']],
  ['sokol', ['sokol']],
  ['broadcast', ['sokol']],
  ['lobby', ['wren']],
  ['wren', ['wren']],
];

export function castFor(nodeId) {
  if (CAST_BY_NODE[nodeId]) return CAST_BY_NODE[nodeId];
  const hit = CAST_BY_PREFIX.find(([p]) => nodeId.startsWith(p));
  return hit ? hit[1] : [];
}

const BY_PREFIX = [
  ['port_', 'port'],
  ['sh_', 'server'],
  ['kk_', 'street'],
  ['arch_', 'archive'],
  ['kamil', 'canteen'],
  ['ic_marczak', 'security'],
  ['ln_', 'laundry'],
  ['rd_', 'basement'],
  ['ward_', 'whiteroom'],
  ['pr_check', 'checkpoint'],
  ['pr_bazar', 'bazar'],
  ['pr_thief', 'bazar'],
  ['pr_sluza', 'sluza'],
  ['pr_halina', 'sluza'],
  ['pr_teodor', 'sluza'],
  ['pr_marek', 'sluza'],
  ['pr_pay', 'sluza'],
  ['pr_home', 'street'],
  ['pr_stairs', 'street'],
  ['pr_', 'capsule'],
  ['mt_', 'network'],
  ['sl_', 'sluza'],
  ['br_', 'bar'],
  ['ig_ambush', 'checkpoint'],
  ['ig_got', 'checkpoint'],
  ['ig_fail', 'checkpoint'],
  ['ig_pigeon', 'checkpoint'],
  ['ig_bribe', 'checkpoint'],
  ['ig_', 'clinic'],
  ['kr_', 'metro'],
  ['ok_', 'tower'],
  ['pc_', 'pigeon'],
  ['bz_', 'bazar'],
  ['bazar', 'bazar'],
  ['post', 'checkpoint'],
  ['ps_', 'checkpoint'],
  ['ul', 'capsule'],
  ['job_', 'street'],
  ['tr_', 'train'],
  ['kl_', 'bridge'],
  ['ic_top', 'summit'],
  ['ic_offer', 'summit'],
  ['ic_blackmail', 'summit'],
  ['ic_leave', 'summit'],
  ['ic_lift', 'iglica'],
  ['ic_sec', 'security'],
  ['ic_cams', 'security'],
  ['ic_files', 'security'],
  ['ic_', 'canteen'],
  ['fn_', 'ramp'],
  ['ep_name', 'dawn'],
  ['ep_signal', 'dawn'],
  ['ep_martyr', 'cell'],
  ['ep_ghost', 'network'],
  ['ep_deliv', 'billboard'],
  ['ep_ash', 'ash'],
  ['ep_deal', 'summit'],
  ['ep_crown', 'summit'],
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
  ['sokol', 'ramp'],
  ['wren', 'lab'],
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
export default function SceneArt({ art, height, cast = [] }) {
  const { width } = useWindowDimensions();
  const h = height ?? Math.min(170, Math.round(width * 0.4));
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
      {cast.length ? (
        <View style={s.cast}>
          {cast.map((who) => (
            <View key={who} style={s.person}>
              <Image source={PORTRAITS[who]} style={[s.face, { borderColor: RIM[who] || C.yellow }]} />
              <Text style={s.name}>{NAMES[who]}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', backgroundColor: C.bg },
  img: { width: '100%', height: '100%' },
  drop: { position: 'absolute', top: 0, width: 1, height: 18, backgroundColor: 'rgba(190,215,255,0.45)' },
  shade: { position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: C.bg },
  cast: { position: 'absolute', left: 26, bottom: 8, flexDirection: 'row', gap: 10 },
  person: { alignItems: 'center', gap: 3 },
  face: { width: 52, height: 52, borderRadius: 26, borderWidth: 2 },
  name: { fontFamily: F.bold, fontSize: 10, letterSpacing: 1, color: C.text, backgroundColor: 'rgba(7,8,15,0.8)', paddingHorizontal: 5 },
});
