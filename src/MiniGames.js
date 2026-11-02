import { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Dimensions, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F, buzz } from './theme';

// Reakcja w chwili dotknięcia ekranu, bez opóźnienia, jakie ma Pressable
const touchStart = (fn) => ({
  onStartShouldSetResponder: () => true,
  onResponderGrant: (e) => fn(e),
});

const CODES = ['1C', '55', '7A', 'BD', 'E9', 'FF', '0D', 'A3', '4B'];

const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

// Wstrząs ekranu przy trafieniu albo pomyłce
function useShake() {
  const x = useRef(new Animated.Value(0)).current;
  const shake = () =>
    Animated.sequence([12, -10, 7, -4, 0].map((v) => Animated.timing(x, { toValue: v, duration: 45, useNativeDriver: true }))).start();
  return [x, shake];
}

// Wspólna rama: instrukcja -> odliczanie -> gra -> wynik
function Frame({ title, color, rules, phase, won, onStart, onDone, winText, loseText, shakeX, children }) {
  const [count, setCount] = useState(null);
  const pop = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (count == null) return;
    pop.setValue(1.6);
    Animated.timing(pop, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    buzz('tap');
    const t = setTimeout(() => {
      if (count > 1) setCount(count - 1);
      else {
        setCount(null);
        onStart();
      }
    }, 650);
    return () => clearTimeout(t);
  }, [count]);

  if (phase === 'intro' && count != null) {
    return (
      <View style={s.wrap}>
        <Animated.Text style={[s.count, { color, transform: [{ scale: pop }] }]}>{count}</Animated.Text>
      </View>
    );
  }
  if (phase === 'intro') {
    return (
      <View style={s.wrap}>
        <Text style={[s.tag, { color }]}>{title}</Text>
        <Text style={s.rules}>{rules}</Text>
        <Pressable style={[s.btn, { borderColor: color }]} onPress={() => setCount(3)}>
          <Text style={[s.btnText, { color }]}>START</Text>
        </Pressable>
      </View>
    );
  }
  if (phase === 'done') {
    const col = won ? C.green : C.red;
    return (
      <View style={s.wrap}>
        <Text style={[s.result, { color: col }]}>{won ? winText : loseText}</Text>
        <Pressable style={[s.btn, { borderColor: col }]} onPress={() => onDone(won)}>
          <Text style={[s.btnText, { color: col }]}>DALEJ</Text>
        </Pressable>
      </View>
    );
  }
  return <Animated.View style={[s.wrap, shakeX && { transform: [{ translateX: shakeX }] }]}>{children}</Animated.View>;
}

export function HackGame({ level, mods = [], onDone }) {
  const len = 2 + level;
  const total = [12, 11, 10][level - 1] + (mods.includes('icebreaker') ? 3 : 0);
  const { target, grid } = useMemo(() => {
    const t = shuffle(CODES).slice(0, len);
    const g = Array.from({ length: 16 }, () => CODES[Math.floor(Math.random() * CODES.length)]);
    const spots = shuffle([...Array(16).keys()]);
    t.forEach((code, i) => (g[spots[i]] = code));
    return { target: t, grid: g };
  }, [len]);

  const [phase, setPhase] = useState('intro');
  const [won, setWon] = useState(false);
  const [idx, setIdx] = useState(0);
  const [time, setTime] = useState(total);
  const [wrong, setWrong] = useState(-1);
  const [shakeX, shake] = useShake();

  useEffect(() => {
    if (phase !== 'play') return;
    const id = setInterval(() => setTime((t) => Math.max(0, t - 0.1)), 100);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase === 'play' && time <= 0) {
      buzz('bad');
      setWon(false);
      setPhase('done');
    }
  }, [time, phase]);

  const tap = (code, i) => {
    if (code === target[idx]) {
      buzz();
      if (idx + 1 === target.length) {
        buzz('ok');
        setWon(true);
        setPhase('done');
      }
      setIdx(idx + 1);
    } else {
      buzz('bad');
      shake();
      setWrong(i);
      setTime((t) => Math.max(0, t - 2));
      setTimeout(() => setWrong(-1), 250);
    }
  };

  return (
    <Frame
      title="WŁAM"
      color={C.cyan}
      rules={`Dotykaj kodów z siatki w podanej kolejności.\nMasz ${total} sekund. Każda pomyłka zabiera 2 sekundy.`}
      phase={phase}
      won={won}
      onStart={() => setPhase('play')}
      onDone={onDone}
      winText="DOSTĘP PRZYZNANY"
      loseText="DOSTĘP ODRZUCONY"
      shakeX={shakeX}
    >
      <View style={s.seq}>
        {target.map((c, i) => (
          <Text key={i} style={[s.seqCode, i < idx && s.seqDone, i === idx && s.seqNow]}>
            {c}
          </Text>
        ))}
      </View>
      <View style={s.timeBar}>
        <View style={[s.timeFill, { width: `${(time / total) * 100}%`, backgroundColor: time < 3 ? C.red : C.cyan }]} />
      </View>
      <View style={s.grid}>
        {grid.map((code, i) => (
          <Pressable key={i} onPress={() => tap(code, i)} style={({ pressed }) => [s.cell, pressed && s.cellPressed, wrong === i && s.cellWrong]}>
            <Text style={s.cellText}>{code}</Text>
          </Pressable>
        ))}
      </View>
    </Frame>
  );
}

export function TimingGame({ level, mods = [], onDone }) {
  const slow = mods.includes('reflex');
  const need = 3;
  const [phase, setPhase] = useState('intro');
  const [won, setWon] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [, setFrame] = useState(0);
  const pos = useRef(0);
  const dir = useRef(1);
  const speed = useRef((0.7 + level * 0.3) * (slow ? 0.75 : 1));
  const width = 0.26 - level * 0.05 + (slow ? 0.05 : 0);
  const [zone, setZone] = useState(() => 0.25 + Math.random() * 0.5);
  const [shakeX, shake] = useShake();

  useEffect(() => {
    if (phase !== 'play') return;
    let raf;
    let last = null;
    const step = (t) => {
      if (last != null) {
        pos.current += dir.current * speed.current * ((t - last) / 1000);
        if (pos.current >= 1) (pos.current = 1), (dir.current = -1);
        if (pos.current <= 0) (pos.current = 0), (dir.current = 1);
        setFrame((f) => f + 1);
      }
      last = t;
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  const tap = () => {
    if (phase !== 'play') return;
    if (Math.abs(pos.current - zone) <= width / 2) {
      buzz();
      const h = hits + 1;
      setHits(h);
      speed.current += 0.2;
      setZone(0.15 + Math.random() * 0.7);
      if (h >= need) {
        buzz('ok');
        setWon(true);
        setPhase('done');
      }
    } else {
      buzz('bad');
      shake();
      const m = misses + 1;
      setMisses(m);
      if (m >= 2) {
        setWon(false);
        setPhase('done');
      }
    }
  };

  return (
    <Frame
      title="REFLEKS"
      color={C.pink}
      rules={`Stuknij w ekran, gdy znacznik jest w różowym polu.\nPotrzebujesz ${need} trafień. Możesz chybić tylko raz.`}
      phase={phase}
      won={won}
      onStart={() => setPhase('play')}
      onDone={onDone}
      winText="UDAŁO SIĘ"
      loseText="NIE TYM RAZEM"
      shakeX={shakeX}
    >
      <View style={s.tapArea} {...touchStart(tap)}>
        <Text style={s.counter}>
          TRAFIENIA {hits}/{need}   ·   PUDŁA {misses}/1
        </Text>
        <View style={s.bar}>
          <View style={[s.zone, { left: `${(zone - width / 2) * 100}%`, width: `${width * 100}%` }]} />
          <View style={[s.marker, { left: `${pos.current * 100}%` }]} />
        </View>
        <Text style={s.hint}>STUKNIJ GDZIEKOLWIEK</Text>
      </View>
    </Frame>
  );
}

export function ChaseGame({ level, mods = [], onDone }) {
  const dur = 14;
  const maxHits = mods.includes('armor') ? 3 : 2;
  const speed = (250 + level * 70) * (mods.includes('reflex') ? 0.85 : 1);
  const gap = 0.85 - level * 0.12;
  const [phase, setPhase] = useState('intro');
  const [won, setWon] = useState(false);
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [, setFrame] = useState(0);
  const st = useRef({ lane: 1, obs: [], spawn: 0.6, time: 0, hits: 0, scroll: 0, id: 0, flash: 0 });
  const [shakeX, shake] = useShake();
  const shakeRef = useRef(shake);
  shakeRef.current = shake;

  useEffect(() => {
    if (phase !== 'play' || !size.height) return;
    let raf;
    let last = null;
    const g = st.current;
    const bikeY = size.height - 100;
    const step = (t) => {
      const dt = last == null ? 0 : Math.min(0.05, (t - last) / 1000);
      last = t;
      g.time += dt;
      g.scroll = (g.scroll + speed * dt) % 48;
      g.flash = Math.max(0, g.flash - dt);
      g.spawn -= dt;
      if (g.spawn <= 0 && g.time < dur - 1.2) {
        g.spawn = gap * (0.7 + Math.random() * 0.6);
        const lanes = [0, 1, 2].sort(() => Math.random() - 0.5);
        const count = level >= 2 && Math.random() < 0.35 ? 2 : 1;
        for (const lane of lanes.slice(0, count)) {
          g.obs.push({ id: g.id++, lane, y: -70, kind: Math.random() < 0.6 ? 'car' : 'bar' });
        }
      }
      for (const o of g.obs) {
        o.y += speed * dt;
        const h = o.kind === 'car' ? 64 : 20;
        if (!o.hit && o.lane === g.lane && o.y + h > bikeY + 6 && o.y < bikeY + 50) {
          o.hit = true;
          g.hits++;
          g.flash = 0.4;
          buzz('bad', 'hit');
          shakeRef.current();
        }
      }
      g.obs = g.obs.filter((o) => o.y < size.height + 20);
      if (g.hits >= maxHits) {
        setWon(false);
        setPhase('done');
        return;
      }
      if (g.time >= dur) {
        buzz('ok');
        setWon(true);
        setPhase('done');
        return;
      }
      setFrame((f) => (f + 1) % 1e6);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [phase, size.height]);

  const steer = (e) => {
    const g = st.current;
    const left = e.nativeEvent.pageX < Dimensions.get('window').width / 2;
    g.lane = Math.max(0, Math.min(2, g.lane + (left ? -1 : 1)));
    buzz();
  };

  const g = st.current;
  const laneW = size.width / 3;
  const dashes = [];
  for (let y = -48 + g.scroll; y < size.height; y += 48) dashes.push(y);

  return (
    <Frame
      title="POŚCIG"
      color={C.yellow}
      rules={`Stukaj lewą lub prawą stronę ekranu, żeby zmienić pas.\nWytrzymaj ${dur} sekund. Możesz uderzyć ${maxHits - 1 === 1 ? 'raz' : `${maxHits - 1} razy`}.`}
      phase={phase}
      won={won}
      onStart={() => setPhase('play')}
      onDone={onDone}
      winText="ZGUBIONY OGON"
      loseText="ROZBITY MOTOR"
      shakeX={shakeX}
    >
      <View style={s.chaseHud}>
        <View style={s.timeBar}>
          <View style={[s.timeFill, { width: `${Math.min(1, g.time / dur) * 100}%`, backgroundColor: C.yellow }]} />
        </View>
        <Text style={s.counter}>
          UDERZENIA {Math.min(g.hits, maxHits - 1)}/{maxHits - 1}
        </Text>
      </View>
      <View style={s.road} {...touchStart(steer)} onLayout={(e) => setSize(e.nativeEvent.layout)}>
        {[1, 2].map((k) =>
          dashes.map((y) => <View key={`${k}-${y}`} style={[s.dash, { left: laneW * k - 2, top: y }]} />)
        )}
        {dashes.map((y, i) => (
          <View key={`w${y}`} style={[s.sideWin, { left: 2, top: y, backgroundColor: i % 3 ? 'rgba(46,242,255,0.5)' : 'rgba(255,46,136,0.6)' }]} />
        ))}
        {dashes.map((y, i) => (
          <View key={`e${y}`} style={[s.sideWin, { right: 2, top: y + 20, backgroundColor: i % 2 ? 'rgba(255,210,63,0.5)' : 'rgba(46,242,255,0.4)' }]} />
        ))}
        {g.obs.map((o) =>
          o.kind === 'car' ? (
            <View key={o.id} style={[s.car, { left: laneW * o.lane + laneW / 2 - 22, top: o.y }]}>
              <View style={s.carLight} />
            </View>
          ) : (
            <View key={o.id} style={[s.barrier, { left: laneW * o.lane + 8, top: o.y, width: laneW - 16 }]} />
          )
        )}
        {size.height ? (
          <View style={[s.bike, { left: laneW * g.lane + laneW / 2 - 14, top: size.height - 100 }, g.flash > 0 && { backgroundColor: C.red }]}>
            <View style={s.bikeLight} />
          </View>
        ) : null}
      </View>
    </Frame>
  );
}

export function DuelGame({ level, mods = [], onDone }) {
  const need = level + 2;
  const maxHits = mods.includes('armor') ? 3 : 2;
  const warn = (1000 - level * 150) * (mods.includes('reflex') ? 1.25 : 1);
  const feint = level >= 2 ? 0.25 : 0;
  const [phase, setPhase] = useState('intro');
  const [won, setWon] = useState(false);
  const [view, setView] = useState({ state: 'idle', side: null, blocks: 0, hits: 0 });
  const g = useRef({ side: null, armed: false, blocks: 0, hits: 0, timers: [] });
  const [shakeX, shake] = useShake();

  const later = (ms, fn) => g.current.timers.push(setTimeout(fn, ms));
  useEffect(() => () => g.current.timers.forEach(clearTimeout), []);
  const show = (state) => setView({ state, side: g.current.side, blocks: g.current.blocks, hits: g.current.hits });

  const attack = () => {
    g.current.side = null;
    g.current.armed = false;
    show('idle');
    later(600 + Math.random() * 700, () => {
      const first = Math.random() < 0.5 ? 'L' : 'R';
      g.current.side = first;
      g.current.armed = true;
      show('warn');
      if (Math.random() < feint) {
        later(warn * 0.45, () => {
          if (!g.current.armed) return;
          g.current.side = first === 'L' ? 'R' : 'L';
          buzz();
          show('warn');
        });
        later(warn * 1.3, () => g.current.armed && resolve(null));
      } else {
        later(warn, () => g.current.armed && resolve(null));
      }
    });
  };

  const resolve = (tap) => {
    g.current.armed = false;
    if (tap === g.current.side) {
      g.current.blocks++;
      buzz('tap', 'block');
      show('block');
      if (g.current.blocks >= need) {
        buzz('ok');
        later(500, () => {
          setWon(true);
          setPhase('done');
        });
      } else later(500, attack);
    } else {
      g.current.hits++;
      buzz('bad', 'hit');
      shake();
      show('hit');
      if (g.current.hits >= maxHits) {
        later(600, () => {
          setWon(false);
          setPhase('done');
        });
      } else later(700, attack);
    }
  };

  const tap = (side) => {
    if (g.current.armed) resolve(side);
  };

  const label = {
    idle: ['CZEKAJ…', C.dim],
    warn: [view.side === 'L' ? '◀ CIOS Z LEWEJ' : 'CIOS Z PRAWEJ ▶', C.red],
    block: ['BLOK!', C.green],
    hit: ['TRAFIONY', C.red],
  }[view.state];

  return (
    <Frame
      title="POJEDYNEK"
      color={C.red}
      rules={`Sokół atakuje z lewej albo z prawej. Stuknij stronę, z której leci cios, zanim trafi.\nZablokuj ${need} ${need >= 5 ? 'ciosów' : 'ciosy'}. Możesz oberwać ${maxHits - 1 === 1 ? 'raz' : `${maxHits - 1} razy`}. Uważaj na zmyłki.`}
      phase={phase}
      won={won}
      onStart={() => {
        setPhase('play');
        attack();
      }}
      onDone={onDone}
      winText="SOKÓŁ LEŻY"
      loseText="POWALONY"
      shakeX={shakeX}
    >
      <Text style={s.counter}>
        BLOKI {view.blocks}/{need}   ·   TRAFIENIA {Math.min(view.hits, maxHits - 1)}/{maxHits - 1}
      </Text>
      <View style={s.foe}>
        <Image
          source={require('../assets/portraits/sokol.jpg')}
          style={[s.foeBody, view.state === 'warn' && { borderColor: C.red }, view.state === 'block' && { borderColor: C.green }]}
        />
        <Text style={[s.duelCall, { color: label[1] }]}>{label[0]}</Text>
      </View>
      <View style={s.duelRow}>
        {['L', 'R'].map((side) => {
          const hot = view.state === 'warn' && view.side === side;
          return (
            <View key={side} {...touchStart(() => tap(side))} style={[s.duelSide, hot && s.duelHot]}>
              <Text style={[s.duelSideText, hot && { color: C.red }]}>{side === 'L' ? 'LEWA' : 'PRAWA'}</Text>
            </View>
          );
        })}
      </View>
    </Frame>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: 24 },
  tag: { fontFamily: F.bold, fontSize: 34, letterSpacing: 6, textAlign: 'center' },
  count: { fontFamily: F.bold, fontSize: 120, textAlign: 'center' },
  sideWin: { position: 'absolute', width: 6, height: 10 },
  rules: { fontFamily: F.regular, fontSize: 17, lineHeight: 26, color: C.text, textAlign: 'center' },
  result: { fontFamily: F.bold, fontSize: 28, letterSpacing: 3, textAlign: 'center' },
  btn: { borderWidth: 2, paddingVertical: 16, alignItems: 'center', alignSelf: 'center', paddingHorizontal: 48 },
  btnText: { fontFamily: F.bold, fontSize: 18, letterSpacing: 4 },
  seq: { flexDirection: 'row', justifyContent: 'center', gap: 10 },
  seqCode: { fontFamily: F.bold, fontSize: 22, color: C.dim, borderWidth: 1, borderColor: C.line, paddingHorizontal: 10, paddingVertical: 4 },
  seqNow: { color: C.cyan, borderColor: C.cyan },
  seqDone: { color: C.green, borderColor: C.green },
  timeBar: { height: 6, backgroundColor: C.line },
  timeFill: { height: 6 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, justifyContent: 'center' },
  cell: { width: '22%', aspectRatio: 1, borderWidth: 1, borderColor: C.line, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center' },
  cellPressed: { borderColor: C.cyan, backgroundColor: '#0d2a33' },
  cellWrong: { borderColor: C.red, backgroundColor: '#3a0f16' },
  cellText: { fontFamily: F.medium, fontSize: 22, color: C.text },
  tapArea: { flex: 1, justifyContent: 'center', gap: 28 },
  counter: { fontFamily: F.medium, fontSize: 15, color: C.text, textAlign: 'center', letterSpacing: 2 },
  bar: { height: 64, backgroundColor: C.panel, borderWidth: 1, borderColor: C.line, overflow: 'hidden' },
  zone: { position: 'absolute', top: 0, bottom: 0, backgroundColor: 'rgba(255,46,136,0.35)', borderLeftWidth: 2, borderRightWidth: 2, borderColor: C.pink },
  marker: { position: 'absolute', top: 0, bottom: 0, width: 4, marginLeft: -2, backgroundColor: C.yellow },
  hint: { fontFamily: F.regular, fontSize: 13, color: C.dim, textAlign: 'center', letterSpacing: 3 },
  chaseHud: { gap: 8 },
  road: { flex: 1, backgroundColor: '#0b0c16', borderWidth: 1, borderColor: C.line, overflow: 'hidden', marginBottom: 12 },
  dash: { position: 'absolute', width: 4, height: 24, backgroundColor: 'rgba(122,127,166,0.35)' },
  car: { position: 'absolute', width: 44, height: 64, backgroundColor: '#2a1030', borderWidth: 2, borderColor: C.pink, alignItems: 'center', justifyContent: 'flex-end' },
  carLight: { width: 30, height: 4, backgroundColor: C.red, marginBottom: 4 },
  barrier: { position: 'absolute', height: 20, backgroundColor: '#3a3010', borderWidth: 2, borderColor: C.yellow },
  bike: { position: 'absolute', width: 28, height: 50, backgroundColor: C.cyan, borderRadius: 8, alignItems: 'center' },
  bikeLight: { width: 14, height: 6, backgroundColor: C.yellow, marginTop: 3, borderRadius: 3 },
  foe: { alignItems: 'center', gap: 16 },
  foeBody: { width: 110, height: 110, borderRadius: 55, borderWidth: 3, borderColor: C.dim, backgroundColor: C.panel },
  duelCall: { fontFamily: F.bold, fontSize: 22, letterSpacing: 3 },
  duelRow: { flexDirection: 'row', gap: 10, height: 220 },
  duelSide: { flex: 1, borderWidth: 2, borderColor: C.line, backgroundColor: C.panel, alignItems: 'center', justifyContent: 'center' },
  duelHot: { borderColor: C.red, backgroundColor: '#3a0f16' },
  duelSideText: { fontFamily: F.bold, fontSize: 18, letterSpacing: 4, color: C.dim },
});
