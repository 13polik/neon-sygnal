import { go, play, route, sc } from './_h.js';

// Rozdział 5: rampa, Sokół i ucieczka. Sojusznicy zmieniają przebieg finału.
const R = 'Rozdział 5 · Sygnał';
const duel3 = (text) => play(text, 'duel', 3, { to: 'ramp' }, { to: 'ramp_hurt', effect: { hp: -1 } });
const chase = (level) => play('Zjeżdżaj rampą', 'chase', level, { to: 'finale' }, { to: 'ep_martyr_1' });

export default {
  broadcast: sc(
    R,
    `Pasek postępu dochodzi do końca. Gdzieś daleko w dole Wieża Radiowa budzi się z szumem.

    Całe piętro wyje alarmem. Jedyna droga na dół to rampa awaryjna dla motorów kurierskich, spiralą przez sto pięter.

    Ale przy rampie ktoś już czeka. Szary płaszcz, czerwone oko.

    Sokół: „Daleko nie uciekniesz, kurierze.”`,
    [
      duel3('Walcz o rampę'),
      go('„Dlaczego im służysz?”', 'sokol_talk', { req: { notFlag: 'sokol_talk' }, effect: { flag: 'sokol_talk' } }),
      go('„Tomasz Lis. Port Południowy. Pamiętasz Martę?”', 'fn_turn', { req: { flag: 'sokol_past' } }),
      go('Rzuć Sokołowi fałszywy chip od Sroki', 'fn_fake', { req: { flag: 'fake_chip' } }),
      go('Gwizdnij przez wszczep na Szczury', 'fn_gangs', { req: { any: [{ flag: 'rats_family' }, { flag: 'gangs_united' }] } }),
      go('Wypuść Kubę, gołębia Pchły', 'fn_kuba', { req: { flag: 'pchla_escort' } }),
    ]
  ),

  sokol_talk: sc(
    R,
    `Sokół przekrzywia głowę. Czerwone oko mruga raz, jakby coś liczyło.

    „Bo płacą. Tak jak tobie.” Robi krok w twoją stronę. „Dwadzieścia lat temu też byłem kurierem w Dolinie. Też myślałem, że jestem kimś więcej niż przesyłka.”

    „Halcyon dał mi nowe oko i nowe życie. Tobie może dać to samo. Oddaj chip, a zapomnę, że cię widziałem.”`,
    [
      duel3('„Nie jestem tobą.” Walcz o rampę'),
      go('„Tomasz Lis. Port Południowy. Pamiętasz Martę?”', 'fn_turn', { req: { flag: 'sokol_past' } }),
      go('Oddaj chip Sokołowi', 'sokol_give'),
    ]
  ),

  sokol_give: sc(
    R,
    `Sokół waży chip w dłoni, jakby sprawdzał, ile jest wart. Potem odprowadza cię do laboratorium.

    Wren nawet nie podnosi wzroku znad ekranu. „Przelew poszedł” — mówi. — „Dziękujemy za współpracę.”

    W twoim uchu robi się zupełnie cicho.`,
    [go('Wyjdź z Iglicy', 'ep_deliv_1', { effect: { credits: 2000 } })]
  ),

  fn_turn: sc(
    R,
    `Sokół zamiera w pół kroku. Czerwone oko mruga szybko, nierówno, jakby coś się w nim zacięło.

    „Skąd…” Głos mu się łamie. „Skąd znasz to imię?”

    „Marta zginęła w powodzi w Porcie Południowym. Szczury wyciągnęły z wody czterdzieści osób, ale ją nie zdążyły. A ty poszedłeś do Halcyonu, bo obiecali, że to się nigdy nie powtórzy.”`,
    [go('„Halcyon nie ratuje ludzi z Doliny, Tomasz. Halcyon ich zjada.”', 'fn_turn2')]
  ),

  fn_turn2: sc(
    R,
    `Sokół łapie się za skronie. Wszczep w jego oku iskrzy. Przez chwilę wygląda jak człowiek, który budzi się z bardzo długiego snu i nie wie, gdzie jest.

    „Modyfikacja behawioralna” — szepcze. — „Pamiętam, jak ją zakładali. Mówili, że to na ból głowy.”

    Długo milczy. Potem zdejmuje płaszcz i rzuca go na ziemię. „Rampa jest wolna. Jadę z tobą. Ktoś musi ci osłaniać plecy, a ja znam każdy zakręt.”`,
    [go('Wsiądźcie na motory', 'fn_escort', { effect: { flag: 'sokol_turned' } })]
  ),

  fn_escort: sc(
    R,
    `Zjeżdżacie razem. Tomasz z przodu, ty za nim. Na każdym zakręcie, gdzie ochrona ustawiła blokadę, on krzyczy kody dostępu, które jeszcze pamięta, i szlabany się podnoszą.

    Mira śmieje się w twoim uchu, nerwowo i radośnie. „Sokół po naszej stronie. Nikt nam nie uwierzy.”`,
    [chase(1)]
  ),

  fn_fake: sc(
    R,
    `Rzucasz Sokołowi chip. Łapie go w locie, przykłada do skanera na nadgarstku. Zielone światło.

    „Rozsądnie” — mówi i odsuwa się od rampy. — „Zmykaj, kurierze. Dziś masz szczęście.”

    Masz pięć minut, zanim drugi skan zdradzi podróbkę Sroki. W Dolinie to cała wieczność.`,
    [go('Wskocz na motor', 'fn_fake2')]
  ),

  fn_fake2: sc(
    R,
    `W połowie rampy słyszysz za sobą wściekły krzyk przez głośniki. Sokół zorientował się.

    Ale jest już za daleko w górze, a ty za daleko w dole. Między wami pięćdziesiąt pięter spirali i zamykające się grodzie przeciwpożarowe.`,
    [chase(2)]
  ),

  fn_gangs: sc(
    R,
    `Gwiżdżesz przez wszczep na częstotliwości, którą dał ci Kret. Przez sekundę nic się nie dzieje.

    Potem z szybu wentylacyjnego wysypują się Szczury. Z windy towarowej Kruki w maskach z dziobami. Rzucają się na ochronę, przewracają barierki, zalewają rampę olejem.

    Sokół odwraca się na chwilę, żeby zobaczyć, co się dzieje. Tylko na chwilę.`,
    [play('Wykorzystaj chwilę i uderz', 'duel', 2, { to: 'ramp' }, { to: 'ramp_hurt', effect: { hp: -1 } })]
  ),

  fn_kuba: sc(
    R,
    `Kuba wylatuje z twojej kurtki jak rakieta. Leciał za kolejką przez całą drogę, tak jak obiecał Pchła.

    Metalowy gołąb trafia Sokoła prosto w czerwone oko. Iskry, krzyk, przekleństwo. Sokół zatacza się, łapiąc za twarz.

    Kuba ląduje ci na ramieniu i gruchnie z zadowoleniem.`,
    [go('Biegnij do motorów', 'ramp')]
  ),

  ramp: sc(
    R,
    `Sokół zostaje za tobą. Wskakujesz na najbliższy motor kurierski i odpalasz silnik.

    Mira: „Nadajnik potrzebuje jeszcze kilku minut. Jeśli cię złapią, zanim skończy, wyłączą go.”`,
    [chase(3)]
  ),

  ramp_hurt: sc(
    R,
    `Paralizator Sokoła przypala ci bok. Krzyczysz, ale udaje ci się odepchnąć go na barierkę. Wskakujesz na motor, zanim zdąży wstać.

    Mira: „Nadajnik potrzebuje jeszcze kilku minut. Wytrzymaj.”`,
    [chase(3)]
  ),

  finale: route({ if: { flag: 'mira_damaged' }, to: 'ep_signal_1' }, { if: { flag: 'sisters' }, to: 'ep_name_1' }, { to: 'ep_signal_1' }),
};
