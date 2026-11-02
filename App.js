import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, ChakraPetch_400Regular, ChakraPetch_500Medium, ChakraPetch_700Bold } from '@expo-google-fonts/chakra-petch';

import { ENDINGS, IMPLANTS, STORY, memoryCount, objective } from './src/story';
import { applyEffect, clearSave, goTo, loadEndings, loadGame, lockReason, maxHp, meets, newGame, saveGame, unlockEnding } from './src/engine';
import { ChaseGame, DuelGame, HackGame, TimingGame } from './src/MiniGames';
import MapScreen from './src/MapScreen';
import { MAPS } from './src/maps';
import { C, F, buzz, setHaptics } from './src/theme';
import SceneArt, { artFor, castFor } from './src/SceneArt';
import { initAudio, playMusic, setAudioOptions } from './src/audio';
import { DEFAULT_SETTINGS, TEXT_SPEED, loadSettings, saveSettings } from './src/settings';

const DELTA_LABEL = { credits: 'kr', heat: 'Ślad', hp: 'Zdrowie', trust: 'Zaufanie Miry' };
const GAME_LABEL = { hack: 'WŁAM', timing: 'REFLEKS', chase: 'POŚCIG', duel: 'POJEDYNEK' };
const MINI = { hack: HackGame, timing: TimingGame, chase: ChaseGame, duel: DuelGame };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ ChakraPetch_400Regular, ChakraPetch_500Medium, ChakraPetch_700Bold });
  const [screen, setScreen] = useState('title');
  const [game, setGame] = useState(null);
  const [saved, setSaved] = useState(null);
  const [endings, setEndings] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const [pending, setPending] = useState(null);
  const [card, setCard] = useState(null);
  const [journal, setJournal] = useState(false);
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const mapPos = useRef(null);

  useEffect(() => {
    loadGame().then(setSaved);
    loadEndings().then(setEndings);
    initAudio();
    loadSettings().then(applySettings);
  }, []);

  // Podkład muzyczny zależy od ekranu: spokojny w opowieści, napięty w minigrach
  useEffect(() => {
    playMusic(screen === 'game' ? 'tension' : screen === 'ending' ? null : 'ambient');
  }, [screen]);

  function applySettings(next) {
    setSettings(next);
    setAudioOptions({ music: next.music, sound: next.sound });
    setHaptics(next.haptics);
  }

  const changeSetting = (key, value) => {
    const next = { ...settings, [key]: value };
    applySettings(next);
    saveSettings(next);
  };

  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const enter = async (next, d) => {
    let state = next;
    const node = STORY[state.node];
    // Karta tytułowa przy wejściu do nowego rozdziału
    if ((node.chapter?.startsWith('Rozdział') || node.chapter?.startsWith('Prolog')) && node.chapter !== state.card) {
      state = { ...state, card: node.chapter };
      setCard(node.chapter);
    }
    setDeltas(d);
    setGame(state);
    setScreen(node.ending ? 'ending' : node.map ? 'map' : 'story');
    if (node.ending) {
      buzz(['signal', 'name'].includes(node.ending.key) ? 'ok' : 'tap', 'ending');
      setSaved(null);
      setEndings(await unlockEnding(node.ending.key));
      await clearSave();
    } else {
      setSaved(state);
      await saveGame(state);
    }
  };

  const choose = (choice) => {
    buzz();
    if (choice.game) {
      setPending(choice.game);
      setScreen('game');
      return;
    }
    const { state, deltas: d } = applyEffect(game, choice.effect);
    enter(goTo(state, choice.to), d);
  };

  const finishGame = (success) => {
    const out = success ? pending.win : pending.lose;
    const { state, deltas: d } = applyEffect(game, out.effect);
    enter(goTo(state, out.to), d);
  };

  const start = () => enter(newGame(), []);

  // Mapa: wejście do miejsca, podniesienie kredytów, wykrycie przez drona
  const enterPoi = (ch, p) => {
    const poi = MAPS[game.map.id].pois[ch];
    const done = poi.once ? [...game.map.done, ch] : game.map.done;
    enter(goTo({ ...game, map: { ...game.map, ...p, done } }, poi.to), []);
  };

  const pickup = (key, amount, p) => {
    setGame((g) => {
      const { state } = applyEffect(g, { credits: amount });
      const next = { ...state, map: { ...state.map, ...p, taken: [...state.map.taken, key] } };
      saveGame(next);
      return next;
    });
  };

  // Rozmowa z Mirą z dziennika; '@return' wraca do bieżącej sceny albo na mapę
  const canTalk = game?.flags.includes('mira') && ['story', 'map'].includes(screen) && !game.node.startsWith('mt_') && game.node !== 'mira_talk';
  const talk = () => {
    setJournal(false);
    const onMap = screen === 'map';
    const map = onMap && mapPos.current ? { ...game.map, ...mapPos.current } : game.map;
    enter(goTo({ ...game, map, ret: onMap ? '@map' : game.node }, 'mira_talk'), []);
  };

  const shard = (key, p) => {
    const next = { ...game, map: { ...game.map, ...p, taken: [...game.map.taken, key] } };
    enter(goTo(next, `memory_${memoryCount(game) + 1}`), []);
  };

  const spotted = (p) => {
    const { state, deltas: d } = applyEffect({ ...game, map: { ...game.map, ...p } }, { heat: 15 });
    if (state.stats.heat >= 100) enter(goTo(state, 'end_caught'), d);
    else {
      setGame(state);
      saveGame(state);
    }
  };

  let body;
  if (screen === 'title') {
    body = (
      <TitleScreen
        saved={saved}
        found={endings.length}
        onNew={start}
        onContinue={() => enter(saved, [])}
        onEndings={() => setScreen('endings')}
        onSettings={() => setScreen('settings')}
      />
    );
  } else if (screen === 'settings') {
    body = <SettingsScreen settings={settings} onChange={changeSetting} onBack={() => setScreen('title')} />;
  } else if (screen === 'endings') {
    body = <EndingsScreen found={endings} onBack={() => setScreen('title')} />;
  } else if (screen === 'game') {
    const Mini = MINI[pending.type];
    body = (
      <View style={s.page}>
        <TopRow label={GAME_LABEL[pending.type]} />
        <StatsBar game={game} />
        <Mini level={pending.level} mods={game.flags} onDone={finishGame} />
      </View>
    );
  } else if (screen === 'map') {
    body = (
      <View style={s.page}>
        <TopRow label={MAPS[game.map.id].title} onJournal={() => setJournal(true)} onMenu={() => setScreen('title')} />
        <StatsBar game={game} />
        <MapScreen
          key={`${game.map.id}-${game.node}`}
          mapId={game.map.id}
          mstate={game.map}
          game={game}
          paused={journal}
          posOut={mapPos}
          objective={objective(game)}
          onPoi={enterPoi}
          onPickup={pickup}
          onShard={shard}
          onSpotted={spotted}
        />
      </View>
    );
  } else if (screen === 'ending') {
    body = <EndingScreen node={STORY[game.node]} game={game} found={endings.length} onAgain={start} onMenu={() => setScreen('title')} />;
  } else {
    body = (
      <StoryScreen
        game={game}
        deltas={deltas}
        hold={!!card}
        settings={settings}
        onChoose={choose}
        onJournal={() => setJournal(true)}
        onMenu={() => setScreen('title')}
      />
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar style="light" />
        <FadeIn key={screen === 'story' ? 'story' : screen}>{body}</FadeIn>
        {journal && game ? <Journal game={game} onClose={() => setJournal(false)} onTalk={canTalk ? talk : null} /> : null}
        {card && ['story', 'map'].includes(screen) ? <ChapterCard chapter={card} onDone={() => setCard(null)} /> : null}
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

function Flicker({ children, style }) {
  const o = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.delay(2600),
        Animated.timing(o, { toValue: 0.35, duration: 60, useNativeDriver: true }),
        Animated.timing(o, { toValue: 1, duration: 60, useNativeDriver: true }),
        Animated.timing(o, { toValue: 0.6, duration: 40, useNativeDriver: true }),
        Animated.timing(o, { toValue: 1, duration: 80, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [o]);
  return <Animated.Text style={[style, { opacity: o }]}>{children}</Animated.Text>;
}

// Łagodne pojawienie się ekranu przy każdej zmianie widoku
function FadeIn({ children }) {
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(o, { toValue: 1, duration: 260, useNativeDriver: true }).start();
  }, [o]);
  return <Animated.View style={{ flex: 1, opacity: o }}>{children}</Animated.View>;
}

function TopRow({ label, onJournal, onMenu }) {
  return (
    <View style={s.topRow}>
      <Text style={[s.chapter, { flexShrink: 1, marginRight: 14 }]} numberOfLines={1}>
        {label.toUpperCase()}
      </Text>
      <View style={{ flexDirection: 'row', gap: 18 }}>
        {onJournal ? (
          <Pressable onPress={onJournal} hitSlop={12}>
            <Text style={[s.menu, { color: C.cyan }]}>DZIENNIK</Text>
          </Pressable>
        ) : null}
        {onMenu ? (
          <Pressable onPress={onMenu} hitSlop={12}>
            <Text style={s.menu}>MENU</Text>
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ChapterCard({ chapter, onDone }) {
  const [num, name] = chapter.split(' · ');
  const o = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    buzz('tap', 'chapter');
    Animated.timing(o, { toValue: 1, duration: 350, useNativeDriver: true }).start();
    const t = setTimeout(onDone, 2400);
    return () => clearTimeout(t);
  }, []);
  return (
    <Pressable style={s.card} onPress={onDone}>
      <Animated.View style={{ opacity: o, gap: 6 }}>
        <Text style={s.cardNum}>{num.toUpperCase()}</Text>
        <Flicker style={s.cardName}>{name.toUpperCase()}</Flicker>
      </Animated.View>
    </Pressable>
  );
}

function Journal({ game, onClose, onTalk }) {
  const f = (x) => game.flags.includes(x);
  const mem = memoryCount(game);
  const sections = [
    ['Cel', [objective(game).text]],
    f('mira')
      ? [
          'Mira',
          [
            `Zaufanie: ${game.stats.trust > 0 ? '+' : ''}${game.stats.trust}`,
            `Fragmenty pamięci: ${mem}/3`,
            f('truth') && 'Halcyon kradnie wspomnienia przez wszczep Spokój.',
            f('mem1') && 'Pamięta babcię, która śpiewała w kuchni na Szóstej Śluzie.',
            f('mem2') && 'Ma siostrę Olę, która uczyła ją alfabetu Morse’a na wieży.',
            f('mem3') && 'Naprawdę nazywa się Hania Wójcik. Umowę podsunęła jej Wren.',
            f('sisters') && 'Oko to Ola, jej siostra.',
          ],
        ]
      : null,
    [
      'Przedmioty i dowody',
      [
        f('lamp') && !f('key') && 'Lampa mocy',
        f('key') && 'Klucz Oka do serwera Iglicy',
        f('diary') && 'Dziennik Hani',
        f('photo') && 'Zdjęcie sióstr na wieży',
        f('stream_proof') && 'Nagranie z wszczepu pana Józefa',
        f('van_proof') && 'Nagranie transmisji z vana Halcyonu',
        f('igla_proof') && 'Nagranie Igły: prasa i Sokół',
        f('archive') && 'Lista 4312 nazwisk z archiwum',
        f('wren_card') && 'Karta dostępu Wren',
        f('service_pass') && 'Przepustka serwisowa Bruna',
        f('watch') && !f('kind_teodor') && 'Zegarek Teodora',
      ],
    ],
    ['Wszczepy', Object.entries(IMPLANTS).map(([k, v]) => f(k) && v)],
    [
      'Zadania poboczne',
      [
        f('quest_meds') && !f('halina_meds_done') && 'Leki na serce dla pani Haliny. Igła z kliniki może je zrobić.',
        f('ig_quest') && !f('igla_proof') && 'Akta Igły wiezie kurier Halcyonu przez Posterunek.',
        f('pc_kuba_q') && !f('kuba_found') && 'Kuba, gołąb Pchły, może być w kontenerze przy Posterunku.',
        f('kr_brother_q') && !f('witek_seen') && 'Odwiedź Witka, brata Kreta, na Szóstej Śluzie.',
        f('kr_msg') && !f('kruki_peace') && !f('kruki_war') && 'Zanieś wiadomość Kreta Gawronowi na bazar.',
        f('amp_quest') && !f('amp') && `Wzmacniacz dla Oka: cewka od Sroki${f('amp_coil') ? ' (jest)' : ''}, akumulator od Pchły${f('amp_battery') ? ' (jest)' : ''}.`,
        f('fake_plan') && !f('fake_chip') && 'Fałszywy chip u Sroki na bazarze (200 kr).',
        f('van_tip') && !f('van_proof') && 'Biały van Halcyonu staje przy Śluzie o trzeciej w nocy (Posterunek).',
      ],
    ],
    [
      'Sojusznicy i wiedza',
      [
        f('rats_deal') && 'Szczury odetną prąd na piętrze Iglicy.',
        f('gangs_united') && 'Szczury i Kruki zawarły pokój i stoją za tobą.',
        f('sokol_known') && 'Bruno ostrzegł cię przed agentem Sokołem.',
        f('sokol_past') && 'Sokół to Tomasz Lis z Portu Południowego. Jego siostra Marta zginęła w powodzi.',
        f('fake_chip') && 'Masz fałszywy chip od Sroki.',
        f('pchla_friend') && 'Pchła i jego gołąb Kuba są po twojej stronie.',
        f('oko_quest') && !f('lamp') && 'Oko czeka na lampę mocy.',
        f('amp') && 'Wieża ma wzmacniacz. Sygnał dotrze do całego miasta.',
        f('summit_key') && 'Masz klucz Edwarda do windy na szczyt Iglicy.',
        f('uniform') && 'Masz białą kurtkę ochrony. Drony w Iglicy widzą cię wolniej.',
      ],
    ],
  ]
    .filter(Boolean)
    .map(([title, lines]) => [title, lines.filter(Boolean)])
    .filter(([, lines]) => lines.length);
  return (
    <View style={s.overlay}>
      <View style={s.topRow}>
        <Text style={[s.chapter, { color: C.cyan }]}>DZIENNIK</Text>
        <Pressable onPress={onClose} hitSlop={12}>
          <Text style={s.menu}>ZAMKNIJ</Text>
        </Pressable>
      </View>
      <ScrollView contentContainerStyle={{ gap: 22, paddingVertical: 16 }}>
        {onTalk ? <Button label="Porozmawiaj z Mirą" color={C.pink} onPress={onTalk} /> : null}
        {sections.map(([title, lines]) => (
          <View key={title} style={{ gap: 6 }}>
            <Text style={s.kicker}>{title.toUpperCase()}</Text>
            {lines.map((l) => (
              <Text key={l} style={s.journalLine}>
                {l}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Button({ label, onPress, color = C.cyan, disabled, note }) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [s.choice, { borderColor: disabled ? C.line : color }, pressed && { backgroundColor: C.panel }]}
    >
      <Text style={[s.choiceText, disabled && { color: C.dim }]}>{label}</Text>
      {note ? <Text style={s.lock}>{note}</Text> : null}
    </Pressable>
  );
}

function TitleScreen({ saved, found, onNew, onContinue, onEndings, onSettings }) {
  return (
    <View style={s.page}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={s.bleed}>
          <SceneArt art="street" height={170} />
        </View>
        <Text style={s.kicker}>NOWA WISŁA · 2091</Text>
        <Flicker style={[s.logo, { color: C.pink }]}>NEON</Flicker>
        <Text style={[s.logo, { color: C.cyan }]}>SYGNAŁ</Text>
        <Text style={s.tagline}>Jeden chip. Jeden głos w twojej głowie.{'\n'}Dziewięć możliwych zakończeń.</Text>
        <View style={{ gap: 12, marginTop: 24 }}>
          {saved ? <Button label="Kontynuuj" color={C.pink} note={saved.card ? saved.card : null} onPress={onContinue} /> : null}
          <Button label="Nowa gra" onPress={onNew} />
          <Button label={`Zakończenia  ${found}/${ENDINGS.length}`} color={C.yellow} onPress={onEndings} />
          <Button label="Ustawienia" color={C.dim} onPress={onSettings} />
        </View>
      </ScrollView>
    </View>
  );
}

function Toggle({ label, value, onChange }) {
  return (
    <Pressable onPress={() => onChange(!value)} style={s.setRow} accessibilityRole="switch" accessibilityState={{ checked: value }}>
      <Text style={s.setLabel}>{label}</Text>
      <View style={[s.switch, value && { borderColor: C.cyan, backgroundColor: 'rgba(46,242,255,0.15)' }]}>
        <View style={[s.knob, value ? { left: 22, backgroundColor: C.cyan } : { left: 2 }]} />
      </View>
    </Pressable>
  );
}

function Choice({ label, options, value, onChange }) {
  return (
    <View style={{ gap: 8, paddingVertical: 10 }}>
      <Text style={s.setLabel}>{label}</Text>
      <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
        {options.map(([key, name]) => (
          <Pressable key={key} onPress={() => onChange(key)} style={[s.pill, value === key && { borderColor: C.pink, backgroundColor: 'rgba(255,46,136,0.15)' }]}>
            <Text style={[s.pillText, value === key && { color: C.pink }]}>{name}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function SettingsScreen({ settings, onChange, onBack }) {
  return (
    <View style={[s.page, { paddingVertical: 24 }]}>
      <Text style={s.chapter}>USTAWIENIA</Text>
      <ScrollView style={{ flex: 1, marginTop: 12 }}>
        <Toggle label="Muzyka" value={settings.music} onChange={(v) => onChange('music', v)} />
        <Toggle label="Dźwięki" value={settings.sound} onChange={(v) => onChange('sound', v)} />
        <Toggle label="Wibracje" value={settings.haptics} onChange={(v) => onChange('haptics', v)} />
        <Choice
          label="Tempo pisania tekstu"
          value={settings.speed}
          onChange={(v) => onChange('speed', v)}
          options={[
            ['slow', 'Wolne'],
            ['normal', 'Normalne'],
            ['fast', 'Szybkie'],
            ['instant', 'Od razu'],
          ]}
        />
        <Choice
          label="Rozmiar tekstu"
          value={settings.big ? 'big' : 'normal'}
          onChange={(v) => onChange('big', v === 'big')}
          options={[
            ['normal', 'Normalny'],
            ['big', 'Duży'],
          ]}
        />
      </ScrollView>
      <Button label="Wróć" onPress={onBack} />
    </View>
  );
}

function EndingsScreen({ found, onBack }) {
  return (
    <View style={[s.page, { paddingVertical: 24 }]}>
      <Text style={s.chapter}>ODKRYTE ZAKOŃCZENIA</Text>
      <View style={{ gap: 10, marginTop: 20, flex: 1 }}>
        {ENDINGS.map((e) => {
          const ok = found.includes(e.key);
          return (
            <View key={e.key} style={[s.endRow, { borderColor: ok ? C.yellow : C.line }]}>
              <Text style={[s.endName, { color: ok ? C.yellow : C.dim }]}>{ok ? e.title : '? ? ?'}</Text>
            </View>
          );
        })}
      </View>
      <Button label="Wróć" onPress={onBack} />
    </View>
  );
}

function StatsBar({ game }) {
  const { credits, heat, hp, trust } = game.stats;
  const heatColor = heat >= 70 ? C.red : heat >= 40 ? C.yellow : C.green;
  return (
    <View style={s.stats}>
      <Stat label="KR" value={credits} color={C.yellow} />
      <Stat label="ŚLAD" value={`${heat}%`} color={heatColor} />
      <View style={s.stat}>
        <Text style={s.statLabel}>ZDROWIE</Text>
        <View style={{ flexDirection: 'row', gap: 3, marginTop: 5 }}>
          {Array.from({ length: maxHp(game) }, (_, i) => i).map((i) => (
            <View key={i} style={[s.hpBox, { backgroundColor: i < hp ? C.pink : C.line }]} />
          ))}
        </View>
      </View>
      {game.flags.includes('mira') ? <Stat label="MIRA" value={trust > 0 ? `+${trust}` : trust} color={C.cyan} /> : null}
    </View>
  );
}

function Stat({ label, value, color }) {
  return (
    <View style={s.stat}>
      <Text style={s.statLabel}>{label}</Text>
      <Text style={[s.statValue, { color }]}>{value}</Text>
    </View>
  );
}

function StoryScreen({ game, deltas, hold, settings, onChoose, onJournal, onMenu }) {
  const node = STORY[game.node];
  const full = node.text;
  const [shown, setShown] = useState(0);
  const scroll = useRef(null);

  useEffect(() => {
    setShown(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
    if (hold) return;
    const step = TEXT_SPEED[settings.speed] ?? 3;
    if (step === Infinity) {
      setShown(full.length);
      return;
    }
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= full.length) {
          clearInterval(id);
          return n;
        }
        return n + step;
      });
    }, 16);
    return () => clearInterval(id);
  }, [game.node, full, hold, settings.speed]);

  const done = shown >= full.length;

  return (
    <View style={s.page}>
      <TopRow label={node.chapter} onJournal={onJournal} onMenu={onMenu} />
      <StatsBar game={game} />
      {deltas.length ? (
        <View style={s.deltas}>
          {deltas.map((d) => {
            const good = d.k === 'heat' ? d.v < 0 : d.v > 0;
            return (
              <Text key={d.k} style={[s.delta, { color: good ? C.green : C.red }]}>
                {d.k === 'credits' ? `${d.v > 0 ? '+' : ''}${d.v} kr` : `${DELTA_LABEL[d.k]} ${d.v > 0 ? '+' : ''}${d.v}`}
              </Text>
            );
          })}
        </View>
      ) : null}
      <ScrollView ref={scroll} style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 16 }}>
        <View style={[s.bleed, { marginTop: 8 }]}>
          <SceneArt art={artFor(game.node)} cast={castFor(game.node)} />
        </View>
        <Pressable onPress={() => setShown(full.length)}>
          <Text style={[s.story, settings.big && s.storyBig]}>
            {full.slice(0, shown)}
            {!done ? <Text style={{ color: C.pink }}>▌</Text> : null}
          </Text>
          {!done ? <Text style={s.skip}>stuknij, aby pominąć</Text> : null}
        </Pressable>
        {done ? (
          <View style={{ gap: 10, marginTop: 20 }}>
            {node.choices.map((ch, i) => {
              const ok = meets(ch.req, game);
              const kind = ch.game ? GAME_LABEL[ch.game.type] : null;
              return (
                <Button
                  key={i}
                  label={ch.text}
                  color={ch.game ? C.pink : C.cyan}
                  disabled={!ok}
                  note={!ok ? lockReason(ch.req, game) : kind ? `${kind} · poziom ${ch.game.level}` : null}
                  onPress={() => onChoose(ch)}
                />
              );
            })}
          </View>
        ) : null}
      </ScrollView>
    </View>
  );
}

function EndingScreen({ node, game, found, onAgain, onMenu }) {
  const e = node.ending;
  const f = (x) => game.flags.includes(x);
  const summary = [
    ['Kredyty', `${game.stats.credits} kr`],
    ['Ślad', `${game.stats.heat}%`],
    ['Zaufanie Miry', f('mira') ? `${game.stats.trust > 0 ? '+' : ''}${game.stats.trust}` : '—'],
    ['Fragmenty pamięci', `${memoryCount(game)}/3`],
    ['Wszczepy', Object.keys(IMPLANTS).filter(f).length || '—'],
  ];
  return (
    <View style={[s.page, { paddingBottom: 24 }]}>
      <ScrollView style={{ flex: 1 }}>
        <View style={s.bleed}>
          <SceneArt art={artFor(game.node)} cast={castFor(game.node)} />
        </View>
        <Text style={[s.kicker, { marginTop: 12 }]}>ZAKOŃCZENIE</Text>
        <Flicker style={[s.endTitle, { color: e.key === 'name' ? C.yellow : e.key === 'signal' ? C.cyan : C.pink }]}>{e.title}</Flicker>
        <Text style={s.story}>{e.text}</Text>
        <View style={s.summary}>
          <Text style={s.kicker}>TWOJA HISTORIA</Text>
          {summary.map(([k, v]) => (
            <View key={k} style={s.sumRow}>
              <Text style={s.sumKey}>{k}</Text>
              <Text style={s.sumVal}>{v}</Text>
            </View>
          ))}
        </View>
        <Text style={[s.kicker, { marginTop: 24 }]}>
          ODKRYTE: {found}/{ENDINGS.length}
        </Text>
      </ScrollView>
      <View style={{ gap: 12, marginTop: 12 }}>
        <Button label="Zagraj od nowa" onPress={onAgain} />
        <Button label="Menu" color={C.dim} onPress={onMenu} />
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.bg },
  page: { flex: 1, paddingHorizontal: 18, paddingTop: 8 },
  kicker: { fontFamily: F.medium, fontSize: 13, letterSpacing: 4, color: C.dim },
  logo: { fontFamily: F.bold, fontSize: 58, lineHeight: 62, letterSpacing: 4 },
  tagline: { fontFamily: F.regular, fontSize: 17, lineHeight: 26, color: C.text, marginTop: 20 },
  topRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6 },
  chapter: { fontFamily: F.bold, fontSize: 13, letterSpacing: 3, color: C.pink },
  menu: { fontFamily: F.medium, fontSize: 13, letterSpacing: 3, color: C.dim },
  stats: { flexDirection: 'row', gap: 18, paddingVertical: 10, borderTopWidth: 1, borderBottomWidth: 1, borderColor: C.line },
  stat: {},
  statLabel: { fontFamily: F.medium, fontSize: 10, letterSpacing: 2, color: C.dim },
  statValue: { fontFamily: F.bold, fontSize: 18 },
  hpBox: { width: 14, height: 10 },
  deltas: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, paddingTop: 8 },
  delta: { fontFamily: F.medium, fontSize: 13 },
  story: { fontFamily: F.regular, fontSize: 17, lineHeight: 27, color: C.text, marginTop: 16 },
  skip: { fontFamily: F.regular, fontSize: 12, color: C.dim, marginTop: 12, letterSpacing: 1 },
  choice: { borderWidth: 1, borderLeftWidth: 4, paddingVertical: 14, paddingHorizontal: 14 },
  choiceText: { fontFamily: F.medium, fontSize: 16, color: C.text },
  lock: { fontFamily: F.regular, fontSize: 12, color: C.dim, marginTop: 4, letterSpacing: 1 },
  endRow: { borderWidth: 1, paddingVertical: 12, paddingHorizontal: 14 },
  endName: { fontFamily: F.bold, fontSize: 17, letterSpacing: 1 },
  endTitle: { fontFamily: F.bold, fontSize: 40, lineHeight: 46, marginTop: 6 },
  summary: { marginTop: 24, gap: 8, borderTopWidth: 1, borderColor: C.line, paddingTop: 16 },
  sumRow: { flexDirection: 'row', justifyContent: 'space-between' },
  sumKey: { fontFamily: F.regular, fontSize: 15, color: C.dim },
  sumVal: { fontFamily: F.bold, fontSize: 15, color: C.text, fontVariant: ['tabular-nums'] },
  card: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, justifyContent: 'center', paddingHorizontal: 28 },
  cardNum: { fontFamily: F.medium, fontSize: 15, letterSpacing: 6, color: C.dim },
  cardName: { fontFamily: F.bold, fontSize: 52, lineHeight: 58, letterSpacing: 3, color: C.pink },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: C.bg, paddingHorizontal: 18, paddingTop: 8 },
  journalLine: { fontFamily: F.regular, fontSize: 16, lineHeight: 24, color: C.text },
  bleed: { marginHorizontal: -18, marginBottom: 4 },
  storyBig: { fontSize: 20, lineHeight: 31 },
  setRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 14, borderBottomWidth: 1, borderColor: C.line },
  setLabel: { fontFamily: F.medium, fontSize: 16, color: C.text },
  switch: { width: 46, height: 26, borderWidth: 1, borderColor: C.line, borderRadius: 13 },
  knob: { position: 'absolute', top: 2, width: 20, height: 20, borderRadius: 10, backgroundColor: C.dim },
  pill: { borderWidth: 1, borderColor: C.line, paddingVertical: 8, paddingHorizontal: 14 },
  pillText: { fontFamily: F.medium, fontSize: 14, color: C.dim },
});
