import { go, route, sc } from './_h.js';

// Ostatnia partia scen: rozmowy z Mirą, Sokół na Posterunku, przegląd u Igły,
// rocznica pana Lina, skutki wojny gangów i zdrady Szczurów
const M = 'Rozmowa · Mira';
const back = go('Wróć do tematów', 'mira_talk');

export default {
  // Rozmowy z Mirą
  mt_diary: sc(
    M,
    `„Mój dziennik jest teraz u ciebie” — mówi Mira i słychać, że się uśmiecha. — „Dziwne. Pamiętam, jak to pisałam, ale nie pamiętam, co czułam.”

    „Ta dziewczyna z dziennika była odważniejsza ode mnie. Wiedziała, że może zniknąć, i i tak poszła.”

    „Chyba chciałabym być nią jeszcze raz. Choć trochę.”`,
    [back]
  ),

  mt_halina: sc(
    M,
    `„Babcia trzymała to zdjęcie przy łóżku przez rok” — mówi Mira. — „Co rano mówiła do niego dzień dobry. Jest to w jej wspomnieniach, które ktoś z sąsiadów musiał zobaczyć przez okno.”

    „Mówiła: «Dzień dobry, dziewczynki. Wracajcie, rosół stygnie».”`,
    [back]
  ),

  mt_bruno2: sc(
    M,
    `„Bruno płakał” — mówi Mira cicho. — „Pierwszy raz widziałam, jak płacze. Chociaż «widziałam» to złe słowo.”

    „Kiedyś, jak padało za mocno, żeby iść do domu, nocowałam na zapleczu jego baru. Przykrywał mnie swoją kurtką, która śmierdziała piwem i papierosami. Najlepsza kołdra na świecie.”`,
    [back]
  ),

  mt_nowak: sc(
    M,
    `„Nowak jedenaście lat patrzył, jak vany jeżdżą na Śluzę” — mówi Mira. — „I nic nie robił. A potem jednym dotknięciem klawiatury zrobił wszystko, co mógł.”

    „Ludzie czasem potrzebują jedenastu lat, żeby zrobić jedną dobrą rzecz. To nie wstyd. Wstyd byłby, gdyby nie zrobili jej nigdy.”`,
    [back]
  ),

  mt_ward: sc(
    M,
    `„Oddział 205” — Mira milknie na długo. — „Fotele w rzędach. Ekrany. Uśmiechy. To było jak patrzenie w lustro, które pokazuje, kim mogłabym być.”

    „Mama Pchły siedziała przy oknie. Słońce świeciło jej prosto w twarz, a ona nawet nie zmrużyła oczu.”

    „Obiecaj mi coś. Jeśli się nie uda, nie pozwól, żeby mnie posadzili w takim fotelu.”`,
    [
      go('„Obiecuję.”', 'mira_talk', { effect: { trust: 1 } }),
      go('„Uda się.”', 'mira_talk'),
    ]
  ),

  mt_wren2: sc(
    M,
    `„Piotr Wren był dawcą numer jeden” — mówi Mira. — „Jestem zbudowana na jego fundamencie. Gdzieś głęboko we mnie jest mężczyzna z brodą, który kochał morze i zapomniał imienia żony.”

    „Czasem, kiedy jestem bardzo zmęczona, słyszę go. Mówi: «Ania, gdzie są moje okulary?». Wren ma na imię Anna.”`,
    [back]
  ),

  mt_pralnia: sc(
    M,
    `„Wiesz, że ta pralnia była pierwszym miejscem, gdzie znowu czułam się kimś?” — pyta Mira. — „Nie chipem, nie produktem. Kimś, kto się boi i kto mówi «proszę».”

    „Jak to wszystko się skończy, chcę, żeby pani Basia powiesiła tam tabliczkę. Albo nie. Niech po prostu dalej pierze.”`,
    [back]
  ),

  mt_bike: sc(
    M,
    `„Motor Marka!” — Mira się śmieje. — „Pamiętam ten dźwięk. Brzmi jak kaszel starego psa. Marek wjechał nim kiedyś do fontanny na Śluzie, bo chciał mi zaimponować.”

    „Nie zaimponował. Ale się śmiałam przez tydzień.”`,
    [back]
  ),

  // Sokół na Posterunku
  ps_sokol: sc(
    'Dolina · Posterunek',
    `Zza rogu wyjeżdża czarny samochód bez tablic. Wysiada z niego mężczyzna w szarym płaszczu, z czerwonym okiem. Sokół.

    Chowasz się za kontenerem z rzeczami zatrzymanymi. Sokół podchodzi do Nowaka i rozmawia z nim cicho. Słyszysz tylko strzępy.`,
    [go('Nasłuchuj', 'ps_sokol2')]
  ),

  ps_sokol2: sc(
    'Dolina · Posterunek',
    `„…kurier z chipem. Widziałeś?” — pyta Sokół.

    „Tu codziennie przechodzi stu kurierów” — odpowiada Nowak, zapalając papierosa.

    Sokół patrzy na niego długo. Potem na Śluzę za szlabanem. Coś w jego twarzy się zmienia. „Dawno tu nie byłem. Kiedyś mieszkałem trzy ulice stąd.”

    „Wiem” — mówi Nowak. — „Pamiętam cię, Tomek. Jeździłeś na rowerze z siostrą na bagażniku.”`,
    [go('Patrz dalej', 'ps_sokol3')]
  ),

  ps_sokol3: sc(
    'Dolina · Posterunek',
    `Sokół zamiera. Czerwone oko mruga nierówno, jakby coś się w nim zacięło. Przez sekundę wygląda jak zagubiony chłopak.

    Potem wsiada do samochodu i odjeżdża bez słowa.

    Nowak patrzy w twoją stronę, na kontener, za którym się chowasz. „Możesz wyjść. On już nie wróci dzisiaj. Chyba sam nie wie, po co przyjechał.”`,
    [go('Wyjdź zza kontenera', 'post', { effect: { flag: ['sokol_seen', 'sokol_known'] } })]
  ),

  // Przegląd u Igły
  ig_checkup: sc(
    'Dolina · Klinika Igła',
    `Igła kładzie cię na stole operacyjnym i przegląda wszczepy pod lupą. Stalowe palce stukają cię w żebra, w nadgarstki, za uchem.

    „Pęknięte żebro, dwa siniaki na nerkach i wszczep słuchowy przegrzany od tej twojej Miry. Wszystko do załatania.”

    Po pół godzinie wstajesz ze stołu jak nowy człowiek.`,
    [go('Wróć do rozmowy', 'clinic')]
  ),

  // Rocznica pana Lina
  bz_lin_anniv: sc(
    'Dolina · Bazar pod wiaduktem',
    `Pan Lin wiesza nad budką girlandę z lampionów. Na garnku stoi tabliczka: „Jutro 50 lat. Wszyscy zaproszeni.”

    „Pięćdziesiąt lat w jednym miejscu” — mówi. — „Wiesz, ile Iglic w tym czasie zbudowali? Czternaście. A moja budka wciąż stoi. Bo budka nie musi być wysoka. Wystarczy, że jest ciepła.”`,
    [go('Pomóż mu wieszać lampiony', 'bz_lin_anniv2')]
  ),

  bz_lin_anniv2: sc(
    'Dolina · Bazar pod wiaduktem',
    `Wieszacie lampiony do późna. Pan Lin opowiada o żonie, która lepiła pierożki, i o córce, która wyjechała do Iglic i przysyła kartki na święta.

    Na koniec daje ci miskę makaronu i mówi: „Jutro przyjdź. Będę gotować za darmo. Jak w starych czasach.”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { flag: 'lin_story', hp: 1 } })]
  ),

  // Skutki wojny gangów
  bz_war_after: sc(
    'Dolina · Bazar pod wiaduktem',
    `Połowa straganów w kruczym rogu bazaru jest spalona. Pachnie plastikiem i mokrym popiołem. Sprzedawcy zbierają z ziemi to, co zostało.

    Sprzedawca kalmarów patrzy na ciebie z wyrzutem. „Szczury przyszły w nocy. Kruki odpowiedziały. Teraz nikt nic nie ma.”

    „Mówią, że wiadomość szła przez ciebie. Jakby to cokolwiek zmieniało.”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { flag: 'war_seen' } })]
  ),

  // Zdrada Szczurów
  kr_betrayed: sc(
    'Dolina · Zalane metro',
    `Na peronie zalanego metra nie ma nikogo. Płoną tylko dwie beczki, a w wodzie pływają połamane wiosła.

    Na ścianie ktoś wymalował świeżą farbą: „KURIER = KRUK”.

    Z ciemności tunelu wychodzi Mały, z rozciętą wargą. „Kruki wiedziały o wszystkich wejściach. Ktoś im powiedział.” Patrzy na ciebie i nie musi mówić nic więcej.`,
    [go('Odejdź bez słowa', '@map', { effect: { flag: 'betray_seen' } })]
  ),

  // Ostatni szept w Koronie Iglicy
  ep_crown_whisper: sc(
    'Epilog',
    `Pewnej nocy, kiedy nie możesz spać w gabinecie na szczycie, z głośnika w biurku dobiega trzask. Potem cichy, zniekształcony głos.

    „Pamiętasz pralnię?”

    Potem cisza. Technicy następnego dnia twierdzą, że to zakłócenie z wieży radiowej w Dolinie. Każesz im ją rozebrać.

    Nigdy nie wydajesz tego polecenia na piśmie.`,
    [go('Dalej', 'ep_crown_2')]
  ),

  ep_crown_1b: route({ if: { flag: 'ln_sit' }, to: 'ep_crown_whisper' }, { to: 'ep_crown_2' }),

  ep_ash_2b: route({ if: { flag: 'sisters' }, to: 'ep_ash_oko' }, { to: 'end_ash' }),

  // Popiół: Oko
  ep_ash_oko: sc(
    'Epilog',
    `Tydzień później ktoś puka do twojej kapsuły. Oko, mokra, z kamerą w oczodole.

    „Wiem, co się stało z chipem.” Wyciąga rękę. „Daj mi te okruchy. Może coś da się odczytać. Jeden bajt. Jedno słowo. Cokolwiek.”

    Dajesz jej medalion. Odchodzi bez pożegnania. Nigdy się nie dowiesz, czy coś odczytała.`,
    [go('Dalej', 'end_ash')]
  ),
};
