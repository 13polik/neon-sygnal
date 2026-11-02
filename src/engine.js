import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORY, START_STATS } from './story';

const SAVE_KEY = 'neon-sygnal/save';
const ENDINGS_KEY = 'neon-sygnal/endings';

export function newGame() {
  return { node: 'start', stats: { ...START_STATS }, flags: [] };
}

export function meets(req, state) {
  if (!req) return true;
  const { stats, flags } = state;
  if (req.trust != null && stats.trust < req.trust) return false;
  if (req.credits != null && stats.credits < req.credits) return false;
  if (req.heat != null && stats.heat < req.heat) return false;
  if (req.flag && !flags.includes(req.flag)) return false;
  if (req.notFlag && flags.includes(req.notFlag)) return false;
  return true;
}

export function lockReason(req) {
  if (req.trust != null) return 'Mira ci nie ufa';
  if (req.credits != null) return `Potrzeba ${req.credits} kr`;
  if (req.flag === 'key') return 'Brak klucza Oka';
  if (req.notFlag) return 'Już kupione';
  return 'Niedostępne';
}

const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));

// Zwraca nowy stan i listę zmian do pokazania graczowi
export function applyEffect(state, effect) {
  if (!effect) return { state, deltas: [] };
  const stats = { ...state.stats };
  const flags = [...state.flags];
  const deltas = [];
  for (const k of ['credits', 'heat', 'hp', 'trust']) {
    if (effect[k] == null) continue;
    const before = stats[k];
    if (k === 'heat') stats.heat = clamp(before + effect.heat, 0, 100);
    else if (k === 'hp') stats.hp = clamp(before + effect.hp, 0, 3);
    else if (k === 'credits') stats.credits = Math.max(0, before + effect.credits);
    else stats.trust = clamp(before + effect.trust, -2, 4);
    if (stats[k] !== before) deltas.push({ k, v: stats[k] - before });
  }
  if (effect.flag && !flags.includes(effect.flag)) flags.push(effect.flag);
  return { state: { ...state, stats, flags }, deltas };
}

// Przejście do sceny: obsługuje przekierowania i śmierć/namierzenie
export function goTo(state, to) {
  let id = to;
  if (state.stats.hp <= 0) id = 'end_flatline';
  else if (state.stats.heat >= 100) id = 'end_caught';
  let node = STORY[id];
  while (node && node.route) {
    const hit = node.route.find((r) => !r.if || meets(r.if, state));
    id = hit.to;
    node = STORY[id];
  }
  return { ...state, node: id };
}

export async function saveGame(state) {
  try {
    await AsyncStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch {}
}

export async function loadGame() {
  try {
    const raw = await AsyncStorage.getItem(SAVE_KEY);
    const s = raw ? JSON.parse(raw) : null;
    return s && STORY[s.node] ? s : null;
  } catch {
    return null;
  }
}

export async function clearSave() {
  try {
    await AsyncStorage.removeItem(SAVE_KEY);
  } catch {}
}

export async function loadEndings() {
  try {
    const raw = await AsyncStorage.getItem(ENDINGS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export async function unlockEnding(key) {
  const list = await loadEndings();
  if (!list.includes(key)) list.push(key);
  try {
    await AsyncStorage.setItem(ENDINGS_KEY, JSON.stringify(list));
  } catch {}
  return list;
}
