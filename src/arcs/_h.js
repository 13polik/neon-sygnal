// Skróty do zapisu scen w plikach wątków.
// Tekst pisany jest jako szablon z akapitami; txt() usuwa wcięcia linii.

export const txt = (s) => s.replace(/^[ \t]+/gm, '').trim();

// Scena z tekstem i wyborami
export const sc = (chapter, text, choices) => ({ chapter, text: txt(text), choices });

// Wybór prowadzący do sceny; more może zawierać effect i req
export const go = (text, to, more = {}) => ({ text, to, ...more });

// Wybór uruchamiający minigrę
export const play = (text, type, level, win, lose, more = {}) => ({ text, game: { type, level, win, lose }, ...more });

// Scena-rozdroże: pierwszy pasujący warunek wybiera dalszą scenę
export const route = (...rules) => ({ route: rules });
