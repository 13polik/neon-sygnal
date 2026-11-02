// Sprawdza spójność fabuły i map: brakujące sceny, nieosiągalne sceny,
// flagi wymagane przez wybory, których nic nie ustawia, oraz poprawność siatek map.
// Uruchom: node scripts/check_story.mjs  (kopiuje src do katalogu tymczasowego jako ESM)

import { cpSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const tmp = mkdtempSync(join(tmpdir(), 'ns-'));
cpSync(join(root, 'src', 'arcs'), join(tmp, 'arcs'), { recursive: true });
cpSync(join(root, 'src', 'story.js'), join(tmp, 'story.js'));
cpSync(join(root, 'src', 'maps.js'), join(tmp, 'maps.js'));
writeFileSync(join(tmp, 'package.json'), '{"type":"module"}');

const { STORY, ENDINGS } = await import(pathToFileURL(join(tmp, 'story.js')));
const { MAPS } = await import(pathToFileURL(join(tmp, 'maps.js')));
rmSync(tmp, { recursive: true, force: true });

let bad = 0;
const err = (...a) => {
  console.log('  !', ...a);
  bad++;
};

// Mapy
for (const [id, m] of Object.entries(MAPS)) {
  const W = m.grid[0].length;
  const at = (c, r) => m.grid[r]?.[c];
  m.grid.forEach((row, r) => row.length !== W && err(id, 'wiersz', r, 'długość', row.length));
  for (const d of m.drones) {
    const [c0, r0] = d.a;
    const [c1, r1] = d.b;
    for (let c = Math.min(c0, c1); c <= Math.max(c0, c1); c++)
      for (let r = Math.min(r0, r1); r <= Math.max(r0, r1); r++) if (at(c, r) === '#') err(id, 'dron przez ścianę', c, r);
  }
  let start;
  m.grid.forEach((row, r) => {
    const c = row.indexOf('P');
    if (c >= 0) start = [c, r];
  });
  const seen = new Set([start.join()]);
  const q = [start];
  while (q.length) {
    const [c, r] = q.shift();
    for (const [dc, dr] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const k = [c + dc, r + dr];
      const ch = at(...k);
      if (ch && ch !== '#' && !seen.has(k.join())) {
        seen.add(k.join());
        q.push(k);
      }
    }
  }
  m.grid.forEach((row, r) =>
    [...row].forEach((ch, c) => {
      if (ch !== '#' && ch !== '.' && !seen.has(`${c},${r}`)) err(id, 'nieosiągalne pole', ch, c, r);
      if (/[A-Z]/.test(ch) && !['P', 'M'].includes(ch) && !m.pois[ch]) err(id, 'brak opisu miejsca', ch);
    })
  );
  for (const [ch, p] of Object.entries(m.pois)) {
    if (!m.grid.some((row) => row.includes(ch))) err(id, 'miejsca nie ma na siatce', ch);
    if (!STORY[p.to]) err(id, 'miejsce prowadzi donikąd', ch, p.to);
  }
}

// Fabuła
const ids = new Set(Object.keys(STORY));
const special = new Set(['@map', '@return']);
const targets = (n) =>
  [
    ...(n.choices || []).flatMap((c) => (c.game ? [c.game.win.to, c.game.lose.to] : [c.to])),
    ...(n.route || []).map((r) => r.to),
    ...(n.map ? Object.values(MAPS[n.map].pois).map((p) => p.to) : []),
    ...(n.map && MAPS[n.map].grid.some((r) => r.includes('M')) ? ['memory_1', 'memory_2', 'memory_3'] : []),
  ].filter((t) => !special.has(t));

const setFlags = new Set();
const needFlags = new Map();
const addSet = (e) => e && [].concat(e.flag || []).forEach((f) => setFlags.add(f));
const addNeed = (req, where) => {
  if (!req) return;
  for (const f of [req.flag, ...(req.flags || []), ...(req.atLeast?.flags || [])].filter(Boolean)) needFlags.set(f, where);
  (req.any || []).forEach((r) => addNeed(r, where));
};

for (const [id, n] of Object.entries(STORY)) {
  if (!n.choices && !n.route && !n.map && !n.ending) err('scena bez treści', id);
  if (n.choices && !n.text) err('scena bez tekstu', id);
  for (const t of targets(n)) if (!ids.has(t)) err('brak sceny', id, '->', t);
  for (const c of n.choices || []) {
    addSet(c.effect);
    addNeed(c.req, id);
    if (c.game) {
      addSet(c.game.win.effect);
      addSet(c.game.lose.effect);
      if (!['hack', 'timing', 'chase', 'duel'].includes(c.game.type)) err('zła minigra', id);
    }
    if (c.text.length > 90) err('za długi wybór', id, c.text);
  }
  for (const r of n.route || []) addNeed(r.if, id);
}
// Flagi ustawiane przez kod gry (rozmowy z Mirą ustawiają flagę równą id tematu)
for (const id of ids) if (id.startsWith('mt_')) setFlags.add(id);
for (const [f, where] of needFlags) if (!setFlags.has(f)) err('flaga nigdy nie ustawiana', f, 'w', where);

const seen = new Set(['start', 'end_flatline', 'end_caught', 'mira_talk']);
const q = [...seen];
while (q.length) for (const t of targets(STORY[q.shift()])) if (!seen.has(t)) seen.add(t), q.push(t);
for (const id of ids) if (!seen.has(id)) err('nieosiągalna scena', id);

const ek = Object.values(STORY).filter((n) => n.ending).map((n) => n.ending.key);
if (!ENDINGS.every((e) => ek.includes(e.key)) || ek.length !== ENDINGS.length) err('zakończenia się nie zgadzają');

const scenes = Object.values(STORY).filter((n) => n.text || n.ending).length;
console.log(`sceny: ${scenes} (wszystkich węzłów ${ids.size}), zakończenia: ${ek.length}, problemy: ${bad}`);
process.exit(bad ? 1 : 0);
