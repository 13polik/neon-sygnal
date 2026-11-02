import { go, play, route, sc } from './_h.js';

// Dodatkowe sceny w Dolinie: pralnia, wieczór w prologu, spotkanie gangów,
// siostry przed finałem, Mały, gołębie Pchły, pożar baru, zlecenie do szpitala
const street = go('Wróć na ulicę', '@map');

export default {
  // Pralnia 24H, gdzie Mira odezwała się pierwszy raz
  laundry: route({ if: { notFlag: 'ln_seen' }, to: 'ln_first' }, { to: 'ln_hub' }),

  ln_first: sc(
    'Dolina · Pralnia 24H',
    `Pralnia, w której Mira odezwała się pierwszy raz. Te same bębny, ten sam szum, ta sama migająca świetlówka.

    Za ladą siedzi tym razem właścicielka, pani Basia, w różowym szlafroku i z papilotami. Czyta stary magazyn o gwiazdach z Iglic.

    „Pierwszy raz widzę kogoś, kto przychodzi tu bez prania” — mówi, nie podnosząc wzroku.`,
    [go('„Szukam spokoju.”', 'ln_hub', { effect: { flag: 'ln_seen' } })]
  ),

  ln_hub: sc(
    'Dolina · Pralnia 24H',
    `Bębny kręcą się z hukiem. Pani Basia przewraca kartkę magazynu.

    Mira odzywa się cicho: „Tu się zaczęło. Dziwne uczucie. Jakbym wróciła do miejsca, gdzie się urodziłam.”`,
    [
      go('Usiądź na podłodze, tam gdzie wtedy', 'ln_sit', { req: { notFlag: 'ln_sit' }, effect: { flag: 'ln_sit' } }),
      go('Porozmawiaj z panią Basią', 'ln_basia', { req: { notFlag: 'ln_basia' }, effect: { flag: 'ln_basia' } }),
      go('Wypierz kurtkę (5 kr, ślad −5%)', 'ln_wash', { req: { credits: 5, notFlag: 'ln_wash' }, effect: { credits: -5, heat: -5, flag: 'ln_wash' } }),
      street,
    ]
  ),

  ln_sit: sc(
    'Dolina · Pralnia 24H',
    `Siadasz na podłodze, plecami do pralki. Jest ciepła i drży lekko, jak żywe zwierzę.

    „Wiesz, co pomyślałam, kiedy pierwszy raz usłyszałam twój oddech?” — pyta Mira. — „Że ktoś tu jest bardziej zmęczony niż ja. I że może razem będzie łatwiej.”

    Bęben zatrzymuje się. W ciszy słychać tylko deszcz.`,
    [go('Posiedź jeszcze chwilę', 'ln_hub', { effect: { trust: 1 } })]
  ),

  ln_basia: sc(
    'Dolina · Pralnia 24H',
    `Pani Basia odkłada magazyn.

    „Prowadzę tę pralnię trzydzieści lat. Wiesz, co w niej widziałam? Wszystko. Ludzi, którzy przychodzili tu się ogrzać. Zakochanych, którzy przychodzili się pocałować przy suszarce. Kurierów, którzy chowali się przed dronami.”

    „W Dolinie pralnia to kościół. Wszyscy przychodzą tu brudni, a wychodzą czyści.”`,
    [go('Wróć', 'ln_hub')]
  ),

  ln_wash: sc(
    'Dolina · Pralnia 24H',
    `Kurtka kręci się w bębnie razem z kurzem, deszczem i resztkami śladów, po których Halcyon mógłby cię wywęszyć.

    Kiedy ją zakładasz z powrotem, jest ciepła i pachnie proszkiem. Pierwszy raz od dawna czujesz się jak ktoś nowy.`,
    [go('Wróć', 'ln_hub')]
  ),

  // Wieczór w prologu, przed telefonem od Bruna
  pr_evening: sc(
    'Prolog · Kurier',
    `Wieczór. Do telefonu od Bruna zostaje jeszcze trochę czasu. Dolina zapala neony jeden po drugim, jakby ktoś szedł ulicą z zapałkami.`,
    [
      go('Wejdź na dach Ula', 'pr_roof'),
      go('Zajrzyj do pani Zofii', 'pr_zofia'),
      go('Poczekaj w kapsule', 'pr_home_wait'),
    ]
  ),

  pr_roof: sc(
    'Prolog · Kurier',
    `Na dachu Ula wieje. Z jednej strony widać Dolinę, z drugiej mur chmur, nad którym świecą Iglice.

    Ktoś przed tobą zostawił tu plastikowe krzesło i pustą puszkę po piwie. Siadasz. Przez dziurę w chmurach widać jedną gwiazdę. Albo satelitę. W Dolinie nikt nie wie, co jest czym.`,
    [go('Wróć do kapsuły', 'pr_home_wait')]
  ),

  pr_zofia: sc(
    'Prolog · Kurier',
    `Pani Zofia z kapsuły 4012 otwiera w szlafroku w różowe flamingi. Na jej ręku śpi rudy kot z jednym uchem.

    „A, kurier! Wejdź na herbatę. Pimpek cię lubi, a Pimpek nikogo nie lubi.”

    Pijecie herbatę z wiśniowymi konfiturami. Pani Zofia opowiada o zięciu w Iglicy, który przysyła wiśnie, ale nigdy nie przyjeżdża.`,
    [go('Wróć do kapsuły', 'pr_home_wait')]
  ),

  pr_home_wait: sc(
    'Prolog · Kurier',
    `Leżysz na materacu i patrzysz w sufit, na którym skrapla się para. Komunikator leży obok.

    Mruga.`,
    [go('Odczytaj wiadomość', 'bruno_call')]
  ),

  // Spotkanie Kreta i Gawrona
  kr_meeting: sc(
    'Dolina · Zalane metro',
    `Na peronie zalanego metra stoją naprzeciwko siebie dwa gangi. Szczury z jednej strony, Kruki z drugiej. Pośrodku, przy płonącej beczce, Kret i Gawron.

    Długo patrzą na siebie bez słowa. W końcu Gawron mówi: „Pamiętasz panią Wierzbicką? Z podstawówki?”

    Kret parska. „Rozsadzała nas za karę. Trzy razy w tygodniu.”`,
    [go('Patrz dalej', 'kr_meeting2')]
  ),

  kr_meeting2: sc(
    'Dolina · Zalane metro',
    `„Siedziałeś koło mnie przez cztery lata” — mówi Gawron. — „A potem dwadzieścia lat się biliśmy o tunele.”

    „Bo tunele są nasze” — mruczy Kret.

    „Tunele są Doliny” — odpowiada Gawron. — „Tak samo jak twój brat i mój syn.” Wyciąga rękę. Kret patrzy na nią długo, potem ją ściska.

    Ktoś z tyłu zaczyna klaskać. Potem obie strony naraz.`,
    [go('Wróć do rozmowy z Kretem', 'kr_hub', { effect: { flag: 'kr_meeting' } })]
  ),

  // Siostry przed finałem
  ok_halina: sc(
    'Dolina · Wieża Radiowa',
    `Oko trzyma zdjęcie dwóch dziewczyn na wieży i długo na nie patrzy.

    „Babcia czeka” — mówisz.

    Oko odkłada lutownicę. Po raz pierwszy od roku schodzi z Wieży w ciągu dnia. Idziecie razem przez Dolinę na Śluzę, a ona nie mówi ani słowa.`,
    [go('Idź z nią na Śluzę', 'ok_halina2')]
  ),

  ok_halina2: sc(
    'Dolina · Szósta Śluza',
    `Pani Halina otwiera drzwi i zastyga. Ola stoi na progu, z blizną wokół wszczepu, z mokrymi włosami, z czterdziestoma rzeczami do powiedzenia i żadnym słowem.

    „Olka” — mówi pani Halina. Tylko tyle.

    Ola wchodzi do środka. Drzwi się zamykają. Ty zostajesz na klatce schodowej, a Mira w twoim uchu płacze, bezgłośnie, jak płaczą sygnały radiowe.`,
    [go('Poczekaj na klatce', 'ok_halina3')]
  ),

  ok_halina3: sc(
    'Dolina · Szósta Śluza',
    `Po godzinie Ola wychodzi z czerwonymi oczami i kubkiem rosołu w dłoniach.

    „Jedna marchewka, dwie cebule i dobre chęci” — mówi z pełnymi ustami. — „Smakuje dokładnie tak samo.”

    Potem patrzy na ciebie poważnie. „Dzięki, kurierze. Teraz mam po co wracać z Iglicy.”`,
    [go('Wróć na ulicę', '@map', { effect: { flag: 'sisters_home', trust: 1 } })]
  ),

  // Mały, przewoźnik Szczurów
  kr_maly: sc(
    'Dolina · Zalane metro',
    `Mały siedzi na krawędzi peronu i macza nogi w wodzie. Ma piętnaście lat i ręce jak stary rybak.

    „Wiosłuję od dziesięciu lat” — mówi. — „Kret wyłowił mnie z wody w Porcie, jak miałem pięć. Rodzice nie wypłynęli.”

    „Szczury to nie gang, kurierze. To łódź ratunkowa, która nie umie przestać pływać.”`,
    [go('Wróć do rozmowy z Kretem', 'kr_hub')]
  ),

  // Gołębie Pchły
  pc_birds: sc(
    'Dolina · Gołębnik',
    `Pchła pokazuje ci swoje gołębie. Prawdziwe mają imiona po dzielnicach: Śluza, Port, Wiadukt. Mechaniczne po ludziach, których zna: Kuba, Bruno, Igła.

    „Bruno jest gruby i wolny, ale zawsze wraca. Igła jest najszybsza i dziobie, jak się ją źle trzyma.”

    „Chcesz, żebym kiedyś zrobił gołębia o twoim imieniu?”`,
    [
      go('„Jasne.”', 'pc_hub_main', { effect: { flag: 'pigeon_named' } }),
      go('„Może kiedyś.”', 'pc_hub_main'),
    ]
  ),

  // Pożar baru Bruna
  br_fire: sc(
    'Dolina · Bar Pod Pompą',
    `Bruno pokazuje ci ślady sadzy na suficie, których nie zamalował.

    „Trzy lata temu. Zwarcie, mówili. Ale wiesz, co jest śmieszne? Tydzień przed pożarem przyszedł facet z Halcyonu i pytał, czy nie chcę sprzedać lokalu. Odmówiłem.”

    „Potem pożar. Potem pożyczka od Halcyonu. Potem dług. Potem chip.” Wzrusza ramionami. „W Dolinie wszystko jest przypadkiem, aż przestaje być.”`,
    [go('Wróć do rozmowy', 'br_hub')]
  ),

  // Zlecenie: szpital na Śluzie
  job_clinic: sc(
    'Dolina · Zlecenie',
    `Zlecenie bez nadawcy: „Przewieźć dokumenty z przychodni Halcyonu na Śluzie do kancelarii prawnej w Porcie. Pilne. 70 kr.”

    W przychodni recepcjonistka podaje ci teczkę i odwraca wzrok. Na teczce pieczątka: „ZGODY DAWCÓW. ORYGINAŁY.”`,
    [
      go('Dowieź teczkę do kancelarii', 'job_clinic_deliver', { effect: { credits: 70 } }),
      go('Zajrzyj do teczki', 'job_clinic_open'),
    ]
  ),

  job_clinic_open: sc(
    'Dolina · Zlecenie',
    `W teczce są oryginały zgód na Spokój. Na każdej podpis i odcisk palca. Na wielu podpis wygląda inaczej niż na dowodzie osobistym obok. Jakby ktoś podpisywał za dawców.

    Mira mówi powoli: „Te zgody są podrobione. Część ludzi w ogóle nie podpisała. Halcyon wysyła oryginały do prawników, żeby je… zniszczyć?”`,
    [
      go('Zanieś teczkę Igle zamiast do kancelarii', 'job_clinic_igla', { effect: { flag: ['consent_proof', 'igla_proof'] } }),
      go('Dowieź mimo wszystko', 'job_clinic_deliver', { effect: { credits: 70 } }),
    ]
  ),

  job_clinic_igla: sc(
    'Dolina · Klinika Igła',
    `Igła przegląda zgody w milczeniu. Przy dwudziestej odkłada lupę.

    „To wystarczy, żeby zamknąć Halcyon na dziesięć lat. Albo żeby ktoś zniknął w kanale. Zależy, kto pierwszy się dowie.”

    Chowa teczkę do sejfu za lodówką z organami. „U mnie przetrwa. A jak twoja Wieża zacznie nadawać, przeczytam te nazwiska na głos.”`,
    [go('Wróć na ulicę', '@map', { effect: { trust: 1 } })]
  ),

  job_clinic_deliver: sc(
    'Dolina · Zlecenie',
    `Kancelaria w Porcie mieści się na trzecim piętrze zatopionego biurowca. Prawnik w nienagannym garniturze odbiera teczkę przez okno, z łodzi.

    Płaci gotówką i od razu wrzuca teczkę do niszczarki stojącej na biurku. Dźwięk mielenia papieru słychać jeszcze na wodzie.`,
    [go('Wróć do kapsuły', 'ul_hub')]
  ),
};
