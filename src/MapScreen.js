import { useEffect, useMemo, useRef, useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MAPS, TILE } from './maps';
import { meets } from './engine';
import { C, F, buzz } from './theme';

const PR = 10; // promień gracza
const SPEED = 125; // piksele na sekundę
const NEAR = 36; // odległość, z której można wejść do miejsca
const JOY = 50; // zasięg joysticka
// Tła map są renderowane skryptem scripts/gen_maps.py z tych samych siatek co kolizje
const MAP_ART = {
  dolina: require('../assets/maps/dolina.jpg'),
  iglica: require('../assets/maps/iglica.jpg'),
};

function parse(map) {
  const spawn = { x: TILE * 1.5, y: TILE * 1.5 };
  const pickups = [];
  const shards = [];
  const pois = [];
  map.grid.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      const x = c * TILE + TILE / 2;
      const y = r * TILE + TILE / 2;
      if (ch === 'P') Object.assign(spawn, { x, y });
      else if (ch === '$') pickups.push({ key: `${c},${r}`, x, y });
      else if (ch === 'M') shards.push({ key: `m${c},${r}`, x, y });
      else if (map.pois[ch]) pois.push({ ch, x, y, ...map.pois[ch] });
    })
  );
  return {
    spawn,
    pickups,
    shards,
    pois,
    w: map.grid[0].length * TILE,
    h: map.grid.length * TILE,
  };
}

export function mapSpawn(mapId) {
  return parse(MAPS[mapId]).spawn;
}

const solid = (grid, x, y) => {
  const row = grid[Math.floor(y / TILE)];
  return !row || row[Math.floor(x / TILE)] === '#' || row[Math.floor(x / TILE)] == null;
};

const blocked = (grid, x, y) =>
  solid(grid, x - PR, y - PR) || solid(grid, x + PR, y - PR) || solid(grid, x - PR, y + PR) || solid(grid, x + PR, y + PR);

function sees(grid, ax, ay, bx, by) {
  const d = Math.hypot(bx - ax, by - ay);
  const steps = Math.ceil(d / 10);
  for (let i = 1; i < steps; i++) {
    if (solid(grid, ax + ((bx - ax) * i) / steps, ay + ((by - ay) * i) / steps)) return false;
  }
  return true;
}

export default function MapScreen({ mapId, mstate, game, paused, posOut, objective = { text: '' }, onPoi, onPickup, onShard, onSpotted }) {
  const map = MAPS[mapId];
  const world = useMemo(() => parse(map), [map]);
  const pos = useRef({ x: mstate.x, y: mstate.y });
  const joy = useRef(null);
  const face = useRef(90);
  const taken = useRef(new Set(mstate.taken));
  const drones = useRef(
    map.drones.filter((d) => !(d.unless && game.flags.includes(d.unless))).map((d) => {
      const ax = d.a[0] * TILE + TILE / 2;
      const ay = d.a[1] * TILE + TILE / 2;
      const bx = d.b[0] * TILE + TILE / 2;
      const by = d.b[1] * TILE + TILE / 2;
      const len = Math.hypot(bx - ax, by - ay);
      return { ...d, ax, ay, bx, by, len, t: Math.random() * len, dir: 1, x: ax, y: ay, meter: 0, cool: 0 };
    })
  );
  const [view, setView] = useState({ w: 0, h: 0 });
  const [, setFrame] = useState(0);
  const [near, setNear] = useState(null);
  const [toast, setToast] = useState(null);
  const cb = useRef({});
  cb.current = {
    onPickup,
    onShard,
    onSpotted,
    paused,
    jammer: game.flags.includes('jammer'),
    disguise: mapId === 'iglica' && game.flags.includes('uniform'),
  };

  const toastTimer = useRef(null);
  const flash = (text, color) => {
    setToast({ text, color });
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2400);
  };

  useEffect(() => {
    let raf;
    let last = null;
    let nearCh = null;
    const step = (t) => {
      const dt = last == null || cb.current.paused ? 0 : Math.min(0.05, (t - last) / 1000);
      last = t;
      const p = pos.current;
      if (posOut) posOut.current = { x: p.x, y: p.y };
      if (cb.current.paused) {
        raf = requestAnimationFrame(step);
        return;
      }

      const j = joy.current;
      if (j && (j.dx || j.dy)) {
        const len = Math.hypot(j.dx, j.dy);
        const k = Math.min(1, len / JOY) / len;
        const mx = j.dx * k * SPEED * dt;
        const my = j.dy * k * SPEED * dt;
        face.current = (Math.atan2(j.dy, j.dx) * 180) / Math.PI;
        if (!blocked(map.grid, p.x + mx, p.y)) p.x += mx;
        if (!blocked(map.grid, p.x, p.y + my)) p.y += my;
      }

      for (const pk of world.pickups) {
        if (!taken.current.has(pk.key) && Math.hypot(pk.x - p.x, pk.y - p.y) < 24) {
          taken.current.add(pk.key);
          buzz('tap', 'pickup');
          cb.current.onPickup(pk.key, map.cash, { x: p.x, y: p.y });
        }
      }

      for (const sh of world.shards) {
        if (!taken.current.has(sh.key) && Math.hypot(sh.x - p.x, sh.y - p.y) < 24) {
          taken.current.add(sh.key);
          buzz('ok', 'shard');
          cb.current.onShard(sh.key, { x: p.x, y: p.y });
          return;
        }
      }

      for (const d of drones.current) {
        d.t += d.dir * d.speed * dt;
        if (d.t >= d.len) (d.t = d.len), (d.dir = -1);
        if (d.t <= 0) (d.t = 0), (d.dir = 1);
        d.x = d.ax + ((d.bx - d.ax) * d.t) / d.len;
        d.y = d.ay + ((d.by - d.ay) * d.t) / d.len;
        if (d.cool > 0) {
          d.cool -= dt;
          d.meter = 0;
        } else if (Math.hypot(d.x - p.x, d.y - p.y) < d.r && sees(map.grid, d.x, d.y, p.x, p.y)) {
          d.meter += dt * 1.2 * (cb.current.jammer ? 0.5 : 1) * (cb.current.disguise ? 0.5 : 1);
          if (d.meter >= 1) {
            d.meter = 0;
            d.cool = 3;
            buzz('bad', 'alarm');
            cb.current.onSpotted({ x: p.x, y: p.y });
          }
        } else {
          d.meter = Math.max(0, d.meter - dt * 0.8);
        }
      }

      const hit = world.pois.find((o) => Math.hypot(o.x - p.x, o.y - p.y) < NEAR);
      const ch = hit ? hit.ch : null;
      if (ch !== nearCh) {
        nearCh = ch;
        setNear(ch);
        if (ch) buzz('tap', null);
      }
      setFrame((f) => (f + 1) % 1e6);
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [map, world]);

  const spottedToast = useRef(game.stats.heat);
  useEffect(() => {
    if (game.stats.heat > spottedToast.current) flash(`WYKRYTO! Ślad ${game.stats.heat}%`, C.red);
    spottedToast.current = game.stats.heat;
  }, [game.stats.heat]);

  const enter = () => {
    const o = world.pois.find((x) => x.ch === near);
    if (!o) return;
    if (o.once && mstate.done.includes(o.ch)) return;
    if (o.reqAny && !o.reqAny.some((r) => meets(r, game))) {
      buzz('bad');
      flash(o.locked, C.yellow);
      return;
    }
    buzz();
    onPoi(o.ch, { x: pos.current.x, y: pos.current.y });
  };

  const p = pos.current;
  const camX = world.w <= view.w ? (world.w - view.w) / 2 : Math.max(0, Math.min(world.w - view.w, p.x - view.w / 2));
  const camY = world.h <= view.h ? (world.h - view.h) / 2 : Math.max(0, Math.min(world.h - view.h, p.y - view.h / 2));
  const nearPoi = world.pois.find((o) => o.ch === near);
  const nearDone = nearPoi && nearPoi.once && mstate.done.includes(nearPoi.ch);
  const target = objective.target && world.pois.find((o) => o.ch === objective.target);
  const arrow = target && Math.hypot(target.x - p.x, target.y - p.y) > 70 ? Math.atan2(target.y - p.y, target.x - p.x) : null;
  const pulse = 0.55 + 0.45 * Math.sin(Date.now() / 220);

  return (
    <View style={s.wrap}>
      <View style={s.head}>
        <Text style={s.objective}>{objective.text}</Text>
      </View>

      <View style={s.viewport} onLayout={(e) => setView({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
        <View style={[s.world, { width: world.w, height: world.h, transform: [{ translateX: -camX }, { translateY: -camY }] }]}>
          <Image source={MAP_ART[mapId]} style={{ position: 'absolute', left: 0, top: 0, width: world.w, height: world.h }} />
          {world.pickups.map((pk) =>
            taken.current.has(pk.key) ? null : <View key={pk.key} style={[s.chip, { left: pk.x - 6, top: pk.y - 6 }]} />
          )}
          {world.shards.map((sh) =>
            taken.current.has(sh.key) ? null : (
              <View key={sh.key} pointerEvents="none" style={[s.shardGlow, { left: sh.x - 16, top: sh.y - 16, opacity: pulse }]}>
                <View style={s.shard} />
              </View>
            )
          )}
          {world.pois.map((o) => {
            const done = o.once && mstate.done.includes(o.ch);
            return (
              <View key={o.ch} style={[s.poiWrap, { left: o.x - 70, top: o.y - 42 }]} pointerEvents="none">
                <Text numberOfLines={1} style={[s.poiLabel, done && { color: C.dim, borderColor: C.line }]}>
                  {o.label}
                </Text>
                <View style={[s.poi, done && { borderColor: C.dim }, near === o.ch && !done && s.poiNear]} />
              </View>
            );
          })}
          {drones.current.map((d, i) => (
            <View key={`d${i}`} pointerEvents="none">
              <View
                style={[
                  s.vision,
                  {
                    left: d.x - d.r,
                    top: d.y - d.r,
                    width: d.r * 2,
                    height: d.r * 2,
                    borderRadius: d.r,
                    backgroundColor: `rgba(255,71,87,${0.08 + d.meter * 0.3})`,
                    borderColor: d.cool > 0 ? C.dim : C.red,
                  },
                ]}
              />
              <View style={[s.droneShadow, { left: d.x - 6, top: d.y + 10 }]} />
              {[-1, 1].map((ax) =>
                [-1, 1].map((ay) => <View key={`${ax}${ay}`} style={[s.rotor, { left: d.x + ax * 9 - 6, top: d.y + ay * 9 - 6 }]} />)
              )}
              <View style={[s.drone, { left: d.x - 8, top: d.y - 8 }]}>
                <View style={[s.droneEye, d.meter > 0 && { backgroundColor: '#fff' }]} />
              </View>
              {d.meter > 0 ? (
                <View style={[s.meterBg, { left: d.x - 16, top: d.y - 20 }]}>
                  <View style={[s.meterFill, { width: 32 * d.meter }]} />
                </View>
              ) : null}
            </View>
          ))}
          <View style={[s.playerGlow, { left: p.x - 24, top: p.y - 24 }]} pointerEvents="none" />
          <View style={[s.pShadow, { left: p.x - 10, top: p.y + 4 }]} pointerEvents="none" />
          <View style={[s.player, { left: p.x - 14, top: p.y - 14, transform: [{ rotate: `${face.current + 90}deg` }] }]} pointerEvents="none">
            <View style={s.shoulders} />
            <View style={s.hood} />
            <View style={s.nose} />
          </View>
          {arrow != null ? (
            <View
              pointerEvents="none"
              style={[s.arrow, { left: p.x + Math.cos(arrow) * 30 - 7, top: p.y + Math.sin(arrow) * 30 - 6, transform: [{ rotate: `${(arrow * 180) / Math.PI + 90}deg` }] }]}
            />
          ) : null}
        </View>

        <View
          style={StyleSheet.absoluteFill}
          onStartShouldSetResponder={() => true}
          onMoveShouldSetResponder={() => true}
          onResponderGrant={(e) => {
            const { pageX, pageY, locationX, locationY } = e.nativeEvent;
            joy.current = { px: pageX, py: pageY, ox: locationX, oy: locationY, dx: 0, dy: 0 };
          }}
          onResponderMove={(e) => {
            if (!joy.current) return;
            joy.current.dx = e.nativeEvent.pageX - joy.current.px;
            joy.current.dy = e.nativeEvent.pageY - joy.current.py;
          }}
          onResponderRelease={() => (joy.current = null)}
          onResponderTerminate={() => (joy.current = null)}
        >
          {joy.current ? <Joystick j={joy.current} /> : null}
        </View>

        {toast ? (
          <View style={s.toast} pointerEvents="none">
            <Text style={[s.toastText, { color: toast.color }]}>{toast.text}</Text>
          </View>
        ) : null}

        {nearPoi && !nearDone ? (
          <Pressable style={({ pressed }) => [s.enter, pressed && { backgroundColor: '#3a0f26' }]} onPress={enter}>
            <Text style={s.enterText}>WEJDŹ · {nearPoi.label.toUpperCase()}</Text>
          </Pressable>
        ) : (
          <Text style={s.hint} pointerEvents="none">
            {nearDone ? 'Tu wszystko już załatwione' : 'Przytrzymaj palec i przeciągnij, aby iść'}
          </Text>
        )}
      </View>
    </View>
  );
}

function Joystick({ j }) {
  const len = Math.hypot(j.dx, j.dy) || 1;
  const k = Math.min(JOY, len) / len;
  return (
    <View pointerEvents="none" style={[s.joyRing, { left: j.ox - JOY, top: j.oy - JOY }]}>
      <View style={[s.joyKnob, { left: JOY - 18 + j.dx * k, top: JOY - 18 + j.dy * k }]} />
    </View>
  );
}

const s = StyleSheet.create({
  wrap: { flex: 1 },
  head: { paddingVertical: 8, gap: 2 },
  objective: { fontFamily: F.regular, fontSize: 13, color: C.text },
  viewport: { flex: 1, overflow: 'hidden', backgroundColor: '#05060b', borderWidth: 1, borderColor: C.line, marginBottom: 8 },
  world: { position: 'absolute', left: 0, top: 0, backgroundColor: '#0b0c16' },
  shardGlow: { position: 'absolute', width: 32, height: 32, borderRadius: 16, backgroundColor: 'rgba(255,46,136,0.25)', alignItems: 'center', justifyContent: 'center' },
  shard: { width: 12, height: 18, backgroundColor: C.pink, transform: [{ rotate: '20deg' }] },
  arrow: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderBottomWidth: 12,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.cyan,
  },
  chip: { position: 'absolute', width: 12, height: 12, borderWidth: 2, borderColor: C.yellow, transform: [{ rotate: '45deg' }] },
  poiWrap: { position: 'absolute', width: 140, alignItems: 'center' },
  poiLabel: {
    fontFamily: F.bold,
    fontSize: 11,
    color: C.pink,
    letterSpacing: 1,
    marginBottom: 3,
    backgroundColor: 'rgba(7,8,15,0.8)',
    borderWidth: 1,
    borderColor: 'rgba(255,46,136,0.5)',
    paddingHorizontal: 6,
    paddingVertical: 1,
  },
  poi: { width: 30, height: 30, borderRadius: 15, borderWidth: 2, borderColor: C.pink },
  poiNear: { backgroundColor: 'rgba(255,46,136,0.3)' },
  vision: { position: 'absolute', borderWidth: 1, borderStyle: 'dashed' },
  drone: { position: 'absolute', width: 16, height: 16, borderRadius: 8, backgroundColor: '#1c1e2a', borderWidth: 2, borderColor: '#4a4e60', alignItems: 'center', justifyContent: 'center' },
  droneEye: { width: 6, height: 6, borderRadius: 3, backgroundColor: C.red },
  droneShadow: { position: 'absolute', width: 12, height: 6, borderRadius: 6, backgroundColor: 'rgba(0,0,0,0.45)' },
  rotor: { position: 'absolute', width: 12, height: 12, borderRadius: 6, borderWidth: 1, borderColor: 'rgba(200,210,230,0.55)', backgroundColor: 'rgba(200,210,230,0.12)' },
  meterBg: { position: 'absolute', width: 32, height: 4, backgroundColor: C.line },
  meterFill: { height: 4, backgroundColor: C.red },
  playerGlow: { position: 'absolute', width: 48, height: 48, borderRadius: 24, backgroundColor: 'rgba(255,210,63,0.16)' },
  pShadow: { position: 'absolute', width: 20, height: 10, borderRadius: 10, backgroundColor: 'rgba(0,0,0,0.5)' },
  player: { position: 'absolute', width: 28, height: 28, alignItems: 'center', justifyContent: 'center' },
  shoulders: { position: 'absolute', width: 26, height: 14, borderRadius: 7, backgroundColor: '#22232e', borderWidth: 2, borderColor: C.yellow },
  hood: { width: 13, height: 13, borderRadius: 7, backgroundColor: '#0d0e14', borderWidth: 1, borderColor: '#5a5c6a' },
  nose: {
    position: 'absolute',
    top: -2,
    width: 0,
    height: 0,
    borderLeftWidth: 4,
    borderRightWidth: 4,
    borderBottomWidth: 6,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: C.yellow,
  },
  joyRing: { position: 'absolute', width: JOY * 2, height: JOY * 2, borderRadius: JOY, borderWidth: 2, borderColor: 'rgba(46,242,255,0.5)' },
  joyKnob: { position: 'absolute', width: 36, height: 36, borderRadius: 18, backgroundColor: 'rgba(46,242,255,0.45)' },
  toast: { position: 'absolute', top: 10, left: 10, right: 10, backgroundColor: 'rgba(7,8,15,0.92)', borderWidth: 1, borderColor: C.line, padding: 10 },
  toastText: { fontFamily: F.medium, fontSize: 14, textAlign: 'center' },
  enter: { position: 'absolute', left: 12, right: 12, bottom: 12, borderWidth: 2, borderColor: C.pink, backgroundColor: 'rgba(7,8,15,0.92)', paddingVertical: 14, alignItems: 'center' },
  enterText: { fontFamily: F.bold, fontSize: 15, letterSpacing: 2, color: C.pink },
  hint: { position: 'absolute', bottom: 14, left: 0, right: 0, textAlign: 'center', fontFamily: F.regular, fontSize: 12, color: C.dim, letterSpacing: 1 },
});
