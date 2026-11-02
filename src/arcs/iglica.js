import { go, play, route, sc } from './_h.js';

// Iglica, poziom 210: stołówka, biuro ochrony i gabinet prezesa na szczycie
const F = 'Iglica · Stołówka';
const Q = 'Iglica · Ochrona';
const N = 'Iglica · Szczyt';
const corridor = go('Wróć na korytarz', '@map');
const EVIDENCE = ['stream_proof', 'diary', 'van_proof', 'igla_proof', 'archive', 'prezes_proof'];

export default {
  // Stołówka
  canteen: sc(
    F,
    `Stołówka pracownicza na poziomie 210 jest biała, cicha i pachnie kawą z prawdziwych ziaren. Przy stolikach siedzą ludzie w jednakowych szarych swetrach i jedzą sałatki z idealnie pokrojonych warzyw. Nikt z nikim nie rozmawia. Wszyscy patrzą w tablety.

    Za ladą stoi kucharka z czerwonymi od pary policzkami. Jedyna osoba w Iglicy, która wygląda na zmęczoną.`,
    [
      go('Podsłuchaj rozmowę przy stoliku obok', 'ic_gossip', { req: { notFlag: 'ic_gossip' }, effect: { flag: 'ic_gossip' } }),
      go('Porozmawiaj z kucharką', 'ic_ewa', { req: { notFlag: 'ic_ewa' }, effect: { flag: 'ic_ewa' } }),
      go('Zapytaj Ewę o siostrę', 'ic_ewa_sister', { req: { flag: 'ic_ewa', notFlag: 'ewa_sister' }, effect: { flag: 'ewa_sister' } }),
      go('Chłopak w swetrze przy stoliku w kącie', 'kamil', { req: { notFlag: 'kamil_keys' } }),
      go('Zakradnij się do szatni ochrony', 'ic_lockers', { req: { notFlag: 'uniform' } }),
      go('Zjedz obiad (20 kr, +1 zdrowie)', 'ic_eat', { req: { credits: 20 }, effect: { credits: -20, hp: 1 } }),
      corridor,
    ]
  ),

  ic_gossip: sc(
    F,
    `Dwoje programistów przy stoliku obok rozmawia półgłosem, nie odrywając wzroku od tabletów.

    „…mówię ci, prezes przychodzi na 210 co noc. Sam. Zjeżdża windą serwisową i siedzi w laboratorium Wren do rana.”

    „Po co?”

    „Nie wiem. Ale Kasia z infrastruktury mówi, że serwery Spokoju mają osobną partycję. Zaszyfrowaną. Podpisaną jego nazwiskiem. Wolański.”`,
    [go('Wróć do stołówki', 'canteen', { effect: { flag: 'prezes_rumor' } })]
  ),

  ic_ewa: sc(
    F,
    `Kucharka nalewa ci zupy, zanim zdążysz o nią poprosić. Patrzy na twoje buty, zabłocone, mokre, nie z Iglicy.

    „Z Doliny, co?” — szepcze. — „Ja też. Z Portu Południowego. Ewa jestem. Gotuję tu dla nich od piętnastu lat, a oni nawet nie wiedzą, jak mam na imię.”

    „Czego tu szukasz? Tylko szczerze, ja nikomu nie powiem. Nikt by mnie i tak nie słuchał.”`,
    [
      go('„Prawdy o Spokoju.”', 'ic_ewa2'),
      go('„Lepiej, żeby pani nie wiedziała.”', 'ic_ewa3'),
    ]
  ),

  ic_ewa2: sc(
    F,
    `Ewa przestaje mieszać w garnku.

    „Spokój” — powtarza. — „Moja siostra wzięła. Pół roku temu.” Ociera ręce w fartuch. „Słuchaj. Szatnia ochrony jest za drzwiami z tyłu kuchni. Kurtki wiszą na wieszakach, nikt ich nie liczy. W białej kurtce drony biorą cię za swojego.”

    „I jeszcze jedno. Za automatem z kawą jest panel windy na szczyt. Prezes jeździ nią co noc. Ja widzę wszystko, bo nikt nie widzi mnie.”`,
    [go('Podziękuj', 'canteen', { effect: { flag: ['uniform_tip', 'prezes_rumor'], trust: 1 } })]
  ),

  ic_ewa3: sc(
    F,
    `Ewa kiwa głową, jakby to była najmądrzejsza odpowiedź, jaką słyszała od lat.

    „Masz rację. Mniej wiem, lepiej śpię.” Nakłada ci podwójną porcję. „Jedz. Na pusty żołądek nic się nie zmienia.”`,
    [go('Zjedz i wróć do stołówki', 'canteen', { effect: { hp: 1 } })]
  ),

  ic_eat: sc(
    F,
    `Sałatka z idealnie pokrojonych warzyw smakuje jak nic. Ale jest świeża, prawdziwa, z ogrodów hydroponicznych na poziomie 150. Pierwszy raz od lat jesz coś, co wyrosło.

    Przy stoliku obok ktoś robi zdjęcie swojej sałatce, ale jej nie je.`,
    [go('Wróć do stołówki', 'canteen')]
  ),

  ic_lockers: sc(
    F,
    `Szatnia ochrony jest za kuchnią. Rzędy szafek, na wieszakach białe kurtki z logo Halcyonu. Przy drzwiach drzemie strażnik z słuchawkami w uszach.`,
    [
      play('Zdejmij kurtkę z wieszaka, kiedy strażnik się obraca', 'timing', 1, { to: 'ic_uniform', effect: { flag: 'uniform' } }, { to: 'ic_lockers_fail', effect: { heat: 15 } }),
      go('Wróć do stołówki', 'canteen'),
    ]
  ),

  ic_uniform: sc(
    F,
    `Biała kurtka jest trochę za duża, ale w kieszeni jest identyfikator na nazwisko „K. Marczak, ochrona, zmiana nocna”.

    Kiedy wychodzisz z szatni, dron na korytarzu przelatuje tuż nad twoją głową i… nic. Mruga na zielono i leci dalej.

    „Ładnie ci w bieli” — kpi Mira. — „Prawie jak jedno z nich.”`,
    [corridor]
  ),

  ic_lockers_fail: sc(
    F,
    `Wieszak przewraca się z hukiem. Strażnik zrywa się ze słuchawkami na szyi.

    „Hej! Kto tam?” Uciekasz przez kuchnię, przewracając po drodze wózek z sałatkami. Ewa udaje, że nic nie widziała. Ale kamera nad drzwiami widziała wszystko.`,
    [go('Wróć do stołówki', 'canteen')]
  ),

  // Biuro ochrony
  security: route({ if: { flag: 'uniform' }, to: 'ic_sec_uniform' }, { to: 'ic_sec' }),

  ic_sec: sc(
    Q,
    `Biuro ochrony to ciemny pokój z setką monitorów. Na każdym inny korytarz, inna winda, inna klatka schodowa. Przy pulpicie siedzi strażnik i ogląda na jednym z ekranów mecz.

    Jeszcze cię nie zauważył.`,
    [
      play('Zakradnij się do pulpitu i wyłącz kamery', 'hack', 3, { to: 'ic_cams_off', effect: { flag: 'cameras_off', heat: -20 } }, { to: 'ic_sec_caught', effect: { heat: 25 } }),
      go('Wycofaj się po cichu', '@map'),
    ]
  ),

  ic_sec_uniform: sc(
    Q,
    `Strażnik przy pulpicie podnosi wzrok znad meczu i widzi białą kurtkę.

    „O, Marczak! Myślałem, że masz dziś wolne. Siadaj, zastąp mnie na dziesięć minut, muszę iść za potrzebą.” Wstaje i wychodzi, zanim zdążysz odpowiedzieć.

    W pokoju zostaje setka monitorów i nikt więcej.`,
    [
      go('Wyłącz kamery na piętrze', 'ic_cams_off', { effect: { flag: 'cameras_off', heat: -20 } }),
      go('Przejrzyj akta pracowników', 'ic_files'),
    ]
  ),

  ic_cams_off: sc(
    Q,
    `Jeden po drugim monitory gasną. Korytarze, windy, klatki schodowe. Na ekranie pojawia się komunikat: „KONSERWACJA SYSTEMU. SZACOWANY CZAS: 60 MIN”.

    Część dronów na piętrze wraca do stacji dokujących. Nie mają już oczu, żeby patrzeć.`,
    [
      go('Przejrzyj akta pracowników', 'ic_files', { req: { notFlag: 'sokol_past' } }),
      go('Ktoś wchodzi do biura', 'ic_marczak', { req: { flag: 'uniform', notFlag: 'marczak_ally' } }),
      corridor,
    ]
  ),

  ic_sec_caught: sc(
    Q,
    `Strażnik odwraca się w momencie, gdy dotykasz pulpitu. Przez sekundę patrzycie na siebie, zaskoczeni.

    Potem on sięga po alarm, a ty po krzesło. Krzesło jest szybsze. Strażnik leży nieprzytomny, ale alarm zdążył się włączyć. Gdzieś daleko wyje syrena.`,
    [go('Uciekaj na korytarz', '@map')]
  ),

  ic_files: sc(
    Q,
    `Akta pracowników ochrony. Nazwiska, zdjęcia, oceny okresowe. Przewijasz szybko, aż natrafiasz na teczkę oznaczoną na czerwono.

    „SOKÓŁ. Prawdziwe nazwisko: Tomasz Lis. Ur. 2049, Dolina, Port Południowy. Były kurier. Zwerbowany w 2071 po śmierci siostry, Marty Lis, w powodzi. Wszczep oczny H-7, modyfikacja behawioralna poziom 2.”

    Mira szepcze: „Modyfikacja behawioralna. Oni mu coś zrobili z głową. Tak jak tym na Śluzie, tylko inaczej.”`,
    [go('Zapamiętaj to i wyjdź', '@map', { effect: { flag: 'sokol_past' } })]
  ),

  // Szczyt: winda serwisowa i prezes
  summit: route({ if: { flag: 'summit_key' }, to: 'ic_lift' }, { to: 'ic_lift_locked' }),

  ic_lift_locked: sc(
    N,
    `Za automatem z kawą w korytarzu jest niepozorny panel z dziurką od klucza. Mosiężną, staroświecką. Żaden haker tego nie otworzy, bo nie ma czego hakować.

    Bez klucza nic tu nie zdziałasz.`,
    [corridor]
  ),

  ic_lift: sc(
    N,
    `Klucz Edwarda pasuje. Panel odsuwa się, odsłaniając małą windę wyłożoną drewnem i mosiądzem. Zero ekranów, zero kamer. Jeden przycisk: SZCZYT.

    Winda rusza tak szybko, że zatyka ci uszy. Poziom 250. 300. 350. Przez szczelinę w drzwiach widzisz, jak przelatują piętra.

    Mira mówi cicho: „Tu nikt z Doliny nigdy nie był.”`,
    [go('Wysiądź na szczycie', 'ic_top')]
  ),

  ic_top: sc(
    N,
    `Gabinet prezesa zajmuje całe ostatnie piętro Iglicy. Szklane ściany, za nimi chmury jak ocean i wschodzące słońce. Na środku drewniane biurko, starsze niż całe miasto.

    Przy oknie stoi mężczyzna w garniturze, z siwymi włosami. Nie odwraca się.

    „Kurier z chipem” — mówi spokojnie. — „Czekałem. Edward zawsze miał słabość do ludzi z Doliny. Siadaj, proszę. Kawy?”`,
    [
      go('„Kim pan jest?”', 'ic_top2'),
      go('Usiądź bez słowa', 'ic_top2'),
    ]
  ),

  ic_top2: sc(
    N,
    `„Konstanty Wolański. Prezes, założyciel, właściciel” — odwraca się w końcu. Ma łagodne oczy i uśmiech dziadka z reklamy. — „Zbudowałem to miasto. Filtry do wody, potem leki, potem Iglice. Kiedy Dolina tonęła, to ja dałem jej czystą wodę.”

    „A teraz umieram. Rak trzustki, sześć miesięcy, może mniej.” Siada naprzeciwko ciebie. „I wiesz, co zrozumiałem? Że wszystko, co zbudowałem, zniknie razem ze mną. Chyba że ja nie zniknę.”`,
    [go('„Spokój. To o to chodzi.”', 'ic_top3')]
  ),

  ic_top3: sc(
    N,
    `„Spokój to archiwum” — Wolański mówi to z dumą. — „Wspomnienia tysięcy ludzi, zebrane, oczyszczone, złożone w jedną spójną świadomość. Mira jest prototypem. Szkicem. Ostateczna wersja będzie zbudowana na moich wspomnieniach.”

    „Będę żył wiecznie, kurierze. W serwerach Iglicy, w każdym ekranie, w każdej asystentce. A ludzie z Doliny, którzy oddali mi swoje wspomnienia, będą częścią czegoś wielkiego.”

    Mira w twoim uchu milczy. Ale chip parzy jak ogień.`,
    [
      go('„Oni nie oddali. Pan je ukradł.”', 'ic_top4'),
      go('„Ile mi pan zapłaci za chip?”', 'ic_offer'),
    ]
  ),

  ic_top4: sc(
    N,
    `Wolański uśmiecha się cierpliwie, jak do dziecka.

    „Ukradłem? Podpisali zgody. Dostali darmowy sen. Wielu z nich i tak nic by w życiu nie osiągnęło, a teraz będą nieśmiertelni, częściowo.” Rozkłada ręce. „Historia nie pamięta nazwisk z Doliny. Zapamięta moje.”

    „Masz dwie możliwości. Oddajesz mi chip i dostajesz życie, o jakim w Dolinie nikt nie śni. Albo wychodzisz stąd i zostajesz Sokołowi. Tertium non datur, jak mówili starożytni.”`,
    [
      go('Rzuć mu w twarz dowody', 'ic_blackmail', { req: { atLeast: { n: 3, flags: EVIDENCE } } }),
      go('„Ile mi pan zapłaci?”', 'ic_offer'),
      go('Odwróć się i wyjdź do windy', 'ic_leave'),
    ]
  ),

  ic_offer: sc(
    N,
    `Wolański wyciąga z szuflady tablet i przesuwa go w twoją stronę. Na ekranie liczba z tyloma zerami, że musisz liczyć dwa razy.

    „Pięćdziesiąt tysięcy. Mieszkanie na poziomie 180, z oknem na słońce. Nowa tożsamość. I praca, jeśli zechcesz. Potrzebuję ludzi, którzy potrafią przejść przez Dolinę i nie zginąć.”

    Mira mówi cicho, bardzo cicho: „Zrozumiem. Naprawdę. Nikt z Doliny nie widział tylu pieniędzy.”`,
    [
      go('Przyjmij ofertę i oddaj chip', 'ep_crown_1', { effect: { credits: 50000 } }),
      go('„Nie jestem na sprzedaż.”', 'ic_top4'),
    ]
  ),

  ic_blackmail: sc(
    N,
    `Wysyłasz na jego tablet wszystko, co masz. Nagranie z vana na Śluzie. Dziennik Hani. Dane ze wszczepu pana Józefa. Nagranie Igły z prasą i Sokołem. Listę 4312 nazwisk.

    Wolański przewija pliki. Jego uśmiech gaśnie powoli, jak słońce za chmurami.

    „Ile kopii?”

    „Wystarczająco dużo” — odpowiadasz.`,
    [go('„Teraz to ja stawiam warunki.”', 'ic_blackmail2')]
  ),

  ic_blackmail2: sc(
    N,
    `Wolański siada ciężko za biurkiem i nagle wygląda na swoje lata. Na każdy dzień z sześciu miesięcy, które mu zostały.

    „Czego chcesz?”`,
    [
      go('„Wyłącz Spokój. Oddaj ludziom wspomnienia. I zostaw Mirę w spokoju.”', 'ep_deal_1'),
      go('„Chcę twojego fotela.”', 'ep_crown_1', { effect: { flag: 'crown_taken' } }),
    ]
  ),

  ic_leave: sc(
    N,
    `Odwracasz się i idziesz do windy. Wolański nie próbuje cię zatrzymać.

    „Szkoda” — mówi za tobą. — „Sokół nie jest tak uprzejmy jak ja.”

    Drzwi windy zamykają się. Przez szczelinę widzisz, jak prezes podnosi słuchawkę telefonu.`,
    [go('Zjedź na 210', '@map', { effect: { heat: 30, flag: 'met_prezes' } })]
  ),
};
