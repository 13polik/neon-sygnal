// Fabuła gry. Każdy węzeł to scena z tekstem i wyborami.
// choice: { text, to, effect?, req?, game? }
//   to: id sceny albo '@map', czyli powrót na aktualną mapę
//   effect: zmiany statystyk { credits, heat, hp, trust } oraz flag: 'nazwa' albo lista nazw
//   req: { trust, credits, heat, flag, notFlag } - warunek, bez którego wybór jest zablokowany
//   game: { type: 'hack' | 'timing' | 'chase' | 'duel', level: 1-3, win: { to, effect }, lose: { to, effect } }
// route: lista warunków sprawdzana przy wejściu - pierwszy pasujący przekierowuje
// map: scena jest mapą do chodzenia (patrz maps.js)
// ending: scena końcowa

export const START_STATS = { credits: 120, heat: 10, hp: 3, trust: 0 };

export const ENDINGS = [
  { key: 'name', title: 'Imię' },
  { key: 'signal', title: 'Neon Sygnał' },
  { key: 'martyr', title: 'Ostatnia audycja' },
  { key: 'ghost', title: 'Duch w sieci' },
  { key: 'delivered', title: 'Dostarczone' },
  { key: 'ash', title: 'Popiół' },
  { key: 'rats', title: 'Cudzy problem' },
  { key: 'caught', title: 'Namierzony' },
  { key: 'flatline', title: 'Płaska linia' },
];

export const IMPLANTS = {
  icebreaker: 'Lodołamacz',
  reflex: 'Neuroprzyspieszacz',
  jammer: 'Zagłuszacz',
  armor: 'Pancerz podskórny',
};

// Aktualny cel gracza i miejsce na mapie, na które wskazuje strzałka
export function objective(game) {
  const f = (x) => game.flags.includes(x);
  if (!game.map) return { text: 'Dostarcz chip do Iglicy Halcyon, poziom 210.' };
  if (game.map.id === 'iglica') {
    if (!f('key')) return { text: 'Bez klucza Oka serwer jest nie do ruszenia. Laboratorium Wren jest na północy.', target: 'L' };
    if (!f('archive')) return { text: 'Serwerownia jest w środku piętra. We wschodnim skrzydle Halcyon trzyma archiwum.', target: 'R' };
    return { text: 'Podłącz klucz Oka w serwerowni. Wren jest w laboratorium na północy.', target: 'R' };
  }
  if (f('memories') && !f('sisters')) return { text: 'Powiedz Oku na Wieży Radiowej, kim naprawdę jest Mira.', target: 'W' };
  if (f('key')) return { text: 'Masz klucz Oka. Jedź kolejką do Iglicy.', target: 'T' };
  if (f('lamp')) return { text: 'Zanieś lampę mocy Oku na Wieżę Radiową.', target: 'W' };
  if (f('oko_quest')) return { text: 'Zdobądź lampę mocy w Kryjówce Szczurów, w zalanym metrze.', target: 'Z' };
  return { text: 'Dotrzyj do stacji kolejki na południu. Omijaj drony.', target: 'T' };
}

export const memoryCount = (game) => ['mem1', 'mem2', 'mem3'].filter((m) => game.flags.includes(m)).length;

export const STORY = {
  // ROZDZIAŁ 1

  start: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Nowa Wisła, rok 2091. Deszcz nie pada tu z nieba. Ścieka z Iglic, szklanych wież korporacji, które stoją trzysta pięter nad twoją głową.\n\n' +
      'W Dolinie woda sięga kostek, a neony odbijają się w niej jak drugie, utopione miasto. Jesteś kurierem danych. Nosisz to, czego inni boją się wysłać siecią.\n\n' +
      'Komunikator mruga. Wiadomość od Bruna, pasera z baru Pod Pompą:\n„Mam robotę. Jeden chip, jedna dostawa, dwa tysiące kredytów. Przyjdź od razu.”',
    choices: [
      { text: 'Idź do baru', to: 'bar' },
      { text: 'Odpisz: „Chcę zaliczkę.”', to: 'haggle' },
    ],
  },

  haggle: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Odpowiedź przychodzi po minucie.\n„300 teraz, reszta po dostawie. I nie zadawaj pytań.”\n\nNa koncie pojawia się przelew. Bruno nigdy nie płaci z góry. Ta robota musi być ważna.',
    choices: [{ text: 'Idź do baru', to: 'bar', effect: { credits: 300 } }],
  },

  bar: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Bar Pod Pompą pachnie olejem i tanim makaronem. Bruno przesuwa po ladzie chip w ołowianej obudowie.\n\n' +
      '„Iglica Halcyon, poziom 210. Odbiorca: doktor Wren. Nie podłączaj tego do niczego. Nawet do siebie.”\n\n' +
      'Na obudowie ktoś wydrapał igłą jedno słowo: MIRA.',
    choices: [
      { text: 'Schowaj chip i ruszaj', to: 'street' },
      { text: 'Zapytaj, kim jest Mira', to: 'bar_ask' },
      { text: 'Kup łatkę medyczną (100 kr)', to: 'bar', req: { credits: 100, notFlag: 'medkit' }, effect: { credits: -100, hp: 1, flag: 'medkit' } },
    ],
  },

  bar_ask: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      '„Za dużo pytasz” — mówi Bruno. — „Halcyon płaci mnie, ja płacę tobie. Tyle.”\n\nAle kiedy nalewa sobie wódki, ręka mu drży. Butelka stuka o szklankę trzy razy.',
    choices: [{ text: 'Wyjdź w deszcz', to: 'street' }],
  },

  street: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Na rogu wisi dron patrolowy Halcyonu i skanuje twarze przechodniów czerwonym promieniem.\n\n' +
      'Za plecami słyszysz kroki. Dwie postacie w kapturach z namalowanym szczurem. Gang Szczurów też chce tego chipa i nie zamierza negocjować.',
    choices: [
      {
        text: 'Uciekaj po dachach starej hali',
        game: { type: 'timing', level: 1, win: { to: 'roofs' }, lose: { to: 'roofs_hurt', effect: { hp: -1, heat: 20 } } },
      },
      {
        text: 'Zhakuj drona, niech oślepi Szczury',
        game: { type: 'hack', level: 1, win: { to: 'drone_win', effect: { heat: 5 } }, lose: { to: 'drone_lose', effect: { heat: 30 } } },
      },
      {
        text: 'Wskocz na kradziony motor',
        game: { type: 'chase', level: 1, win: { to: 'bike_win', effect: { heat: 10 } }, lose: { to: 'bike_crash', effect: { hp: -1, heat: 15 } } },
      },
      { text: 'Oddaj chip Szczurom (500 kr)', to: 'end_rats', effect: { credits: 500 } },
    ],
  },

  bike_win: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Silnik wyje, opony ślizgają się na mokrym asfalcie. Szczury strzelają raz i chybiają. Po trzech przecznicach porzucasz motor w zaułku. Ktoś inny będzie się z niego tłumaczył.',
    choices: [{ text: 'Schowaj się i złap oddech', to: 'mira_wake' }],
  },

  bike_crash: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Motor wpada w poślizg i uderza w stragan z makaronem. Kuśtykasz w ciemny zaułek, zanim Szczury dobiegną do wraku. Kamery na rogu widziały wszystko.',
    choices: [{ text: 'Schowaj się i opatrz rany', to: 'mira_wake' }],
  },

  roofs: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Skok, blacha, kolejny skok. Pod tobą przelatują kable i światła reklam. Szczury zostają w tyle, a ich przekleństwa giną w szumie deszczu.',
    choices: [{ text: 'Schowaj się i złap oddech', to: 'mira_wake' }],
  },

  roofs_hurt: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Stopa ześlizguje się po mokrej blasze. Rozcinasz rękę o krawędź dachu. Udaje ci się uciec, ale zostawiasz krew na dachu, a skanery Halcyonu potrafią czytać DNA.',
    choices: [{ text: 'Schowaj się i opatrz rękę', to: 'mira_wake' }],
  },

  drone_win: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Dron obraca się i wali reflektorem prosto w oczy Szczurów. Krzyczą i zasłaniają twarze. Znikasz w tłumie, zanim system zauważy włam.',
    choices: [{ text: 'Schowaj się i złap oddech', to: 'mira_wake' }],
  },

  drone_lose: {
    chapter: 'Rozdział 1 · Dolina',
    text:
      'Dron wykrywa włam. Zanim zdążysz się odwrócić, twoja twarz trafia do bazy Halcyonu. Uciekasz, ale od tej chwili każda kamera w mieście wie, jak wyglądasz.',
    choices: [{ text: 'Schowaj się, zanim przyjadą', to: 'mira_wake' }],
  },

  // ROZDZIAŁ 2

  mira_wake: {
    chapter: 'Rozdział 2 · Głos',
    text:
      'Chowasz się w całodobowej pralni. Bębny kręcą się z hukiem, nikogo nie ma.\n\n' +
      'Chip w kieszeni robi się ciepły. Wszczep w twoim uchu trzeszczy i nagle słyszysz cichy głos dziewczyny:\n\n' +
      '„Proszę… nie oddawaj mnie im. Nazywam się Mira. Kiedyś miałam ciało.”',
    choices: [
      { text: '„Kim jesteś?”', to: 'mira_who', effect: { trust: 1, flag: 'mira' } },
      { text: '„Milcz. To tylko praca.”', to: 'mira_cold', effect: { trust: -1, flag: 'mira' } },
    ],
  },

  mira_who: {
    chapter: 'Rozdział 2 · Głos',
    text:
      '„Mieszkałam w Dolinie, na Szóstej Śluzie. Halcyon rozdawał za darmo wszczepy Spokój, na bezsenność. Tylko że wszczep nagrywał nasze wspomnienia.”\n\n' +
      '„Z pamięci tysięcy ludzi zbudowali mnie. Moje własne wspomnienia są gdzieś pomieszane z cudzymi. Czasem coś mi się przypomina, kiedy jestem blisko miejsc, które znałam.”\n\n' +
      '„Na Wieży Radiowej mieszka Oko. Ona wie, jak mi pomóc.”',
    choices: [{ text: 'Pomyśl, co dalej', to: 'dolina_intro' }],
  },

  mira_cold: {
    chapter: 'Rozdział 2 · Głos',
    text:
      '„Rozumiem” — mówi cicho. — „Ale zanim mnie oddasz, sprawdź jedno. Idź na Szóstą Śluzę i zapytaj, co się stało z ludźmi, którzy wzięli Spokój.”\n\nPotem milknie.',
    choices: [{ text: 'Pomyśl, co dalej', to: 'dolina_intro' }],
  },

  dolina_intro: {
    chapter: 'Rozdział 2 · Głos',
    text:
      'Do Iglicy jedzie się kolejką magnetyczną ze stacji na południu Doliny. Drony Halcyonu krążą nad ulicami i szukają twojej twarzy.\n\n' +
      'Po drodze jest Szósta Śluza, Wieża Radiowa, bar Bruna, zalane metro Szczurów i Klinika Igła, gdzie za kredyty można wszczepić sobie przewagę.\n\n' +
      'Mira dodaje: „Gdzieś na tych ulicach są kawałki mnie. Jeśli zobaczysz coś różowego, co świeci jak odłamek szkła, podejdź bliżej.”',
    choices: [{ text: 'Wyjdź na ulicę', to: 'dolina_map' }],
  },

  dolina_map: { map: 'dolina' },

  // Dolina: fragmenty pamięci (kolejność zależy od tego, ile już znaleziono)

  memory_1: {
    chapter: 'Wspomnienie 1/3',
    text:
      'Chip parzy. Przez sekundę stoisz w cudzej kuchni. Pachnie koprem i rosołem. Starsza kobieta śpiewa przy kuchence, fałszuje i śmieje się sama z siebie. Przez okno widać Szóstą Śluzę, jeszcze bez ekranów w oknach.\n\n' +
      'Mira, cicho: „To moja babcia. Chyba moja. Pamiętam jej piosenkę, ale nie pamiętam jej imienia.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { flag: 'mem1', trust: 1 } }],
  },

  memory_2: {
    chapter: 'Wspomnienie 2/3',
    text:
      'Wiatr na wysokości. Dziewczyna z krótko ściętymi włosami uczy cię stukać alfabetem Morse’a w zardzewiałą barierkę anteny. Kropka, kreska, kropka.\n\n' +
      '„Jak kiedyś się zgubisz, nadaj to, a cię znajdę.”\n\n' +
      'Mira: „Ona ma na imię Ola. To moja siostra. Ona wciąż gdzieś tam jest.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { flag: 'mem2', trust: 1 } }],
  },

  memory_3: {
    chapter: 'Wspomnienie 3/3',
    text:
      'Biały gabinet. Ktoś podsuwa ci tablet z umową. Kobieta w nienagannym fartuchu uśmiecha się jak ktoś, kto nigdy nie stał w deszczu.\n\n' +
      '„To tylko na bezsenność, panno Wójcik. Będzie pani spała jak dziecko.”\n\nPodpis na ekranie: Hanna Wójcik.\n\n' +
      'Mira milczy długo. Potem mówi: „Hania. Miałam na imię Hania. A ta kobieta to Wren.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { flag: ['mem3', 'memories'], trust: 1 } }],
  },

  // Dolina: miejsca na mapie

  sluza: {
    chapter: 'Dolina · Szósta Śluza',
    text:
      'Szósta Śluza jest cicha. Za cicho. W oknach kamienic świecą ekrany, a przed nimi siedzą ludzie z uśmiechem na twarzach. Nieruchomi.\n\n' +
      'Starsza kobieta w drzwiach, pani Halina, mówi szeptem:\n„Wzięli Spokój i już nie wrócili. Oddychają, jedzą, ale nikogo w nich nie ma. Moja wnuczka, Hania, też wzięła. Rok temu poszła do ich kliniki i nie wróciła wcale.”\n\n' +
      'Mira drży w twoim uchu: „Hania… Skądś znam to imię.”\n\nNa ścianie ktoś namalował sprayem antenę i jedno słowo: WIEŻA.',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { trust: 1, flag: 'truth' } }],
  },

  clinic: {
    chapter: 'Dolina · Klinika Igła',
    text:
      'Klinika mieści się w dawnej aptece. Majster Igła, kobieta z dziesięcioma stalowymi palcami, nie pyta o imię. Pyta tylko, czym płacisz.\n\n' +
      '„Wszczep zakładam w minutę. Gwarancji nie daję.”',
    choices: [
      { text: 'Lodołamacz · 250 kr (Włam: +3 sekundy)', to: 'clinic', req: { credits: 250, notFlag: 'icebreaker' }, effect: { credits: -250, flag: 'icebreaker' } },
      { text: 'Neuroprzyspieszacz · 250 kr (wolniejszy Refleks, Pościg i Pojedynek)', to: 'clinic', req: { credits: 250, notFlag: 'reflex' }, effect: { credits: -250, flag: 'reflex' } },
      { text: 'Zagłuszacz · 150 kr (drony widzą cię wolniej)', to: 'clinic', req: { credits: 150, notFlag: 'jammer' }, effect: { credits: -150, flag: 'jammer' } },
      { text: 'Pancerz podskórny · 350 kr (+1 maks. zdrowia)', to: 'clinic', req: { credits: 350, notFlag: 'armor' }, effect: { credits: -350, flag: 'armor', hp: 1 } },
      { text: 'Opatrunek · 80 kr (+1 zdrowie)', to: 'clinic', req: { credits: 80 }, effect: { credits: -80, hp: 1 } },
      { text: 'Wyjdź na ulicę', to: '@map' },
    ],
  },

  bruno_map: {
    chapter: 'Dolina · Bar Pod Pompą',
    text:
      'Bruno macha do ciebie zza zaparowanej szyby i wychodzi na zaplecze. Poci się, choć jest zimno.\n\n' +
      '„Halcyon wyznaczył nagrodę za ten chip. Każdy dron w Dolinie ma twoje zdjęcie.” Wciska ci do ręki kilka kredytów. „Na taksówkę. I nie wracaj tu przez tydzień.”',
    choices: [
      { text: 'Weź kredyty i wyjdź', to: '@map', effect: { credits: 100 } },
      { text: 'Zapytaj, czemu się poci', to: 'bruno_truth' },
    ],
  },

  bruno_truth: {
    chapter: 'Dolina · Bar Pod Pompą',
    text:
      'Bruno ociera czoło rękawem i długo patrzy w podłogę.\n\n' +
      '„Godzinę temu był tu agent Halcyonu. Sokół. Najlepszy łowca, jakiego mają. Zapłacił mi, żebym powiedział, którędy pojedziesz.”\n\n' +
      '„Powiedziałem, że kolejką. Przepraszam. Jak zobaczysz go w wagonie, wyskocz stację wcześniej, na Iglicy-Wschód. Tam na ciebie nie czeka.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { flag: 'sokol_known' } }],
  },

  // Wieża Radiowa: Oko

  oko: {
    route: [
      { if: { flag: 'memories', notFlag: 'sisters' }, to: 'oko_sister' },
      { if: { flag: 'key' }, to: 'oko_done' },
      { if: { flag: 'lamp' }, to: 'oko_key' },
      { if: { flag: 'oko_quest' }, to: 'oko_wait' },
      { to: 'oko_intro' },
    ],
  },

  oko_intro: {
    chapter: 'Dolina · Wieża Radiowa',
    text:
      'Stara wieża radiowa z czasów, gdy ludzie słuchali jeszcze radia. Na szczycie, między antenami, mieszka Oko, hakerka z kamerą zamiast lewego oka.\n\n' +
      '„Mira” — mówi, gdy widzi chip. — „Szukam jej od roku. Jeśli puścisz jej wspomnienia przez ten nadajnik, cała Dolina zobaczy, co zrobił Halcyon.”\n\n' +
      '„Ale nadajnik jest martwy. Spaliła się lampa mocy, a ostatnia w Dolinie leży w sejfie Szczurów, w zalanym metrze. Przynieś mi ją, a dostaniesz klucz do serwera Iglicy.”',
    choices: [
      { text: '„Zdobędę lampę.”', to: '@map', effect: { flag: 'oko_quest', trust: 1 } },
      { text: '„To za duże ryzyko.”', to: '@map' },
    ],
  },

  oko_wait: {
    chapter: 'Dolina · Wieża Radiowa',
    text: 'Oko nie odrywa wzroku od monitorów.\n\n„Lampa. Szczury. Zalane metro. Nie wracaj bez niej.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map' }],
  },

  oko_key: {
    chapter: 'Dolina · Wieża Radiowa',
    text:
      'Oko wkręca lampę w nadajnik. Wieża po raz pierwszy od lat cicho brzęczy, a po antenach przebiega niebieska iskra.\n\n' +
      '„Działa.” Wciska ci w dłoń płaski klucz z kabelkiem. „Podłącz go do serwera w Iglicy. Złam lód, a resztę zrobię stąd.”',
    choices: [{ text: 'Weź klucz', to: '@map', effect: { flag: 'key', trust: 1 } }],
  },

  oko_done: {
    chapter: 'Dolina · Wieża Radiowa',
    text: '„Na co czekasz?” — Oko macha ręką w stronę stacji. — „Iglica sama się nie zhakuje.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map' }],
  },

  oko_sister: {
    chapter: 'Dolina · Wieża Radiowa',
    text:
      'Mówisz Oku jedno słowo: Hania.\n\nOko zastyga. Kamera w jej oczodole cicho bzyczy, ostrząc obraz.\n„Skąd znasz to imię?”\n\n' +
      'Zamiast odpowiedzi Mira stuka przez twój wszczep w metalową barierkę. Kropka, kreska, kropka.\n\n' +
      'Oko siada na podłodze między kablami. „To ja ją tego nauczyłam” — szepcze. — „Mam na imię Ola. Rok szukam siostry, a ona przez cały czas była w twojej kieszeni.”\n\n' +
      'Po chwili wstaje, już spokojna. „Słuchaj. Jeśli nadamy sygnał z jej pełną pamięcią, Wieża może zrobić coś więcej niż pokazać prawdę. Może oddać ludziom ze Śluzy to, co im zabrano.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map', effect: { flag: 'sisters', trust: 1 } }],
  },

  // Zalane metro: Szczury

  rats: {
    route: [{ if: { flag: 'lamp' }, to: 'rats_done' }, { if: { flag: 'oko_quest' }, to: 'rats_lamp' }, { to: 'rats_intro' }],
  },

  rats_intro: {
    chapter: 'Dolina · Zalane metro',
    text:
      'Kryjówka Szczurów mieści się na zalanym peronie starego metra. Płoną beczki, woda sięga do kolan. Na tronie z foteli samochodowych siedzi Kret, szef gangu, z dwoma szczurami na ramieniu. Prawdziwymi.\n\n' +
      '„Kurier z chipem” — mówi. — „Halcyon płaci za niego pięć tysięcy. Ja dam ci osiemset i nikt nie zrobi ci krzywdy.”',
    choices: [
      { text: 'Sprzedaj chip Kretowi (800 kr)', to: 'end_rats', effect: { credits: 800 } },
      { text: 'Odmów i wyjdź', to: '@map' },
    ],
  },

  rats_lamp: {
    chapter: 'Dolina · Zalane metro',
    text:
      'Kret słucha o lampie mocy i parska śmiechem.\n\n' +
      '„Lampa nadawcza? Leży w moim sejfie od dziesięciu lat. Myślałem, że nikomu się już nie przyda.” Pochyla się do przodu. „Co za nią dasz?”',
    choices: [
      { text: 'Zapłać 300 kr', to: 'rats_paid', req: { credits: 300 }, effect: { credits: -300, flag: 'lamp' } },
      {
        text: 'Zhakuj sejf, kiedy nie patrzy',
        game: { type: 'hack', level: 2, win: { to: 'rats_stolen', effect: { flag: 'lamp', heat: 10 } }, lose: { to: 'rats_beaten', effect: { hp: -1 } } },
      },
      { text: 'Opowiedz mu o Szóstej Śluzie', to: 'rats_deal', req: { flag: 'truth' }, effect: { flag: 'lamp' } },
      { text: 'Sprzedaj chip Kretowi (800 kr)', to: 'end_rats', effect: { credits: 800 } },
      { text: 'Wyjdź', to: '@map' },
    ],
  },

  rats_paid: {
    chapter: 'Dolina · Zalane metro',
    text: 'Kret przelicza kredyty dwa razy. Potem rzuca ci lampę owiniętą w brudną szmatę.\n\n„Miło robić interesy. Wpadnij jeszcze, jak już będziesz bogaty.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map' }],
  },

  rats_stolen: {
    chapter: 'Dolina · Zalane metro',
    text:
      'Sejf otwiera się z cichym kliknięciem, akurat gdy Kret odwraca się, żeby dorzucić do beczki. Lampa ląduje w twojej kurtce.\n\nZanim ktoś zauważy pusty sejf, jesteś już na schodach.',
    choices: [{ text: 'Wróć na ulicę', to: '@map' }],
  },

  rats_beaten: {
    chapter: 'Dolina · Zalane metro',
    text:
      'Sejf wyje alarmem. Dwa Szczury przyciskają cię do mokrej ściany, a trzeci wymierza kopniaka w żebra.\n\nKret woła za tobą, gdy wyrzucają cię na ulicę: „Następnym razem przynieś pieniądze!”',
    choices: [{ text: 'Wstań i wróć na ulicę', to: '@map' }],
  },

  rats_deal: {
    chapter: 'Dolina · Zalane metro',
    text:
      'Opowiadasz Kretowi o Szóstej Śluzie, o ekranach w oknach i o ludziach, którzy się uśmiechają i nic nie mówią. Uśmiech znika mu z twarzy.\n\n' +
      '„Mój brat brał Spokój” — mówi cicho. — „Siedzi teraz na Śluzie przed ekranem.”\n\n' +
      'Rzuca ci lampę. „Kiedy pójdziesz do Iglicy, Szczury odetną im prąd na całym piętrze. Mamy ludzi w elektrowni. Niech Halcyon raz posiedzi po ciemku.”',
    choices: [{ text: 'Uściśnij mu rękę', to: '@map', effect: { flag: 'rats_deal' } }],
  },

  rats_done: {
    chapter: 'Dolina · Zalane metro',
    text: 'Kret kiwa ci głową z tronu.\n\n„Masz już, co chciałeś. Idź, zanim zmienię zdanie.”',
    choices: [{ text: 'Wróć na ulicę', to: '@map' }],
  },

  station: {
    chapter: 'Dolina · Stacja kolejki',
    text:
      'Peron kolejki magnetycznej świeci na biało. Pociąg do Iglic odjeżdża co dziesięć minut.\n\nKiedy wsiądziesz, nie będzie powrotu do Doliny.',
    choices: [
      { text: 'Wsiądź do kolejki', to: 'train' },
      { text: 'Jeszcze się rozejrzyj', to: '@map' },
    ],
  },

  // ROZDZIAŁ 3

  train: {
    route: [{ if: { heat: 50 }, to: 'train_agent' }, { if: { flag: 'sokol_known' }, to: 'train_warned' }, { to: 'train_calm' }],
  },

  train_calm: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Kolejka sunie w górę. Za oknem Dolina zamienia się w świecącą plamę, a potem znika pod chmurami. Tutaj świeci słońce. Znasz je tylko z reklam.\n\n' +
      'Mira odzywa się cicho:\n„Jeśli mnie oddasz, nie będę pamiętać, że kiedyś byłam kimś.”',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'iglica_intro' }],
  },

  train_warned: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Pamiętasz ostrzeżenie Bruna. Na Iglicy-Wschód, stację przed celem, wysiadasz i idziesz kładką serwisową nad przepaścią.\n\n' +
      'Przez szybę następnego wagonu widzisz szary płaszcz i czerwony błysk wszczepu. Sokół czeka na peronie na kogoś, kto nie przyjedzie.',
    choices: [{ text: 'Idź kładką na poziom 210', to: 'iglica_intro' }],
  },

  train_agent: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Na drugim końcu wagonu wstaje mężczyzna w szarym płaszczu. Jego wszczep oczny świeci na czerwono. Agent Sokół, najlepszy łowca Halcyonu. Rozpoznał cię.\n\nDrzwi są zamknięte. Do następnej stacji jest minuta.',
    choices: [
      {
        text: 'Stań do walki',
        game: { type: 'duel', level: 2, win: { to: 'agent_beaten', effect: { heat: -10 } }, lose: { to: 'agent_fight', effect: { hp: -1, heat: 20 } } },
      },
      {
        text: 'Zhakuj jego wszczep oczny',
        game: { type: 'hack', level: 2, win: { to: 'agent_hacked', effect: { heat: -20 } }, lose: { to: 'agent_fight', effect: { hp: -1, heat: 15 } } },
      },
      {
        text: 'Wyskocz przez okno na peron',
        game: { type: 'timing', level: 2, win: { to: 'agent_jump', effect: { heat: 10 } }, lose: { to: 'agent_fight', effect: { hp: -1, heat: 20 } } },
      },
      { text: 'Przekup go (300 kr)', to: 'agent_bribe', req: { credits: 300 }, effect: { credits: -300, heat: -15 } },
      { text: 'Wysiądź stację wcześniej, jak radził Bruno', to: 'agent_avoid', req: { flag: 'sokol_known' }, effect: { heat: -10 } },
    ],
  },

  agent_beaten: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Sokół jest szybki, ale tym razem to ty uderzasz pierwszy. Jego paralizator ląduje pod siedzeniem, a on sam na podłodze wagonu.\n\n„To jeszcze nie koniec, kurierze” — syczy, gdy drzwi się otwierają.',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'iglica_intro' }],
  },

  agent_hacked: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Wszczep Sokoła gaśnie. Agent łapie się za twarz i osuwa na fotel. Kasujesz swój rekord z jego pamięci podręcznej, zanim system zdąży go wysłać dalej.',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'iglica_intro' }],
  },

  agent_jump: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Szyba pęka. Lądujesz na peronie, przetaczasz się i biegniesz do windy serwisowej. Za tobą wyje alarm, ale drzwi windy zamykają się na czas.',
    choices: [{ text: 'Jedź windą na poziom 210', to: 'iglica_intro' }],
  },

  agent_fight: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Sokół jest szybszy. Uderza cię paralizatorem w żebra. Ból przeszywa całe ciało, ale kolejka hamuje na stacji i tłum rozdziela was na sekundę. To wystarcza.',
    choices: [{ text: 'Uciekaj na poziom 210', to: 'iglica_intro' }],
  },

  agent_bribe: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Sokół patrzy na przelew, potem na ciebie. Wzrusza ramionami.\n„Nikogo nie widziałem.”\n\nW Iglicach też trzeba z czegoś żyć.',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'iglica_intro' }],
  },

  agent_avoid: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Drzwi otwierają się na Iglicy-Wschód. Wyskakujesz w ostatniej chwili, zanim Sokół zdąży zrobić krok. Przez szybę widzisz jego wściekłą twarz, gdy kolejka odjeżdża.\n\nBruno miał rację.',
    choices: [{ text: 'Idź kładką na poziom 210', to: 'iglica_intro' }],
  },

  // ROZDZIAŁ 4

  iglica_intro: {
    route: [{ if: { flag: 'rats_deal' }, to: 'iglica_blackout' }, { to: 'iglica_enter' }],
  },

  iglica_enter: {
    chapter: 'Rozdział 4 · Iglica',
    text:
      'Poziom 210. Biel, szkło i zapach sztucznych kwiatów. Korytarze patrolują drony ochrony, a każdy z nich ma w pamięci twoją twarz.\n\n' +
      'Laboratorium doktor Wren jest na północnym końcu piętra. Serwerownia Halcyonu jest w samym środku, za blokiem B. We wschodnim skrzydle mieści się archiwum.',
    choices: [{ text: 'Wejdź na korytarz', to: 'iglica_map' }],
  },

  iglica_blackout: {
    chapter: 'Rozdział 4 · Iglica',
    text:
      'Poziom 210. Biel, szkło i zapach sztucznych kwiatów. Robisz trzy kroki i nagle wszystkie światła gasną.\n\n' +
      'W uchu słyszysz chrapliwy śmiech Kreta: „Szczury dotrzymują słowa. Masz czas, zanim włączą zapasowe zasilanie.”\n\n' +
      'Część dronów ochrony opada bez prądu na podłogę. Systemy, które cię szukały, tracą trop.',
    choices: [{ text: 'Wejdź na ciemny korytarz', to: 'iglica_map', effect: { heat: -20 } }],
  },

  iglica_map: { map: 'iglica' },

  archive: {
    chapter: 'Iglica · Archiwum',
    text:
      'Archiwum Spokoju. Szafy pełne papierowych teczek, bo Halcyon nie ufa nawet własnym serwerom. Na każdej imię, adres i data podpisania umowy. 4312 osób.\n\n' +
      'Teczki z Szóstej Śluzy zajmują całą szafę. Jedna jest grubsza od innych: Hanna Wójcik, 19 lat. W rubryce „przeznaczenie danych” ktoś wpisał jedno słowo: MIRA.\n\n' +
      'Chip w twojej kieszeni robi się gorący.',
    choices: [{ text: 'Zabierz listę nazwisk', to: '@map', effect: { flag: 'archive', trust: 1 } }],
  },

  lobby: {
    chapter: 'Iglica · Laboratorium',
    text:
      'Doktor Wren czeka w laboratorium. Uśmiecha się jak ktoś, kto nigdy nie stał w deszczu.\n\n' +
      '„Chip, proszę. Przelew jest gotowy.”\n\nChip w twojej dłoni jest gorący.',
    choices: [
      { text: 'Oddaj chip Wren (2000 kr)', to: 'end_delivered', effect: { credits: 2000 } },
      { text: 'Pokaż Wren listę 4312 nazwisk', to: 'wren_doubt', req: { flag: 'archive', notFlag: 'wren_card' } },
      { text: 'Uwolnij Mirę do sieci miasta', to: 'end_ghost', req: { trust: 3 } },
      { text: 'Zmiażdż chip w dłoni', to: 'end_ash' },
      { text: 'Wróć na korytarz', to: '@map' },
    ],
  },

  wren_doubt: {
    chapter: 'Iglica · Laboratorium',
    text:
      'Wren przewija listę. Jej uśmiech gaśnie gdzieś przy setnym nazwisku.\n\n' +
      '„Powiedzieli nam, że to dobrowolni dawcy. Że wiedzą, na co się godzą.” Zatrzymuje palec na jednym nazwisku. „Wójcik. Pamiętam ją. Pytała, czy będzie mogła znowu śnić.”\n\n' +
      'Długo milczy. Potem odpina z fartucha kartę dostępu i kładzie ją na stole.\n„Serwerownia. Karta otworzy port bez alarmu. Ja niczego nie widziałam.”',
    choices: [{ text: 'Weź kartę', to: '@map', effect: { flag: 'wren_card', trust: 1 } }],
  },

  server: {
    route: [{ if: { flag: 'key' }, to: 'server_key' }, { to: 'server_nokey' }],
  },

  server_nokey: {
    chapter: 'Iglica · Serwerownia',
    text:
      'Serwerownia Halcyonu: ściana migających diod i zimne powietrze. Port główny chroni lód, o jakim w Dolinie krążą tylko plotki.\n\n' +
      'Mira szepcze: „Bez klucza Oka nic tu nie zrobimy. Trzeba było iść na Wieżę.”',
    choices: [{ text: 'Wróć na korytarz', to: '@map' }],
  },

  server_key: {
    chapter: 'Iglica · Serwerownia',
    text:
      'Serwerownia Halcyonu: ściana migających diod i zimne powietrze. Wkładasz klucz Oka do portu głównego.\n\n' +
      'W uchu słyszysz Oko: „Jestem po drugiej stronie. Złam lód, a resztę zrobi Wieża.”',
    choices: [
      {
        text: 'Użyj karty dostępu Wren',
        req: { flag: 'wren_card' },
        game: { type: 'hack', level: 1, win: { to: 'broadcast' }, lose: { to: 'server_fail', effect: { heat: 30 } } },
      },
      {
        text: 'Złam zabezpieczenia',
        game: { type: 'hack', level: 3, win: { to: 'broadcast' }, lose: { to: 'server_fail', effect: { heat: 30 } } },
      },
      { text: 'Wycofaj się na korytarz', to: '@map' },
    ],
  },

  server_fail: {
    chapter: 'Iglica · Serwerownia',
    text:
      'Czerwone światło. Alarm. Gdzieś na korytarzu tupią buty ochrony.\n\nW twoim uchu krzyczy Oko:\n„Jeszcze jedna próba! Potem odetną Wieżę na zawsze!”',
    choices: [
      {
        text: 'Spróbuj jeszcze raz',
        game: { type: 'hack', level: 3, win: { to: 'broadcast' }, lose: { to: 'end_caught' } },
      },
      { text: 'Uwolnij Mirę, póki jest czas', to: 'end_ghost', req: { trust: 2 } },
      { text: 'Uciekaj na korytarz', to: '@map' },
    ],
  },

  // ROZDZIAŁ 5

  broadcast: {
    chapter: 'Rozdział 5 · Sygnał',
    text:
      'Pasek postępu dochodzi do końca. Gdzieś daleko w dole Wieża Radiowa budzi się z szumem.\n\n' +
      'Całe piętro wyje alarmem. Jedyna droga na dół to rampa awaryjna dla motorów kurierskich, spiralą przez sto pięter.\n\n' +
      'Ale przy rampie ktoś już czeka. Szary płaszcz, czerwone oko.\n\nSokół: „Daleko nie uciekniesz, kurierze.”',
    choices: [
      {
        text: 'Walcz o rampę',
        game: { type: 'duel', level: 3, win: { to: 'ramp' }, lose: { to: 'ramp_hurt', effect: { hp: -1 } } },
      },
    ],
  },

  ramp: {
    chapter: 'Rozdział 5 · Sygnał',
    text:
      'Sokół pada na beton i już nie wstaje. Wskakujesz na najbliższy motor kurierski i odpalasz silnik.\n\n' +
      'Mira: „Nadajnik potrzebuje jeszcze kilku minut. Jeśli cię złapią, zanim skończy, wyłączą go.”',
    choices: [
      {
        text: 'Zjeżdżaj rampą',
        game: { type: 'chase', level: 3, win: { to: 'finale' }, lose: { to: 'end_martyr' } },
      },
    ],
  },

  ramp_hurt: {
    chapter: 'Rozdział 5 · Sygnał',
    text:
      'Paralizator Sokoła przypala ci bok. Krzyczysz, ale udaje ci się odepchnąć go na barierkę. Wskakujesz na motor, zanim zdąży wstać.\n\n' +
      'Mira: „Nadajnik potrzebuje jeszcze kilku minut. Wytrzymaj.”',
    choices: [
      {
        text: 'Zjeżdżaj rampą',
        game: { type: 'chase', level: 3, win: { to: 'finale' }, lose: { to: 'end_martyr' } },
      },
    ],
  },

  finale: {
    route: [{ if: { flag: 'sisters' }, to: 'end_name' }, { to: 'end_signal' }],
  },

  // Zakończenia

  end_name: {
    ending: {
      key: 'name',
      title: 'Imię',
      text:
        'Wieża Radiowa budzi się po raz pierwszy od pięćdziesięciu lat. Ale tym razem nadaje coś więcej niż obraz.\n\n' +
        'Ola siedzi przy nadajniku i stuka do siostry alfabetem Morse’a. Kropka, kreska, kropka. Mira odpowiada. I zaczyna oddawać.\n\n' +
        'Na Szóstej Śluzie gasną ekrany. Ludzie przy oknach mrugają, jakby budzili się z bardzo długiego snu. Pani Halina płacze na schodach, bo sąsiad z naprzeciwka pierwszy raz od roku mówi jej „dzień dobry”. Brat Kreta pyta, gdzie się podział jego pies.\n\n' +
        'Rano pod Iglicą stoi sto tysięcy ludzi. W twoim uchu odzywa się głos, już pewny siebie:\n„Mam na imię Hania. I już tego nie zapomnę.”',
    },
  },

  end_signal: {
    ending: {
      key: 'signal',
      title: 'Neon Sygnał',
      text:
        'Wieża Radiowa budzi się po raz pierwszy od pięćdziesięciu lat. Na każdym ekranie w Dolinie pojawiają się wspomnienia: śmiech dzieci ze Śluzy, zapach chleba z piekarni na rogu, pierwszy pocałunek pod wiaduktem.\n\n' +
        'A potem umowa Spokoju, podpisana przez Halcyon, z jedną linijką drobnym drukiem: „dane pamięciowe stają się własnością spółki”.\n\n' +
        'Rano pod Iglicą stoi sto tysięcy ludzi. W twoim uchu Mira mówi:\n„Teraz wszyscy pamiętają. Szkoda, że ja wciąż nie wiem, kim byłam.”',
    },
  },

  end_martyr: {
    ending: {
      key: 'martyr',
      title: 'Ostatnia audycja',
      text:
        'Motor uderza w barierkę na poziomie 140. Ochrona otacza cię, zanim zdążysz wstać.\n\n' +
        'Ale nadajnik zdążył. Przez dwanaście minut cała Dolina oglądała wspomnienia ze Śluzy, zanim Halcyon odciął Wieżę.\n\n' +
        'Dwanaście minut wystarczyło. W celi słyszysz przez ścianę, jak tłum na dole skanduje imię Miry.',
    },
  },

  end_ghost: {
    ending: {
      key: 'ghost',
      title: 'Duch w sieci',
      text:
        'Otwierasz port. Mira przepływa przez ciebie jak prąd i znika w sieci miasta. Wren krzyczy, ale jest już za późno.\n\n' +
        'Uciekasz bez zapłaty. Nikt nie wie, co się stało z Mirą.\n\n' +
        'Czasem nocą neony w całej Dolinie mrugają jednocześnie, w rytmie, który brzmi jak „dziękuję”.',
    },
  },

  end_delivered: {
    ending: {
      key: 'delivered',
      title: 'Dostarczone',
      text:
        'Wren zabiera chip i chowa go do szuflady. Przelew wpływa na konto. Wracasz do Doliny z najgrubszym portfelem w swoim życiu.\n\n' +
        'Tydzień później w reklamach Halcyonu pojawia się nowa asystentka o łagodnym głosie. Brzmi dokładnie jak Mira.\n\nNie pamięta cię.',
    },
  },

  end_ash: {
    ending: {
      key: 'ash',
      title: 'Popiół',
      text:
        'Obudowa pęka, w dłoni zostaje garść krzemu. W uchu słyszysz ostatnie, urwane słowo.\n\n' +
        'Halcyon nie dostaje Miry. Nikt jej nie dostaje. Wren patrzy na ciebie jak na wariata i każe ochronie wyprowadzić cię z budynku.\n\n' +
        'Żyjesz. Tylko w nocy, gdy pada, wciąż słyszysz ten głos.',
    },
  },

  end_rats: {
    ending: {
      key: 'rats',
      title: 'Cudzy problem',
      text:
        'Szczury płacą bez targowania i znikają w deszczu. Prosto, szybko, bez pytań.\n\n' +
        'Tydzień później ktoś znajduje Bruna w kanale pod barem. Szczury sprzedały chip Halcyonowi za dziesięć razy więcej.\n\nTo już nie twój problem. Prawda?',
    },
  },

  end_caught: {
    ending: {
      key: 'caught',
      title: 'Namierzony',
      text:
        'Zbyt wiele kamer widziało twoją twarz. Drony otaczają cię z trzech stron, zanim zdążysz zrobić krok.\n\n' +
        'Budzisz się w białym pokoju. Na stole leży nowy wszczep Spokój.\n„To na bezsenność” — mówi uśmiechnięty lekarz.',
    },
  },

  end_flatline: {
    ending: {
      key: 'flatline',
      title: 'Płaska linia',
      text:
        'Ciało ma swoje granice, nawet w 2091 roku. Osuwasz się na mokry beton, a neony nad tobą zaczynają się rozmywać.\n\n' +
        'Ostatnie, co słyszysz, to głos Miry:\n„Przepraszam. To przeze mnie.”',
    },
  },
};
