import { go, play, route, sc } from './_h.js';

// Iglica: rozmowy z Wren, nocna wizyta prezesa i oddział Spokoju Premium
const L = 'Iglica · Laboratorium';
const A = 'Iglica · Oddział 205';
const lobby = go('Wróć do rozmowy z Wren', 'lobby');

export default {
  wren_husband: sc(
    L,
    `Na biurku Wren stoi zdjęcie w srebrnej ramce. Mężczyzna z brodą, uśmiechnięty, na tle morza.

    Wren zauważa, że patrzysz. Przez sekundę jej twarz przestaje być maską.

    „Mój mąż, Piotr. Zmarł pięć lat temu. Alzheimer. Na końcu nie pamiętał nawet mojego imienia.” Odwraca zdjęcie. „Spokój miał być lekarstwem. Archiwum pamięci. Żeby nikt już nie musiał zapominać tych, których kocha.”`,
    [
      go('„A potem prezes zrobił z tego coś innego.”', 'wren_husband2'),
      lobby,
    ]
  ),

  wren_husband2: sc(
    L,
    `Wren długo nie odpowiada. Kiedy w końcu mówi, jej głos jest cichszy.

    „Wolański dał mi pieniądze, laboratorium, ludzi. Powiedział: buduj. Nie pytałam, skąd biorą dawców. Nie chciałam wiedzieć.”

    „Wiesz, co jest najgorsze? Że ja naprawdę wierzyłam, że robię coś dobrego. Pięć lat. Codziennie.”`,
    [go('Wróć do rozmowy', 'lobby', { effect: { flag: 'wren_soft' } })]
  ),

  wren_soft_card: sc(
    L,
    `Wren patrzy na chip w twojej dłoni. Potem na swoje dłonie.

    „Nie potrzebujesz listy nazwisk, żebym zrozumiała” — mówi. — „Wystarczyło, że ktoś zapytał o Piotra.”

    Odpina kartę dostępu i kładzie ją na stole. „Serwerownia. Port otworzy się bez alarmu. A teraz idź, zanim zmienię zdanie. Albo zanim wróci prezes.”`,
    [go('Weź kartę', '@map', { effect: { flag: 'wren_card', trust: 1 } })]
  ),

  lab_night: sc(
    L,
    `Chowasz się za szafą z odczynnikami i czekasz. O trzeciej w nocy drzwi windy serwisowej rozsuwają się bezszelestnie.

    Wolański wchodzi sam, w szlafroku, z kubkiem herbaty. Siada przy terminalu i wkłada sobie elektrody na skronie. Na ekranie przewijają się jego wspomnienia: chłopiec na rowerze, ślub, pierwsza Iglica, rak na zdjęciu rentgenowskim.

    „Kopia zapasowa numer 412” — mówi syntetyczny głos. — „Zgodność z prototypem Mira: 61 procent.”`,
    [go('Zostań w ukryciu i patrz', 'lab_night2')]
  ),

  lab_night2: sc(
    L,
    `Wolański wpatruje się w ekran. Potem mówi do pustego laboratorium, jakby ktoś słuchał.

    „Jeszcze trzy miesiące. Jeszcze cztery tysiące dawców z Portu i Doliny. I będę mógł zamieszkać w niej na stałe.”

    Mira w twoim uchu wydaje dźwięk, którego nikt nie powinien wydawać. Jak krzyk przez zaciśnięte zęby.

    Nagrywasz wszystko.`,
    [go('Wymknij się, kiedy prezes odjedzie', '@map', { effect: { flag: ['prezes_proof', 'met_prezes'] } })]
  ),

  ward: route({ if: { flag: 'pchla_mom_hint' }, to: 'ward_1' }, { to: 'ward_locked' }),

  ward_locked: sc(
    A,
    `Za drzwiami z napisem „ODDZIAŁ REGENERACJI PREMIUM. WSTĘP TYLKO DLA PERSONELU” słychać ciche brzęczenie dziesiątek ekranów.

    Nie wiesz, czego tam szukać. Może później.`,
    [go('Wróć na korytarz', '@map')]
  ),

  ward_1: sc(
    A,
    `Oddział Regeneracji Premium to długa biała sala. W równych rzędach stoją fotele, a w fotelach siedzą ludzie w szarych swetrach pracowników Halcyonu. Przed każdym ekran. Każdy się uśmiecha.

    Sprzątaczki, ochroniarze, programiści, kucharze. Pracownicy, którzy brali Spokój Premium w abonamencie i „przeszli na regenerację”.

    Na tabliczkach przy fotelach nazwiska. Szukasz jednego.`,
    [play('Przeszukaj rejestr oddziału', 'hack', 2, { to: 'ward_found' }, { to: 'ward_alarm', effect: { heat: 20 } })]
  ),

  ward_found: sc(
    A,
    `Fotel 118. Kobieta w szarym swetrze, z dłońmi spękanymi od detergentów. Na tabliczce: „Jadwiga Pchalska, personel sprzątający, poziom 205. Na regeneracji od 3 lat”.

    Pchalska. Pchła.

    Kobieta patrzy w ekran i się uśmiecha. Za oknem obok jej fotela wschodzi słońce. Ten sam widok, o którym mówiła synowi.`,
    [go('Zrób jej zdjęcie dla Pchły', 'ward_photo')]
  ),

  ward_photo: sc(
    A,
    `Robisz zdjęcie. Kobieta w fotelu, słońce za oknem.

    Mira mówi łamiącym się głosem: „Ona żyje. Mama Pchły żyje. Jeśli Wieża zadziała, jeśli sygnał odda wspomnienia… może ona też…”

    Nie kończy. Nie musi.`,
    [go('Wróć na korytarz', '@map', { effect: { flag: 'pchla_mom', trust: 1 } })]
  ),

  ward_alarm: sc(
    A,
    `Rejestr oddziału ma zabezpieczenie, którego się nie spodziewasz. Ekrany przed fotelami na sekundę gasną, a uśmiechnięci ludzie jednocześnie odwracają głowy w twoją stronę.

    To najstraszniejszy widok w całej Iglicy. Uciekasz, zanim ochrona dobiegnie.`,
    [go('Uciekaj na korytarz', '@map')]
  ),
};
