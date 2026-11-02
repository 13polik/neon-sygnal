import { go, route, sc } from './_h.js';

// Gołębnik Pchły: chłopak z gołębiem-dronem, informacje i zaginiony Kuba
const D = 'Dolina · Gołębnik';
const hub = go('Wróć do rozmowy', 'pc_hub');
const street = go('Wróć na ulicę', '@map');

export default {
  pchla: route({ if: { notFlag: 'pchla_met' }, to: 'pc_first' }, { to: 'pc_hub' }),

  pc_first: sc(
    D,
    `Na dachu niskiego bloku ktoś zbudował gołębnik z blachy falistej i starych anten. W środku gruchają gołębie, prawdziwe i mechaniczne.

    Chłopak w za dużej kurtce i goglach odwraca się od klatki. „Ty jesteś kurier z czterdziestki. Kuba cię nagrał.” Pokazuje na metalowego gołębia na swoim ramieniu. „Jestem Pchła.”`,
    [go('„Miło cię poznać, Pchła.”', 'pc_hub', { effect: { flag: 'pchla_met' } })]
  ),

  pc_hub: route(
    { if: { flag: 'kuba_found', notFlag: 'pchla_friend' }, to: 'pc_kuba_back' },
    { if: { flag: 'pc_kuba_q', notFlag: 'kuba_found' }, to: 'pc_hub_sad' },
    { to: 'pc_hub_main' }
  ),

  pc_hub_main: sc(
    D,
    `Pchła siedzi na krawędzi dachu, machając nogami nad przepaścią. Gołębie dziobią mu okruchy z dłoni.

    „Co tam, kurierze? Info? Robota? Czy po prostu wpadasz pogapić się na gołębie?”`,
    [
      go('Kup informację (10 kr)', 'pc_tip', { req: { credits: 10, notFlag: 'pc_tip3' }, effect: { credits: -10 } }),
      go('„Gdzie jest Kuba?”', 'pc_kuba', { req: { notFlag: 'pc_kuba_q' }, effect: { flag: 'pc_kuba_q' } }),
      go('Poproś o akumulator dla Oka', 'pc_battery', { req: { flag: 'amp_quest', notFlag: 'amp_battery' } }),
      go('„Opowiedz coś o sobie.”', 'pc_talk', { req: { notFlag: 'pc_talk' }, effect: { flag: 'pc_talk' } }),
      go('Obejrzyj gołębie Pchły', 'pc_birds', { req: { notFlag: 'pc_birds' }, effect: { flag: 'pc_birds' } }),
      go('Pokaż Pchle zdjęcie z oddziału 205', 'pc_mom', { req: { flag: 'pchla_mom', notFlag: 'pchla_mom_told' } }),
      street,
    ]
  ),

  pc_hub_sad: sc(
    D,
    `Pchła siedzi w gołębniku z kolanami pod brodą. Pusta żerdź Kuby kołysze się na wietrze.

    „Masz go?” — pyta z nadzieją, która gaśnie, zanim zdążysz odpowiedzieć.`,
    [go('„Jeszcze szukam.”', 'pc_hub_main')]
  ),

  pc_tip: route({ if: { flag: 'pc_tip2' }, to: 'pc_tip3' }, { if: { flag: 'pc_tip1' }, to: 'pc_tip2' }, { to: 'pc_tip1' }),

  pc_tip1: sc(
    D,
    `Pchła chowa monetę do buta.

    „Sokół patroluje kolejkę do Iglic. Zawsze stoi w ostatnim wagonie, przy drzwiach. Jak masz na koncie dużo śladu, rozpozna cię na pewno. Lepiej zejdź z radaru, zanim wsiądziesz.”`,
    [go('Wróć do rozmowy', 'pc_hub', { effect: { flag: 'pc_tip1' } })]
  ),

  pc_tip2: sc(
    D,
    `„Igła z kliniki była kiedyś najważniejszym chirurgiem w Iglicy” — szepcze Pchła. — „Kuba nagrał, jak w nocy rozmawiała z kimś przez szyfrowany kanał. Mówiła, że Wren ma na sumieniu więcej niż Spokój.”

    „Nie wiem, co to znaczy. Ale brzmi jak coś, za co ktoś by zapłacił.”`,
    [go('Wróć do rozmowy', 'pc_hub', { effect: { flag: 'pc_tip2' } })]
  ),

  pc_tip3: sc(
    D,
    `Pchła rozgląda się, jakby ktoś mógł podsłuchiwać na dachu.

    „Ostatnie info, najlepsze. W Iglicy, na poziomie 210, jest stołówka dla pracowników. Tam w szatni wiszą białe kurtki ochrony. Jak założysz jedną, drony biorą cię za swojego. Prawie zawsze.”

    „Na koszt firmy. Tobie się należy.” Oddaje ci monetę.`,
    [go('Wróć do rozmowy', 'pc_hub', { effect: { flag: ['pc_tip3', 'uniform_tip'], credits: 10 } })]
  ),

  pc_kuba: sc(
    D,
    `Uśmiech znika Pchle z twarzy.

    „Kuba nie wrócił wczoraj w nocy. Ostatni sygnał z jego nadajnika był przy Posterunku koło Śluzy. Myślę, że dron Halcyonu go zestrzelił i zabrali go do kontenera z rzeczami skonfiskowanymi.”

    „Ja tam nie pójdę, mnie znają. Ale ty…”`,
    [go('„Spróbuję go odzyskać.”', 'pc_hub_main')]
  ),

  pc_kuba_back: sc(
    D,
    `Pchła wyrywa ci Kubę z rąk i przytula go jak kota. Gołąb mruga diodą i gruchnie metalicznie.

    „Ma dziurę w skrzydle, ale to naprawię. Naprawię!” Ociera nos rękawem. „Kurierze, od dziś masz u mnie wszystko za darmo. Info, gołębie, co chcesz.”

    „A jak będziesz potrzebować, żeby ktoś narobił zamieszania, Kuba to zrobi. Jest w tym najlepszy.”`,
    [go('Wróć do rozmowy', 'pc_hub_main', { effect: { flag: 'pchla_friend' } })]
  ),

  pc_battery: route({ if: { flag: 'pchla_friend' }, to: 'pc_battery_free' }, { to: 'pc_battery_buy' }),

  pc_battery_free: sc(
    D,
    `„Dla Oka? Dla Wieży?” Pchła już ciągnie spod plandeki ciężki akumulator z napisem PORT POŁUDNIOWY. „Bierz. Wyłowiłem go z kanału, ale działa jak nowy.”

    „Tylko powiedz Oku, że to ode mnie. Może mnie wpuści kiedyś na szczyt wieży.”`,
    [go('Weź akumulator', 'pc_hub_main', { effect: { flag: 'amp_battery' } })]
  ),

  pc_battery_buy: sc(
    D,
    `Pchła klepie plandekę, pod którą stoi ciężki akumulator.

    „Ten tutaj ciągnie cały gołębnik przez tydzień. Sto kredytów. Dla przyjaciół taniej, ale przyjaciół mam mało.”`,
    [
      go('Zapłać 100 kr', 'pc_hub_main', { req: { credits: 100 }, effect: { credits: -100, flag: 'amp_battery' } }),
      hub,
    ]
  ),

  pc_talk: sc(
    D,
    `Pchła wzrusza ramionami.

    „Nie ma co opowiadać. Mama pracowała w Iglicy, sprzątała biura. Pewnego dnia nie wróciła. Halcyon przysłał list, że wypadek przy windzie. I sto kredytów odszkodowania.”

    „Od tamtej pory mam gołębie. Gołębie zawsze wracają.” Patrzy w górę, gdzie nad chmurami świecą Iglice. „Chciałbym kiedyś zobaczyć słońce. Prawdziwe. Mama mówiła, że z jej piętra było widać.”`,
    [hub]
  ),
};
