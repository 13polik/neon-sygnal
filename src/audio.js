import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

// Dźwięki są generowane skryptem scripts/gen_audio.py
const SFX = {
  tap: require('../assets/audio/sfx_tap.wav'),
  ok: require('../assets/audio/sfx_ok.wav'),
  bad: require('../assets/audio/sfx_bad.wav'),
  pickup: require('../assets/audio/sfx_pickup.wav'),
  shard: require('../assets/audio/sfx_shard.wav'),
  alarm: require('../assets/audio/sfx_alarm.wav'),
  chapter: require('../assets/audio/sfx_chapter.wav'),
  hit: require('../assets/audio/sfx_hit.wav'),
  block: require('../assets/audio/sfx_block.wav'),
  ending: require('../assets/audio/sfx_ending.wav'),
};

const MUSIC = {
  ambient: require('../assets/audio/music_ambient.wav'),
  tension: require('../assets/audio/music_tension.wav'),
};

let opts = { sound: true, music: true };
const players = {};
let music = null;
let track = null;

export async function initAudio() {
  try {
    await setAudioModeAsync({ playsInSilentMode: true, interruptionMode: 'mixWithOthers' });
  } catch {}
}

export function setAudioOptions(next) {
  opts = { ...opts, ...next };
  if (!opts.music) stopMusic();
  else if (track && !music) playMusic(track);
}

export function sfx(name) {
  if (!opts.sound || !SFX[name]) return;
  try {
    const p = players[name] || (players[name] = createAudioPlayer(SFX[name]));
    p.volume = name === 'tap' ? 0.5 : 0.9;
    p.seekTo(0)
      .then(() => p.play())
      .catch(() => {});
  } catch {}
}

// Zmienia podkład; ta sama ścieżka gra dalej bez przerwy, null wycisza muzykę
export function playMusic(name) {
  if (name === track && music) return;
  track = name;
  stopMusic();
  if (!name || !opts.music) return;
  try {
    music = createAudioPlayer(MUSIC[name]);
    music.loop = true;
    music.volume = name === 'tension' ? 0.45 : 0.55;
    music.play();
  } catch {
    music = null;
  }
}

function stopMusic() {
  try {
    music?.pause();
    music?.remove();
  } catch {}
  music = null;
}
