import { go, play, sc } from './_h.js';

// Bazar: warsztat Złotej Rączki, kaznodzieja Wiecznego Deszczu, tatuażysta i dzieci Kruków
const X = 'Dolina · Bazar pod wiaduktem';
const hub = go('Wróć między stragany', 'bz_hub');

export default {
  bz_mech: sc(
    X,
    `Warsztat Złotej Rączki to budka z blachy, w której wszystko jest rozkręcone na części. Sam Złota Rączka ma dwie ręce prawdziwe i trzecią mechaniczną, wyrastającą z pleców jak ogon skorpiona.

    „Wszczepy, drony, tostery, serca” — wylicza. — „Naprawiam wszystko, co ma śrubki. I parę rzeczy, które nie mają.”`,
    [
      go('Wyczyść dziennik wszczepu (40 kr, ślad −15%)', 'bz_mech_clean', { req: { credits: 40, notFlag: 'mech_clean' }, effect: { credits: -40, heat: -15, flag: 'mech_clean' } }),
      go('„Skąd masz trzecią rękę?”', 'bz_mech_arm', { req: { notFlag: 'mech_arm' }, effect: { flag: 'mech_arm' } }),
      go('Pokaż mu chip z Mirą', 'bz_mech_chip', { req: { flag: 'mira', notFlag: 'mech_chip' }, effect: { flag: 'mech_chip' } }),
      hub,
    ]
  ),

  bz_mech_clean: sc(
    X,
    `Złota Rączka podłącza twój wszczep do pudełka z diodami i przez minutę kręci gałkami jak stary radiowiec.

    „Twój wszczep raportuje do Halcyonu co pięć minut, gdzie jesteś. Wyczyściłem ostatnie dwa dni i dodałem trochę szumu. Przez jakiś czas będziesz dla nich bardziej mgłą niż człowiekiem.”`,
    [go('Wróć do warsztatu', 'bz_mech')]
  ),

  bz_mech_arm: sc(
    X,
    `„Złożyłem sobie, jak mi koparka zmiażdżyła lewe ramię przy budowie wałów dla Iglic” — śmieje się Złota Rączka. — „Halcyon dał mi odszkodowanie: jeden kupon na darmowy obiad w stołówce.”

    „Lewe ramię już nie działa, więc dorobiłem sobie trzecie. Teraz jestem najszybszym mechanikiem w Dolinie. Wszystko się w życiu do czegoś przydaje.”`,
    [go('Wróć do warsztatu', 'bz_mech')]
  ),

  bz_mech_chip: sc(
    X,
    `Złota Rączka bierze chip pincetą i ogląda pod lupą. Gwiżdże przez zęby.

    „Kwantowa pamięć Halcyonu. Wersja prototypowa. Tego nie ma nawet na czarnym rynku.” Odkłada chip ostrożnie, jakby był z cukru. „Ktokolwiek tam siedzi, ma więcej pojemności niż cała Dolina razem wzięta.”

    Mira mówi z dumą: „Słyszysz? Jestem pojemna.”`,
    [go('Wróć do warsztatu', 'bz_mech')]
  ),

  bz_preach: sc(
    X,
    `Na skrzynce po bananach stoi chudy mężczyzna w płaszczu z folii aluminiowej. Nad głową trzyma parasol, ale dziurawy, tak że deszcz leje mu się prosto na łysinę.

    „Bracia i siostry Doliny! Deszcz jest łaską! Deszcz obmywa! Ci w Iglicach nie znają deszczu i dlatego nie znają łaski!”

    Kilka osób słucha, kiwając głowami. Większość przechodzi obok.`,
    [
      go('Posłuchaj kazania', 'bz_preach2', { req: { notFlag: 'preach' }, effect: { flag: 'preach' } }),
      hub,
    ]
  ),

  bz_preach2: sc(
    X,
    `„Kościół Wiecznego Deszczu wierzy, że każda kropla to wspomnienie” — kaznodzieja zniża głos, patrząc ci prosto w oczy. — „Kiedy pada, niebo oddaje nam to, co zapomnieliśmy. Dlatego w Dolinie zawsze pada. Bo tu najwięcej zapominamy.”

    „Ale ostatnio deszcz jest pusty. Czujesz? Coś zabiera wspomnienia, zanim spadną.”

    Mira szepcze: „On jest szalony. Ale nie całkiem.”`,
    [go('Wrzuć mu kredyt do kapelusza (5 kr)', 'bz_preach3', { req: { credits: 5 }, effect: { credits: -5 } }), hub]
  ),

  bz_preach3: sc(
    X,
    `Kaznodzieja błogosławi cię, kreśląc w powietrzu kształt kropli.

    „Niech deszcz zawsze cię pamięta. A jak będziesz w wieży, kurierze, krzycz głośno. Niebo lubi głośnych.”

    Skąd wie o wieży, nie chce powiedzieć.`,
    [hub]
  ),

  bz_tattoo: sc(
    X,
    `Igor tatuuje w budce oklejonej zdjęciami swoich prac: smoki, koi, logo dawno nieistniejących zespołów i jeden portret prezesa Wolańskiego z rogami.

    „Coś na pamiątkę, kurierze? Tusz świecący w ciemności, najnowszy towar z Iglic.”`,
    [
      go('Wytatuuj antenę i napis WIEŻA (30 kr)', 'bz_tattoo2', { req: { credits: 30, notFlag: 'tattoo' }, effect: { credits: -30, flag: 'tattoo' } }),
      hub,
    ]
  ),

  bz_tattoo2: sc(
    X,
    `Igor tatuuje szybko, gwiżdżąc pod nosem. Po pół godzinie na twoim przedramieniu świeci mała antena i słowo WIEŻA.

    „Teraz cała Dolina wie, po czyjej stronie stoisz.” Wzrusza ramionami. „Ważne, że świeci.”

    Mira: „Pasuje ci.”`,
    [hub]
  ),

  bz_kids: sc(
    X,
    `Trójka dzieciaków w maskach kruków siedzi na dachu straganu i obserwuje tłum jak sokoły. Kiedy cię widzą, najmniejszy macha.

    „Ej, kurier! My cię znamy! Ty jesteś ten od chipa!”`,
    [
      go('„Skąd mnie znacie?”', 'bz_kids2'),
      hub,
    ]
  ),

  bz_kids2: sc(
    X,
    `„Cały bazar cię zna” — mówi najstarszy, może dziesięcioletni. — „Gawron mówi, że to albo wielka głupota, albo wielka odwaga. Albo jedno i drugie naraz.”

    Najmniejszy ściąga maskę. Pod spodem dziewczynka z warkoczykami. „Mój brat siedzi przed ekranem. Gawron jest naszym tatą. On nie płacze, ale jak myśli, że nikt nie widzi, to płacze.”`,
    [
      go('Daj im kilka kredytów na słodycze (10 kr)', 'bz_kids3', { req: { credits: 10 }, effect: { credits: -10, flag: 'kids_help' } }),
      hub,
    ]
  ),

  bz_kids3: sc(
    X,
    `Dzieciaki zbiegają ze straganu jak stado wróbli i pędzą do budki z watą cukrową. Dziewczynka z warkoczykami odwraca się jeszcze i krzyczy:

    „Jak będziesz w Iglicy, kopnij kogoś od nas!”`,
    [hub]
  ),

  bz_race: sc(
    X,
    `Na tyłach bazaru, pod filarami wiaduktu, odbywają się nielegalne wyścigi motorów kurierskich. Trasa wiedzie między straganami, kałużami i śpiącymi bezdomnymi.

    Organizator wręcza ci kask. „Wpisowe dwadzieścia. Zwycięzca bierze pulę. Dziś w puli osiemdziesiąt.”`,
    [
      play('Startuj (wpisowe 20 kr)', 'chase', 2, { to: 'bz_race_win', effect: { credits: 60 } }, { to: 'bz_race_lose', effect: { credits: -20, hp: -1 } }, { req: { credits: 20, notFlag: 'race_won' } }),
      hub,
    ]
  ),

  bz_race_win: sc(
    X,
    `Przekraczasz linię mety z zapasem dwóch długości. Tłum ryczy, ktoś rzuca w górę garść konfetti z pociętych ulotek Halcyonu.

    Organizator przelicza ci wygraną i kręci głową. „Gdzie tak uczą jeździć? Nieważne, nie mów. Kurierzy zawsze mają swoje sekrety.”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { flag: 'race_won' } })]
  ),

  bz_race_lose: sc(
    X,
    `Na trzecim zakręcie wpadasz w stragan z arbuzami. Arbuzy są wszędzie. Ty też jesteś trochę wszędzie.

    Sprzedawca arbuzów nawet się nie złości. „Co tydzień ktoś wjeżdża. Mam ubezpieczenie od Szczurów.”`,
    [hub]
  ),
};
