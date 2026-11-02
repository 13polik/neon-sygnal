import { go, sc } from './_h.js';

// Iglica: więcej teczek w archiwum, asystent Wren, druga rozmowa z Ewą i strażnik Marczak
const H = 'Iglica · Archiwum';
const F = 'Iglica · Stołówka';
const Q = 'Iglica · Ochrona';
const corridor = go('Wróć na korytarz', '@map');
const files = go('Przejrzyj inne teczki', 'arch_more');

export default {
  arch_more: sc(
    H,
    `Szafy ciągną się w głąb sali, w półmroku. Na każdej szufladzie inna dzielnica: Śluza, Port Południowy, Wiadukt, Kanałowa. Na samym końcu szuflada bez etykiety, zamknięta na zwykły kluczyk, który ktoś zostawił w zamku.`,
    [
      go('Szuflada „Pracownicy Halcyonu”', 'arch_staff', { req: { notFlag: 'arch_staff' }, effect: { flag: 'arch_staff' } }),
      go('Szuflada „Port Południowy”', 'arch_port', { req: { notFlag: 'arch_port' }, effect: { flag: 'arch_port' } }),
      go('Szuflada bez etykiety', 'arch_wren', { req: { notFlag: 'arch_wren' }, effect: { flag: 'arch_wren' } }),
      corridor,
    ]
  ),

  arch_staff: sc(
    H,
    `Teczki pracowników, którzy „przeszli na regenerację”. Sprzątaczki, kucharze, ochroniarze. Przy każdej pieczątka: SPOKÓJ PREMIUM, ODDZIAŁ 205.

    Jedna z teczek: „Jadwiga Pchalska, personel sprzątający, poziom 205. Syn: Mateusz, 9 lat, Dolina. Rodzinę poinformowano o wypadku przy windzie.”

    Mateusz. Pchła ma na imię Mateusz.`,
    [go('Zapamiętaj to', 'arch_more', { effect: { flag: 'pchla_mom_hint' } })]
  ),

  arch_port: sc(
    H,
    `Teczki z Portu Południowego. Setki nazwisk, przy każdym data wizyty łodzi Halcyonu z przychodnią.

    Szymon, 16 lat, syn Beaty, wnuk Edwarda, konserwatora wind. Antoni, 79 lat, rybak: „DAWCA WYCOFANY. WSZCZEP USUNIĘTY SAMODZIELNIE. NIEBEZPIECZNY PRECEDENS.”

    I teczka z czerwonym paskiem: „Tomasz Lis. Kandydat do programu modyfikacji behawioralnej. Motywacja: śmierć siostry w powodzi. Podatność: wysoka.”`,
    [go('Wróć do szaf', 'arch_more', { effect: { flag: 'sokol_past' } })]
  ),

  arch_wren: sc(
    H,
    `W szufladzie bez etykiety leży jedna teczka. Na okładce: „Piotr Wren. Dawca nr 1. Zgoda: podpisana przez żonę.”

    W środku protokół. Piotr Wren, chory na alzheimera, pierwszy człowiek, którego wspomnienia przeniesiono do prototypu Spokoju. Pod spodem notatka odręczna: „Nie udało się. Za mało danych. Potrzeba tysięcy dawców. K.W.”

    Wren zaczęła od męża. Wolański zrobił z tego przemysł.`,
    [go('Zabierz teczkę', 'arch_more', { effect: { flag: ['wren_secret', 'wren_soft'] } })]
  ),

  kamil: sc(
    F,
    `Przy stoliku w kącie stołówki siedzi chłopak w za dużym swetrze i je sałatkę, nie patrząc na nią. Na identyfikatorze: „Kamil, asystent laboratorium 210”.

    Kiedy przechodzisz obok, łapie cię za rękaw. „Ty nie jesteś stąd. Masz błoto na butach.” Rozgląda się. „Usiądź. Proszę.”`,
    [go('Usiądź', 'kamil2')]
  ),

  kamil2: sc(
    F,
    `„Pracuję z doktor Wren od dwóch lat” — szepcze Kamil. — „Wiem, co robimy. Wiem od pierwszego dnia. Kalibruję sygnał z vanów na Śluzie. Codziennie o trzeciej w nocy.”

    „Mama mówi, że mam dobrą pracę. Że wyrwałem się z Doliny.” Przełyka ślinę. „Mama mieszka na Kanałowej. Za dwa tygodnie van ma jechać na Kanałową.”`,
    [go('„Pomóż mi to zatrzymać.”', 'kamil3')]
  ),

  kamil3: sc(
    F,
    `Kamil długo patrzy na sałatkę. Potem wyjmuje z kieszeni pendrive w kształcie kaczki.

    „Harmonogram wszystkich vanów na najbliższy miesiąc. I klucze kalibracyjne. Z tym Oko na Wieży może zagłuszyć zbieranie na całej Dolinie, zanim jeszcze nadacie sygnał.”

    „Nie mów nikomu, skąd to masz. A jeśli wszystko się uda… powiedz mamie, że jej syn nie jest taki jak oni.”`,
    [go('Weź pendrive', 'kamil4', { effect: { flag: ['kamil_keys', 'van_proof'] } })]
  ),

  kamil4: sc(
    F,
    `Kamil wstaje, zostawia nietkniętą sałatkę i wychodzi ze stołówki, nie oglądając się.

    Mira mówi cicho: „Takich ludzi tu jest więcej, niż myślisz. Siedzą przy stolikach i boją się. Każdy myśli, że jest jedyny.”`,
    [go('Wróć do stołówki', 'canteen')]
  ),

  ic_ewa_sister: sc(
    F,
    `Ewa wyciera ladę i mówi, nie podnosząc wzroku.

    „Moja siostra, Grażyna, wzięła Spokój pół roku temu. W Porcie, z łodzi. Teraz siedzi u mnie w pokoju i patrzy w ekran. Ja wychodzę do pracy o piątej rano i wracam o dziesiątej wieczorem. Karmię ją, myję, kładę spać. I idę gotować ludziom, którzy to zrobili.”

    Nakłada ci zupy, choć nie prosisz. „Jedz. Ty przynajmniej wyglądasz, jakby coś z tego miało być.”`,
    [go('Wróć do stołówki', 'canteen', { effect: { hp: 1 } })]
  ),

  ic_marczak: sc(
    Q,
    `Do biura ochrony wchodzi wysoki mężczyzna w białej kurtce. Na identyfikatorze: „K. Marczak, ochrona, zmiana nocna”. Prawdziwy Marczak.

    Patrzy na twoją kurtkę. Na swój identyfikator w twojej kieszeni. Na ciebie.

    „Ładnie w niej wyglądasz” — mówi powoli. — „Lepiej niż ja.”`,
    [
      go('„Mogę wyjaśnić.”', 'ic_marczak2'),
      go('Uciekaj', '@map', { effect: { heat: 20 } }),
    ]
  ),

  ic_marczak2: sc(
    Q,
    `Marczak siada ciężko na krześle przy monitorach.

    „Nie musisz. Wiem, kim jesteś. Cała ochrona wie. Sokół szuka cię od trzech dni.” Przeciera twarz. „Moja żona wzięła Spokój Premium w zeszłym roku. Leży na 205.”

    „Idź. Nie widziałem cię. A kurtkę zatrzymaj. Ja i tak już nie chcę jej nosić.”`,
    [go('Wróć na korytarz', '@map', { effect: { flag: 'marczak_ally', heat: -10 } })]
  ),
};
