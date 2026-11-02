import { useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { C, F, buzz } from './theme';

const CODES = ['1C', '55', '7A', 'BD', 'E9', 'FF', '0D', 'A3', '4B'];

const shuffle = (a) => {
  const r = [...a];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
};

// Wspólna rama: instrukcja -> gra -> wynik
function Frame({ title, color, rules, phase, won, onStart, onDone, winText, loseText, children }) {
  if (phase === 'intro') {
    return (
      <View style={s.wrap}>
        <Text style={[s.tag, { color }]}>{title}</Text>
        <Text style={s.rules}>{rules}</Text>
        <Pressable style={[s.btn, { borderColor: color }]} onPress={onStart}>
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
  return <View style={s.wrap}>{children}</View>;
}

export function HackGame({ level, onDone }) {
  const len = 2 + level;
  const total = [12, 11, 10][level - 1];
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

export function TimingGame({ level, onDone }) {
  const need = 3;
  const [phase, setPhase] = useState('intro');
  const [won, setWon] = useState(false);
  const [hits, setHits] = useState(0);
  const [misses, setMisses] = useState(0);
  const [, setFrame] = useState(0);
  const pos = useRef(0);
  const dir = useRef(1);
  const speed = useRef(0.7 + level * 0.3);
  const width = 0.26 - level * 0.05;
  const [zone, setZone] = useState(() => 0.25 + Math.random() * 0.5);

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
    >
      <Pressable style={s.tapArea} onPress={tap}>
        <Text style={s.counter}>
          TRAFIENIA {hits}/{need}   ·   PUDŁA {misses}/1
        </Text>
        <View style={s.bar}>
          <View style={[s.zone, { left: `${(zone - width / 2) * 100}%`, width: `${width * 100}%` }]} />
          <View style={[s.marker, { left: `${pos.current * 100}%` }]} />
        </View>
        <Text style={s.hint}>STUKNIJ GDZIEKOLWIEK</Text>
      </Pressable>
    </Frame>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1, justifyContent: 'center', gap: 24 },
  tag: { fontFamily: F.bold, fontSize: 34, letterSpacing: 6, textAlign: 'center' },
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
});
