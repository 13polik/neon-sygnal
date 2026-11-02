import { go, play, sc } from './_h.js';

// Wyprawa łodzią Szczurów do zatopionego Portu Południowego
const P = 'Port Południowy';
const hub = go('Wróć do łodzi', 'port_hub');

export default {
  port_1: sc(
    P,
    `Mały, najchudszy ze Szczurów, wiosłuje przez zalane tunele metra. Latarka na dziobie łodzi wyłuskuje z ciemności stare reklamy na ścianach: pasta do zębów, wakacje nad morzem, nowy model telefonu sprzed czterdziestu lat.

    „Port Południowy zalało dwadzieścia lat temu” — mówi Mały. — „Halcyon obiecał wały. Zbudował je dookoła Iglic. Port został po złej stronie.”`,
    [go('Płyń dalej', 'port_2')]
  ),

  port_2: sc(
    P,
    `Łódź wypływa z tunelu prosto na otwartą wodę. Port Południowy wygląda jak miasto, które ktoś zanurzył do połowy w szarej herbacie. Z wody sterczą dachy, latarnie uliczne, wierzchołki dźwigów portowych.

    Między budynkami płyną łodzie. Na dachach suszy się pranie. Ludzie wciąż tu mieszkają, na górnych piętrach, jakby woda była tylko gorszą pogodą.`,
    [go('Rozejrzyj się', 'port_hub')]
  ),

  port_hub: sc(
    P,
    `Mały przywiązuje łódź do latarni ulicznej, z której wystaje tylko lampa.

    „Gdzie chcesz płynąć? Mam czas do zmroku. Potem nie pływamy, potem pływa tylko Halcyon.”`,
    [
      go('Do ściany pamięci przy starej kapitanacie', 'port_grave', { req: { notFlag: 'port_grave' }, effect: { flag: 'port_grave' } }),
      go('Na pływający targ', 'port_market', { req: { notFlag: 'port_market' }, effect: { flag: 'port_market' } }),
      go('Do starej latarni morskiej', 'port_lh', { req: { notFlag: 'antoni' } }),
      go('Wracaj do Doliny', 'port_back'),
    ]
  ),

  port_grave: sc(
    P,
    `Na ścianie dawnego kapitanatu, nad linią wody, ktoś wymalował setki nazwisk. Ofiary powodzi. Pod każdym nazwiskiem data i wiek. Pod niektórymi świeże kwiaty w słoikach.

    Mały gasi silnik. „Tu pływamy zawsze po cichu. Z szacunku.”`,
    [go('Czytaj nazwiska', 'port_grave2')]
  ),

  port_grave2: sc(
    P,
    `Edyta Wójcik, 34. Jan Rybak, 61. Marta Lis, 17.

    Pod nazwiskiem Marty stoją białe róże. Prawdziwe, z Iglic, bo w Dolinie nikt nie ma prawdziwych róż. Do słoika przywiązana jest karteczka.

    Mały mówi cicho: „Co miesiąc przypływa tu facet w szarym płaszczu. Ma czerwone oko. Nikt go nie zaczepia, nawet Kruki.”`,
    [go('Przeczytaj karteczkę', 'port_grave3')]
  ),

  port_grave3: sc(
    P,
    `Pismo jest staranne, wojskowe, jakby pisane pod linijkę.

    „Marta. Przepraszam, że nie zdążyłem. Obiecali, że to się więcej nie powtórzy. Dotrzymuję swojej części umowy. T.”

    Mira szepcze: „Sokół. Tomasz Lis. Jego siostra.” Długo milczy. „On wciąż myśli, że pracuje dla ludzi, którzy ratują przed powodzią.”`,
    [go('Wróć do łodzi', 'port_hub', { effect: { flag: 'sokol_past' } })]
  ),

  port_market: sc(
    P,
    `Pływający targ to kilkadziesiąt łodzi związanych linami w jedną chybotliwą wyspę. Sprzedaje się tu ryby, wodorosty, filtry do wody i części wyłowione z dna.

    Kobieta na łodzi z rybami karmi łyżką chłopaka, który siedzi przed ekranem zasilanym z akumulatora samochodowego. Uśmiecha się. Nie mruga.`,
    [go('Podpłyń do niej', 'port_market2')]
  ),

  port_market2: sc(
    P,
    `„Beata jestem. A to mój syn, Szymon” — mówi kobieta, nie przestając karmić. — „Szesnaście lat. Pół roku temu przypłynęła tu łódź Halcyonu z przychodnią na pokładzie. Rozdawali Spokój jak cukierki.”

    „Mój ojciec pracuje w Iglicy, naprawia windy. Edward ma na imię. Jak się dowiedział, przestał przyjeżdżać. Wstydzi się, że dla nich pracuje.”

    „Jak go spotkasz, powiedz mu, że nie musi się wstydzić. Niech tylko przyjedzie.”`,
    [go('„Powiem mu.”', 'port_hub', { effect: { flag: 'edward_daughter' } })]
  ),

  port_lh: sc(
    P,
    `Stara latarnia morska stoi na skraju portu, przechylona jak pijany marynarz. Jej szczyt jest ciemny od pięćdziesięciu lat.

    Na schodach siedzi starzec w żółtym sztormiaku i naprawia sieć. Obok niego łódka, pomalowana na niebiesko, z wymalowanym na burcie imieniem: IRENA.`,
    [go('Podpłyń bliżej', 'port_lh2')]
  ),

  port_lh2: sc(
    P,
    `Mira nagle krzyczy w twoim uchu, tak głośno, że aż się wzdrygasz.

    „To on! Rybak z mojego snu! Ten, co co noc wypływa szukać latarni!”

    Starzec podnosi głowę. „Antoni jestem. Rybak. Kiedyś. Teraz już tylko pływam.” Patrzy na ciebie zmrużonymi oczami. „Rok temu dałem się namówić na Spokój. Na dwa tygodnie, na próbę. Potem coś mi się w głowie poprzestawiało i wyrwałem sobie ten szajs nożem. Od tej pory pamiętam mniej.”`,
    [go('„Pamięta pan, po co wypływa w nocy?”', 'port_lh3')]
  ),

  port_lh3: sc(
    P,
    `Antoni długo patrzy na ciemny szczyt latarni.

    „Kiedyś pamiętałem. Teraz wiem tylko, że muszę. Jakby ktoś mi zabrał powód, a zostawił nawyk.”

    Mira mówi cicho: „Ja mam jego powód. Mam to wspomnienie w sobie. Jego żona, Irena, wypłynęła w noc powodzi szukać ludzi. Latarnia zgasła. Nie wróciła. On co noc płynie, żeby zapalić jej światło.”

    „Powiedz mu. Proszę. To jego, nie moje.”`,
    [
      go('Opowiedz Antoniemu, co mówi Mira', 'port_lh4'),
      go('Zostaw go w spokoju', 'port_hub'),
    ]
  ),

  port_lh4: sc(
    P,
    `Antoni słucha bez słowa. Sieć wypada mu z rąk do wody.

    Kiedy kończysz, płacze, cicho, jak płaczą starzy rybacy: tylko oczami.

    „Irena” — mówi. — „Miała na imię Irena. Halcyon zabrał mi nawet to.” Ściska ci dłoń szorstką ręką. „Jak twoja Wieża kiedyś zacznie nadawać, niech nada też to. Niech wszyscy wiedzą, po co stary Antoni pływa w nocy.”`,
    [go('Wróć do łodzi', 'port_hub', { effect: { flag: 'antoni', trust: 1 } })]
  ),

  port_back: sc(
    P,
    `Mały odwiązuje łódź i zawraca w stronę tunelu. Nad portem zbiera się burza. Fale rosną z każdą minutą, a woda w tunelu zaczyna się burzyć.

    „Trzymaj się mocno” — krzyczy Mały. — „Prowadź łódź, ja wiosłuję!”`,
    [
      play('Prowadź łódź przez wzburzoną wodę', 'chase', 1, { to: 'port_home' }, { to: 'port_wet', effect: { hp: -1 } }),
    ]
  ),

  port_home: sc(
    P,
    `Wpływacie do tunelu w ostatniej chwili, zanim fala przewróci łódź. Mały śmieje się jak szalony, mokry od stóp do głów.

    „Dobrze sterujesz! Jak ci się kiedyś znudzi kurierka, Szczury zawsze potrzebują sterników.”`,
    [go('Wysiądź przy pompowni', '@map', { effect: { flag: 'port_done' } })]
  ),

  port_wet: sc(
    P,
    `Fala uderza w łódź z boku i lądujesz w lodowatej wodzie. Mały wyciąga cię za kołnierz, klnąc na czym świat stoi.

    Do pompowni docieracie przemoczeni, posiniaczeni, ale żywi. „Następnym razem ja steruję” — mówi Mały.`,
    [go('Wysiądź przy pompowni', '@map', { effect: { flag: 'port_done' } })]
  ),
};
