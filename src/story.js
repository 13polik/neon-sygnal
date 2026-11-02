// Fabuła gry. Każdy węzeł to scena z tekstem i wyborami.
// choice: { text, to, effect?, req?, game? }
//   effect: zmiany statystyk { credits, heat, hp, trust } oraz flag: 'nazwa' | unflag
//   req: { trust, credits, flag, notFlag } - warunek, bez którego wybór jest zablokowany
//   game: { type: 'hack' | 'timing', level: 1-3, win: { to, effect }, lose: { to, effect } }
// route: lista warunków sprawdzana przy wejściu - pierwszy pasujący przekierowuje
// ending: scena końcowa

export const START_STATS = { credits: 120, heat: 10, hp: 3, trust: 0 };

export const ENDINGS = [
  { key: 'signal', title: 'Neon Sygnał' },
  { key: 'ghost', title: 'Duch w sieci' },
  { key: 'delivered', title: 'Dostarczone' },
  { key: 'ash', title: 'Popiół' },
  { key: 'rats', title: 'Cudzy problem' },
  { key: 'caught', title: 'Namierzony' },
  { key: 'flatline', title: 'Płaska linia' },
];

export const STORY = {
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
      { text: 'Oddaj chip Szczurom', to: 'end_rats', effect: { credits: 500 } },
    ],
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
      '„Z pamięci tysięcy ludzi zbudowali mnie. Wren chce mnie sprzedać jako idealną asystentkę, bez wspomnień o tym, skąd jestem.”\n\n' +
      '„Na Wieży Radiowej mieszka Oko. Ona wie, jak mi pomóc.”',
    choices: [{ text: 'Pomyśl, co dalej', to: 'crossroads' }],
  },

  mira_cold: {
    chapter: 'Rozdział 2 · Głos',
    text:
      '„Rozumiem” — mówi cicho. — „Ale zanim mnie oddasz, sprawdź jedno. Jedź na Szóstą Śluzę i zapytaj, co się stało z ludźmi, którzy wzięli Spokój.”\n\nPotem milknie.',
    choices: [{ text: 'Pomyśl, co dalej', to: 'crossroads' }],
  },

  crossroads: {
    chapter: 'Rozdział 2 · Głos',
    text:
      'Do Iglicy jedzie się kolejką magnetyczną, w górę, przez chmury. Szósta Śluza leży po drodze. Wieża Radiowa stoi na skraju Doliny, zardzewiała i ciemna.\n\nWren czeka. Halcyon szuka. Masz czas na jeden przystanek.',
    choices: [
      { text: 'Jedź prosto do Iglicy', to: 'train' },
      { text: 'Zajrzyj na Szóstą Śluzę', to: 'sluza', effect: { heat: 15 } },
      { text: 'Idź do Oka na Wieżę Radiową', to: 'oko', req: { trust: 1 }, effect: { heat: 10 } },
    ],
  },

  sluza: {
    chapter: 'Rozdział 2 · Głos',
    text:
      'Szósta Śluza jest cicha. Za cicho. W oknach kamienic świecą ekrany, a przed nimi siedzą ludzie z uśmiechem na twarzach. Nieruchomi.\n\n' +
      'Starsza kobieta w drzwiach mówi szeptem:\n„Wzięli Spokój i już nie wrócili. Oddychają, jedzą, ale nikogo w nich nie ma.”\n\n' +
      'Na ścianie ktoś namalował sprayem antenę i jedno słowo: WIEŻA.',
    choices: [
      { text: 'Idź za znakiem, na Wieżę Radiową', to: 'oko', effect: { trust: 1, heat: 10, flag: 'truth' } },
      { text: 'Wróć na trasę i jedź do Iglicy', to: 'train', effect: { flag: 'truth' } },
    ],
  },

  oko: {
    chapter: 'Rozdział 3 · Wieża',
    text:
      'Stara wieża radiowa z czasów, gdy ludzie słuchali jeszcze radia. Na szczycie, między antenami, mieszka Oko, hakerka z kamerą zamiast lewego oka.\n\n' +
      '„Mira” — mówi, gdy widzi chip. — „Szukam jej od roku. Jeśli puścisz jej wspomnienia przez nadajnik, cała Dolina zobaczy, co zrobił Halcyon.”\n\n' +
      '„Ale nadajnik trzeba połączyć z serwerem Iglicy. Od środka. Weź ten klucz.”',
    choices: [
      { text: 'Weź klucz i jedź do Iglicy', to: 'train', effect: { flag: 'key', trust: 1 } },
      { text: 'Odmów, to za duże ryzyko', to: 'train' },
    ],
  },

  train: {
    route: [{ if: { heat: 50 }, to: 'train_agent' }, { to: 'train_calm' }],
  },

  train_calm: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Kolejka sunie w górę. Za oknem Dolina zamienia się w świecącą plamę, a potem znika pod chmurami. Tutaj świeci słońce. Znasz je tylko z reklam.\n\n' +
      'Mira odzywa się cicho:\n„Jeśli mnie oddasz, nie będę pamiętać, że kiedyś byłam kimś.”',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'lobby' }],
  },

  train_agent: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Na drugim końcu wagonu wstaje mężczyzna w szarym płaszczu. Jego wszczep oczny świeci na czerwono. Agent Halcyonu. Rozpoznał cię.\n\nDrzwi są zamknięte. Do następnej stacji jest minuta.',
    choices: [
      {
        text: 'Zhakuj jego wszczep oczny',
        game: { type: 'hack', level: 2, win: { to: 'agent_hacked', effect: { heat: -20 } }, lose: { to: 'agent_fight', effect: { hp: -1, heat: 15 } } },
      },
      {
        text: 'Wyskocz przez okno na peron',
        game: { type: 'timing', level: 2, win: { to: 'agent_jump', effect: { heat: 10 } }, lose: { to: 'agent_fight', effect: { hp: -1, heat: 20 } } },
      },
      { text: 'Przekup go (300 kr)', to: 'agent_bribe', req: { credits: 300 }, effect: { credits: -300, heat: -15 } },
    ],
  },

  agent_hacked: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Wszczep agenta gaśnie. Mężczyzna łapie się za twarz i osuwa na fotel. Kasujesz swój rekord z jego pamięci podręcznej, zanim system zdąży go wysłać dalej.',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'lobby' }],
  },

  agent_jump: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Szyba pęka. Lądujesz na peronie, przetaczasz się i biegniesz do windy serwisowej. Za tobą wyje alarm, ale drzwi windy zamykają się na czas.',
    choices: [{ text: 'Jedź windą na poziom 210', to: 'lobby' }],
  },

  agent_fight: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Agent jest szybszy. Uderza cię paralizatorem w żebra. Ból przeszywa całe ciało, ale kolejka hamuje na stacji i tłum rozdziela was na sekundę. To wystarcza.',
    choices: [{ text: 'Uciekaj na poziom 210', to: 'lobby' }],
  },

  agent_bribe: {
    chapter: 'Rozdział 3 · Kolejka',
    text:
      'Agent patrzy na przelew, potem na ciebie. Wzrusza ramionami.\n„Nikogo nie widziałem.”\n\nW Iglicach też trzeba z czegoś żyć.',
    choices: [{ text: 'Wysiądź na poziomie 210', to: 'lobby' }],
  },

  lobby: {
    chapter: 'Rozdział 4 · Iglica',
    text:
      'Poziom 210. Biel, szkło i zapach sztucznych kwiatów. Doktor Wren czeka w laboratorium. Uśmiecha się jak ktoś, kto nigdy nie stał w deszczu.\n\n' +
      '„Chip, proszę. Przelew jest gotowy.”\n\nZa jej plecami szumi serwer Halcyonu. Chip w twojej dłoni jest gorący.',
    choices: [
      { text: 'Oddaj chip Wren', to: 'end_delivered', effect: { credits: 2000 } },
      {
        text: 'Podłącz klucz Oka do serwera',
        req: { flag: 'key' },
        game: { type: 'hack', level: 3, win: { to: 'end_signal' }, lose: { to: 'server_fail', effect: { heat: 30 } } },
      },
      { text: 'Uwolnij Mirę do sieci miasta', to: 'end_ghost', req: { trust: 2 } },
      { text: 'Zmiażdż chip w dłoni', to: 'end_ash' },
    ],
  },

  server_fail: {
    chapter: 'Rozdział 4 · Iglica',
    text:
      'Czerwone światło. Alarm. Wren cofa się pod ścianę i woła ochronę.\n\nW twoim uchu krzyczy Oko:\n„Jeszcze jedna próba! Potem odetną Wieżę na zawsze!”',
    choices: [
      {
        text: 'Spróbuj jeszcze raz',
        game: { type: 'hack', level: 3, win: { to: 'end_signal' }, lose: { to: 'end_caught' } },
      },
      { text: 'Uwolnij Mirę, póki jest czas', to: 'end_ghost', req: { trust: 1 } },
      { text: 'Rzuć chip Wren i się poddaj', to: 'end_delivered' },
    ],
  },

  // Zakończenia

  end_signal: {
    ending: {
      key: 'signal',
      title: 'Neon Sygnał',
      text:
        'Wieża Radiowa budzi się po raz pierwszy od pięćdziesięciu lat. Na każdym ekranie w Dolinie pojawiają się wspomnienia: śmiech dzieci ze Śluzy, zapach chleba z piekarni na rogu, pierwszy pocałunek pod wiaduktem.\n\n' +
        'A potem umowa Spokoju, podpisana przez Halcyon, z jedną linijką drobnym drukiem: „dane pamięciowe stają się własnością spółki”.\n\n' +
        'Rano pod Iglicą stoi sto tysięcy ludzi. W twoim uchu Mira mówi:\n„Teraz wszyscy pamiętają.”',
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
        'Szczury płacą pięćset kredytów i znikają w deszczu. Prosto, szybko, bez pytań.\n\n' +
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
