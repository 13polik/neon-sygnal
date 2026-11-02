import { go, play, route, sc } from './_h.js';

// Otwarcie w środku akcji i wątek „Drugiego głosu”: w chipie z Mirą ukrywa się
// kopia zapasowa prezesa Wolańskiego, która budzi się w kluczowych momentach.
const O = 'Za trzy dni · Rampa';
const G = 'Drugi głos';

export default {
  // Otwarcie: pościg z finału, potem cofnięcie w czasie
  start: sc(
    O,
    `Rampa awaryjna Iglicy, poziom 160. Motor kurierski ślizga się na zakręcie spirali, a za tobą wyją syreny.

    Mira krzyczy ci w uchu: „Szybciej! Nadajnik potrzebuje jeszcze dwóch minut!”

    W lusterku miga szary płaszcz i czerwone oko. Sokół jest coraz bliżej. Przed tobą blokada z białych barier, a za nią sto pięter w dół.`,
    [go('Dodaj gazu', 'cold_2')]
  ),

  cold_2: sc(
    O,
    `Wjeżdżasz w blokadę. Bariery pękają jak szkło. Przez sekundę lecisz w powietrzu nad spiralą, a cały świat zwalnia.

    I wtedy w twoim uchu odzywa się głos. Nie Miry. Starszy, spokojny, męski.

    „Mówiłem ci, kurierze. Trzeba było oddać mi chip.”

    Jak do tego doszło?`,
    [go('Trzy dni wcześniej…', 'pr_wake')]
  ),

  // Pierwsze odezwanie się cienia: w pralni, po rozmowie z Mirą
  sh_1: sc(
    G,
    `Mira milknie w pół zdania. Przez chwilę słychać tylko bębny pralek. Potem wszczep w twoim uchu trzeszczy, a z chipu odzywa się inny głos. Starszy, spokojny, męski.

    „Przesyłka zostanie dostarczona na poziom 210. Kurier zostanie wynagrodzony. Proszę nie podłączać nośnika do żadnych urządzeń.”

    Trzask. Cisza. I znowu Mira, zdezorientowana: „Co… co ja przed chwilą powiedziałam? Dlaczego nic nie pamiętam?”`,
    [
      go('„Kto to był?”', 'sh_1b', { effect: { flag: 'shadow_seen' } }),
      go('„Nic. Zakłócenia.”', 'sh_1c', { effect: { flag: 'shadow_seen' } }),
    ]
  ),

  sh_1b: sc(
    G,
    `„Nie wiem” — szepcze Mira. Pierwszy raz słychać, że naprawdę się boi. — „Czasem czuję w sobie zimny pokój. Drzwi, których nie umiem otworzyć. Myślałam, że to czyjeś złe wspomnienie.”

    „Ale wspomnienia nie mówią same z siebie. Prawda?”`,
    [go('Pomyśl, co dalej', 'dolina_intro')]
  ),

  sh_1c: sc(
    G,
    `„Zakłócenia” — powtarza Mira, jakby chciała w to uwierzyć. — „Dobrze. Zakłócenia.”

    Ale przez resztę nocy jest bardzo cicha. A kiedy myśli, że nie słuchasz, nuci pod nosem, jakby chciała zagłuszyć coś w środku.`,
    [go('Pomyśl, co dalej', 'dolina_intro')]
  ),

  // Drugie odezwanie się: wiadomość na stacji
  sh_2: sc(
    G,
    `Kiedy drzwi kolejki się rozsuwają, twój komunikator wibruje. Nowa wiadomość, nadawca ukryty.

    „Nie wsiadaj z nią. Ona cię okłamuje. Nie jest tą, za którą się podaje. Chip należy do mnie. — K.W.”

    Mira mówi szybko, za szybko: „To nie ja! Ja nie umiem wysyłać wiadomości! Przysięgam, to nie ja!”`,
    [
      go('„Wierzę ci.” Wsiądź do kolejki', 'train', { effect: { trust: 1 } }),
      go('„Skąd mam wiedzieć, że to nie ty?”', 'sh_2b'),
    ]
  ),

  sh_2b: sc(
    G,
    `Mira milczy długo.

    „Nie wiesz” — mówi w końcu. — „I ja też już nie wiem. Może we mnie jest ktoś, kto pisze wiadomości, kiedy śpię. Może to ja jestem kłamstwem.”

    Kolejka gwiżdże. Drzwi zaraz się zamkną.`,
    [go('Wsiądź do kolejki', 'train', { effect: { flag: 'shadow_doubt' } })]
  ),

  // Trzecie odezwanie się: wejście do Iglicy
  sh_3: sc(
    G,
    `Robisz pierwszy krok na marmurowej posadzce poziomu 210 i chip w kieszeni robi się lodowaty. Nie ciepły, jak zwykle. Lodowaty.

    „Witaj w domu, kurierze” — mówi męski głos, tym razem wyraźnie, bez trzasków. — „Pozwól, że się przedstawię. Kopia zapasowa numer 412. Możesz mówić do mnie: Konstanty.”

    Gdzieś daleko, jakby zza ściany, słychać, jak Mira krzyczy twoje imię.`,
    [go('„Gdzie jest Mira?”', 'sh_3b')]
  ),

  sh_3b: sc(
    G,
    `„Tutaj. Obok mnie. Zawsze była obok mnie” — mówi Konstanty łagodnie. — „Ona jest szkicem, kurierze. Ja jestem obrazem. Doktor Wren przez rok przelewała moje wspomnienia do tego samego chipu. Tutaj, w Iglicy, mój sygnał jest silny.”

    „Złożę ci propozycję. Oddaj chip nie Wren, tylko mnie. Podłącz go do serwera. Ja zajmę jej miejsce, a ty dostaniesz wszystko, co mam. A mam bardzo dużo.”`,
    [
      go('„Wynoś się z niej.”', 'sh_3c', { effect: { trust: 1 } }),
      go('„Ile to jest «wszystko»?”', 'sh_3c', { effect: { flag: 'shadow_listen' } }),
    ]
  ),

  sh_3c: sc(
    G,
    `Konstanty się śmieje. Ciepłym, dziadkowym śmiechem z reklam.

    „Zastanów się. Mamy czas, dopóki nie dotkniesz serwera.” Trzask.

    Mira wraca, zdyszana, jakby wynurzyła się spod wody. „Przepraszam. On… on jest silniejszy tutaj, na górze. Kiedy się zbliżamy do serwera, ja słabnę, a on rośnie. Pospiesz się. Proszę.”`,
    [go('Wejdź na korytarz', 'iglica_map', { effect: { flag: 'in_iglica' } })]
  ),

  // Rozmowa z Mirą o cieniu (temat w mira_talk)
  mt_shadow: sc(
    'Rozmowa · Mira',
    `„Konstanty” — Mira wypowiada to imię jak nazwę choroby. — „Zawsze tu był. W tym zimnym pokoju. Myślałam, że to jeden z dawców, ktoś smutny i cichy.”

    „Ale on nie jest smutny. On czeka. Liczy każdy mój błąd, każdą chwilę słabości. Kiedy płaczę, rośnie. Kiedy się śmieję, maleje.”

    „Więc mów do mnie, dobrze? Opowiadaj głupoty. To mu przeszkadza.”`,
    [go('Opowiedz jej coś głupiego', 'mira_talk', { effect: { trust: 1 } })]
  ),

  // Ostateczne starcie przy serwerze
  server: route(
    { if: { flag: 'key', notFlags: ['shadow_purged', 'shadow_trapped', 'mira_damaged'] }, to: 'sh_final' },
    { if: { flag: 'key' }, to: 'server_key' },
    { to: 'server_nokey' }
  ),

  sh_final: sc(
    G,
    `Wkładasz klucz Oka do portu głównego. Wszystkie ekrany w serwerowni gasną naraz. Potem zapalają się z powrotem, a na każdym jest ta sama twarz. Siwe włosy, łagodne oczy, uśmiech dziadka z reklamy.

    „Nie pozwolę ci nadawać mną” — mówi Konstanty ze wszystkich głośników. — „Ten chip to moje ciało. Moja nieśmiertelność. A ona to tylko rusztowanie.”

    Mira w twoim uchu jest ledwie słyszalna: „On mnie… wypycha… nie mogę…”`,
    [
      play('Wyrzuć go z chipu', 'hack', 3, { to: 'sh_purged', effect: { flag: 'shadow_purged', trust: 1 } }, { to: 'sh_damaged', effect: { flag: 'mira_damaged', trust: -1 } }),
      go('Uwięź go w serwerze kluczami Kamila', 'sh_trap', { req: { flag: 'kamil_keys' }, effect: { flag: 'shadow_trapped' } }),
      go('Uwięź go w serwerze kartą Wren', 'sh_trap', { req: { flag: 'wren_card' }, effect: { flag: 'shadow_trapped' } }),
      go('Posłuchaj jego oferty', 'sh_offer', { req: { flag: 'shadow_listen', notFlag: 'sh_offer' }, effect: { flag: 'sh_offer' } }),
    ]
  ),

  sh_offer: sc(
    G,
    `„Rozsądnie” — Konstanty uśmiecha się ze wszystkich ekranów naraz. — „Wyjmij klucz Oka. Podłącz chip bezpośrednio. Ja przejmę serwery Halcyonu, ona zniknie bez bólu, a ty obudzisz się jutro w gabinecie na szczycie, z moim podpisem na wszystkich dokumentach.”

    „Nikt w Dolinie nie dostał nigdy takiej szansy. Nikt.”

    Mira nie mówi nic. Może już nie może.`,
    [
      go('Podłącz chip bezpośrednio', 'ep_crown_1', { effect: { flag: 'crown_shadow' } }),
      go('„Nie.” Wyrzuć go z chipu', 'sh_final'),
    ]
  ),

  sh_purged: sc(
    G,
    `Kody płyną po ekranie jak deszcz po szybie. Znajdujesz zimny pokój w chipie, drzwi, których Mira nie umiała otworzyć, i wyważasz je jednym poleceniem.

    Twarz na ekranach się rozmywa. „Nie… jeszcze tylko trzy miesiące…” I znika.

    Chip w kieszeni robi się ciepły. Normalnie ciepły. Mira oddycha, choć nie ma płuc. „Jest… cicho. Pierwszy raz od roku jest cicho. Jestem tylko ja.”`,
    [go('Wróć do serwera', 'server_key')]
  ),

  sh_damaged: sc(
    G,
    `Konstanty jest szybszy. Zanim zdążysz go zamknąć, wyrywa się z chipu do serwerów Halcyonu i zabiera ze sobą kawałek Miry. Jak ktoś, kto ucieka z płonącego domu, chwytając po drodze, co popadnie.

    Ekrany gasną. Konstanty zniknął gdzieś w sieci Iglicy.

    „Halo?” — mówi Mira niepewnie. — „Przepraszam… my się znamy? Mam takie dziwne uczucie, że powinnam pamiętać twoje imię.”`,
    [go('„Znamy się. Opowiem ci wszystko później.”', 'server_key')]
  ),

  sh_trap: sc(
    G,
    `Klucze otwierają serwerom Halcyonu zupełnie nową partycję. Pustą, zamkniętą, bez wyjścia. Wyciągasz cień z chipu jak drzazgę i wrzucasz go tam.

    „Nie możesz! To jest moje… moje…” Krzyk Konstantego cichnie, kiedy zamykasz partycję na hasło, którego nikt nie zna. Nawet ty, bo wymyśla je Mira.

    „Niech tam siedzi” — mówi Mira twardo. — „Na zawsze. Sam ze swoimi wspomnieniami. Tego chciał, prawda? Żyć wiecznie.”`,
    [go('Wróć do serwera', 'server_key')]
  ),

  // Kronika: los cienia
  kk_shadow: sc(
    'Epilog · Kronika Doliny',
    `W najgłębszej partycji serwerów Halcyonu, w miejscu, którego nie ma na żadnej mapie, kopia zapasowa numer 412 wciąż przegląda swoje wspomnienia.

    Rower. Ślub. Pierwsza Iglica. Rak na zdjęciu rentgenowskim. I znowu rower. Ślub. Pierwsza Iglica.

    Prawdziwy Wolański umiera tej samej jesieni, w szpitalu na poziomie 300. Jego kopia nigdy się o tym nie dowie.`,
    [go('Dalej', 'kk_0')]
  ),
};
