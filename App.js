import { useEffect, useRef, useState } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { useFonts, ChakraPetch_400Regular, ChakraPetch_500Medium, ChakraPetch_700Bold } from '@expo-google-fonts/chakra-petch';

import { STORY, ENDINGS } from './src/story';
import { applyEffect, clearSave, goTo, loadEndings, loadGame, lockReason, maxHp, meets, newGame, saveGame, unlockEnding } from './src/engine';
import { ChaseGame, HackGame, TimingGame } from './src/MiniGames';
import MapScreen from './src/MapScreen';
import { MAPS } from './src/maps';
import { C, F, buzz } from './src/theme';

const DELTA_LABEL = { credits: 'kr', heat: 'Ślad', hp: 'Zdrowie', trust: 'Zaufanie Miry' };

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ ChakraPetch_400Regular, ChakraPetch_500Medium, ChakraPetch_700Bold });
  const [screen, setScreen] = useState('title');
  const [game, setGame] = useState(null);
  const [saved, setSaved] = useState(null);
  const [endings, setEndings] = useState([]);
  const [deltas, setDeltas] = useState([]);
  const [pending, setPending] = useState(null);

  useEffect(() => {
    loadGame().then(setSaved);
    loadEndings().then(setEndings);
  }, []);

  if (!fontsLoaded && !fontError) return <View style={{ flex: 1, backgroundColor: C.bg }} />;

  const enter = async (state, d) => {
    setDeltas(d);
    setGame(state);
    const node = STORY[state.node];
    setScreen(node.ending ? 'ending' : node.map ? 'map' : 'story');
    if (node.ending) {
      buzz(node.ending.key === 'signal' ? 'ok' : 'tap');
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
    body = <TitleScreen saved={saved} found={endings.length} onNew={start} onContinue={() => enter(saved, [])} onEndings={() => setScreen('endings')} />;
  } else if (screen === 'endings') {
    body = <EndingsScreen found={endings} onBack={() => setScreen('title')} />;
  } else if (screen === 'game') {
    const Mini = { hack: HackGame, timing: TimingGame, chase: ChaseGame }[pending.type];
    body = (
      <View style={s.page}>
        <StatsBar game={game} />
        <Mini level={pending.level} mods={game.flags} onDone={finishGame} />
      </View>
    );
  } else if (screen === 'map') {
    body = (
      <View style={s.page}>
        <StatsBar game={game} />
        <MapScreen
          key={`${game.map.id}-${game.node}`}
          mapId={game.map.id}
          mstate={game.map}
          game={game}
          onPoi={enterPoi}
          onPickup={pickup}
          onSpotted={spotted}
        />
      </View>
    );
  } else if (screen === 'ending') {
    body = <EndingScreen node={STORY[game.node]} found={endings.length} onAgain={start} onMenu={() => setScreen('title')} />;
  } else {
    body = <StoryScreen game={game} deltas={deltas} onChoose={choose} onMenu={() => setScreen('title')} />;
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.root}>
        <StatusBar style="light" />
        {body}
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

function TitleScreen({ saved, found, onNew, onContinue, onEndings }) {
  return (
    <View style={[s.page, { justifyContent: 'space-between', paddingVertical: 40 }]}>
      <View style={{ marginTop: 40 }}>
        <Text style={s.kicker}>NOWA WISŁA · 2091</Text>
        <Flicker style={[s.logo, { color: C.pink }]}>NEON</Flicker>
        <Text style={[s.logo, { color: C.cyan }]}>SYGNAŁ</Text>
        <Text style={s.tagline}>Jeden chip. Jeden głos w twojej głowie.{'\n'}Osiem możliwych zakończeń.</Text>
      </View>
      <View style={{ gap: 12 }}>
        {saved ? <Button label="Kontynuuj" color={C.pink} onPress={onContinue} /> : null}
        <Button label="Nowa gra" onPress={onNew} />
        <Button label={`Zakończenia  ${found}/${ENDINGS.length}`} color={C.yellow} onPress={onEndings} />
      </View>
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

function StoryScreen({ game, deltas, onChoose, onMenu }) {
  const node = STORY[game.node];
  const full = node.text;
  const [shown, setShown] = useState(0);
  const scroll = useRef(null);

  useEffect(() => {
    setShown(0);
    scroll.current?.scrollTo({ y: 0, animated: false });
    const id = setInterval(() => {
      setShown((n) => {
        if (n >= full.length) {
          clearInterval(id);
          return n;
        }
        return n + 3;
      });
    }, 16);
    return () => clearInterval(id);
  }, [game.node, full]);

  const done = shown >= full.length;

  return (
    <View style={s.page}>
      <View style={s.topRow}>
        <Text style={s.chapter}>{node.chapter.toUpperCase()}</Text>
        <Pressable onPress={onMenu} hitSlop={12}>
          <Text style={s.menu}>MENU</Text>
        </Pressable>
      </View>
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
        <Pressable onPress={() => setShown(full.length)}>
          <Text style={s.story}>
            {full.slice(0, shown)}
            {!done ? <Text style={{ color: C.pink }}>▌</Text> : null}
          </Text>
          {!done ? <Text style={s.skip}>stuknij, aby pominąć</Text> : null}
        </Pressable>
        {done ? (
          <View style={{ gap: 10, marginTop: 20 }}>
            {node.choices.map((ch, i) => {
              const ok = meets(ch.req, game);
              const kind = ch.game ? { hack: 'WŁAM', timing: 'REFLEKS', chase: 'POŚCIG' }[ch.game.type] : null;
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

function EndingScreen({ node, found, onAgain, onMenu }) {
  const e = node.ending;
  return (
    <View style={[s.page, { paddingVertical: 24 }]}>
      <ScrollView style={{ flex: 1 }}>
        <Text style={s.kicker}>ZAKOŃCZENIE</Text>
        <Flicker style={[s.endTitle, { color: e.key === 'signal' ? C.cyan : C.pink }]}>{e.title}</Flicker>
        <Text style={s.story}>{e.text}</Text>
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
  logo: { fontFamily: F.bold, fontSize: 64, lineHeight: 68, letterSpacing: 4 },
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
});
