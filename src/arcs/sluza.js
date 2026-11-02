import { go, play, route, sc } from './_h.js';

// Szósta Śluza: pani Halina, pokój Hani, sąsiedzi przed ekranami
const S = 'Dolina · Szósta Śluza';
const hub = go('Wróć do pani Haliny', 'sl_hub');
const street = go('Wróć na ulicę', '@map');

export default {
  sluza: route({ if: { notFlag: 'truth' }, to: 'sluza_first' }, { to: 'sl_hub' }),

  sl_hub: sc(
    S,
    `Pani Halina otwiera drzwi, zanim zdążysz zapukać. Chyba widzi cię przez okno, kiedy idziesz przez podwórze.

    „Wejdź, wejdź, bo zmokniesz” — mówi i stawia czajnik na kuchence. W mieszkaniu pachnie miętą i starym papierem. Na ścianie wisi kalendarz z zeszłego roku, zatrzymany na marcu.`,
    [
      go('„Proszę mi opowiedzieć o Hani.”', 'sl_hania', { req: { notFlag: 'sl_hania' }, effect: { flag: 'sl_hania' } }),
      go('„Mogę zobaczyć pokój Hani?”', 'sl_room', { req: { flag: 'sl_hania', notFlag: 'diary' } }),
      go('Zapytaj o sąsiadów przed ekranami', 'sl_neighbors'),
      go('„Jak się pani czuje?”', 'sl_meds', { req: { notFlags: ['quest_meds', 'halina_meds_done'] } }),
      go('Daj pani Halinie leki od Igły', 'sl_meds_done', { req: { flag: 'meds', notFlag: 'halina_meds_done' } }),
      go('Odwiedź Teodora piętro wyżej', 'sl_teodor', { req: { flag: 'met_teodor', notFlag: 'sl_teodor' }, effect: { flag: 'sl_teodor' } }),
      go('Zapukaj do Witka, brata Kreta', 'sl_witek', { req: { flag: 'kr_brother_q', notFlag: 'witek_seen' } }),
      go('Zejdź do piwnicy, gdzie spotykają się rodziny', 'rd_entry', { req: { any: [{ flag: 'diary' }, { flag: 'stream_proof' }, { flag: 'met_teodor' }] } }),
      go('Zapytaj o zeszyt z przepisami', 'sl_recipe', { req: { flag: 'sl_hania', notFlag: 'recipe' } }),
      go('Zajrzyj do Teodora na podwórko', 'sl_teodor_bike', { req: { flag: 'sl_teodor', notFlag: 'marek_bike' } }),
      go('Wejdź na dach bloku siódmego', 'sl_roof', { req: { flag: 'mira', notFlag: 'sl_roof_done' } }),
      street,
    ]
  ),

  sl_hania: sc(
    S,
    `Pani Halina wyjmuje z kredensu zdjęcie w ramce. Dziewczyna z warkoczem i lutownicą w ręce, roześmiana, z plamą smaru na policzku.

    „Moja Hania. Dziewiętnaście lat. Studiowała elektronikę radiową na wieczorowym, a w dzień programowała chipy dla tego Bruna z baru. Zdolna jak diabli. Po siostrze.”

    „Jej siostra, Ola, wyjechała, jak Hania zniknęła. Powiedziała, że jej poszuka. Od roku nie dzwoni.”`,
    [
      go('„Mogę zobaczyć pokój Hani?”', 'sl_room'),
      hub,
    ]
  ),

  sl_room: sc(
    S,
    `Pokój Hani jest mały i zagracony. Na biurku stoją rozebrane radia, w słoiku leżą tranzystory posortowane według koloru. Na ścianie wisi mapa Doliny z zaznaczonymi masztami antenowymi.

    Pani Halina staje w drzwiach i nie wchodzi dalej. „Nic tu nie ruszałam. Nie mogę.”

    Pod biurkiem jedna deska podłogi trochę odstaje.`,
    [
      go('Podważ deskę', 'sl_room2'),
      go('Obejrzyj mapę na ścianie', 'sl_map'),
    ]
  ),

  sl_map: sc(
    S,
    `Na mapie Hania zaznaczyła czerwonym flamastrem wszystkie przychodnie Halcyonu w Dolinie. Przy każdej data. Od każdej przychodni do Iglicy biegnie cienka linia ołówkiem.

    W rogu dopisała drobnym pismem: „Sygnał idzie w górę. Każdej nocy o 3:00. Dlaczego?”`,
    [go('Podważ deskę pod biurkiem', 'sl_room2', { effect: { flag: 'hania_map' } })]
  ),

  sl_room2: sc(
    S,
    `Deska ustępuje z cichym trzaskiem. Pod spodem leży zeszyt w twardej oprawie, owinięty w folię przed wilgocią.

    Na pierwszej stronie napis: „Dziennik. Nie czytać, Ola, to do ciebie też.”

    Pani Halina zakrywa usta dłonią.`,
    [go('Przeczytaj pierwszy wpis', 'sl_diary1')]
  ),

  sl_diary1: sc(
    S,
    `„12 lutego. Na Śluzie otworzyli przychodnię Halcyonu. Rozdają Spokój za darmo. Marek z siódemki już wziął, mówi, że pierwszy raz od pogrzebu mamy przespał całą noc.

    Dziwne. Halcyon nigdy nic nie daje za darmo. Zmierzę to.”`,
    [go('Przewróć stronę', 'sl_diary2')]
  ),

  sl_diary2: sc(
    S,
    `„3 marca. Zmierzyłam. Wszczepy Spokoju nadają co noc o trzeciej. Krótko, ale bardzo mocno. Sygnał idzie prosto do Iglicy, na poziom 210.

    Ludzie, którzy wzięli Spokój pierwsi, coraz mniej mówią. Marek przestał grać na gitarze. Pan Józef z parteru zapomniał imienia żony.

    Muszę zobaczyć, co jest w środku tego wszczepu.”`,
    [go('Przewróć stronę', 'sl_diary3')]
  ),

  sl_diary3: sc(
    S,
    `„20 marca. Jutro idę do przychodni. Powiem, że nie mogę spać. Wezmę Spokój i rozbiorę go w domu. Jak coś pójdzie źle, ten dziennik jest dowodem.

    Ola, jeśli to czytasz: nie szukaj mnie w Iglicy. Szukaj mnie w eterze. Kropka, kreska, kropka.”

    To ostatni wpis. Reszta stron jest pusta.

    Pani Halina płacze bezgłośnie. Mira w twoim uchu nie mówi nic, ale chip w kieszeni jest gorący jak węgiel.`,
    [go('Zabierz dziennik', 'sl_hub', { effect: { flag: 'diary', trust: 1 } })]
  ),

  sl_neighbors: sc(
    S,
    `Pani Halina prowadzi cię po klatce schodowej. Za co drugimi drzwiami świeci niebieski ekran.

    „Tu pan Józef, był listonoszem. Tam pani Krysia, uczyła w szkole. Tu Marek, syn Teodora.” Wylicza ich jak na cmentarzu. „Rodziny ich karmią, myją, przewracają z boku na bok. Halcyon przysyła co miesiąc paczkę z odżywkami. Za darmo, oczywiście.”`,
    [
      go('Przyjrzyj się wszczepowi pana Józefa', 'sl_jozef', { req: { notFlag: 'stream_proof' } }),
      go('Zajrzyj do Marka', 'sl_marek', { req: { flag: 'met_teodor', notFlag: 'unplug_danger' } }),
      hub,
    ]
  ),

  sl_jozef: sc(
    S,
    `Pan Józef siedzi w fotelu przed ekranem. Za jego uchem pod skórą świeci mała dioda wszczepu. Mruga w rytmie, który wydaje ci się znajomy.

    Mira szepcze: „Mogę spróbować się z nim połączyć przez twój wszczep. Ale wtedy Halcyon może nas zauważyć.”`,
    [
      play('Połącz się z wszczepem', 'hack', 2, { to: 'sl_jozef_ok', effect: { flag: 'stream_proof' } }, { to: 'sl_jozef_fail', effect: { heat: 15 } }),
      go('Lepiej nie ryzykować', 'sl_neighbors'),
    ]
  ),

  sl_jozef_ok: sc(
    S,
    `Przez sekundę widzisz to, co widzi wszczep. Kolejka pakietów danych ułożonych jak listy w sortowni. Na każdym etykieta: „DAWCA 2217 / ŚLUZA 6 / WSPOMNIENIE: ŚLUB, 1 MAJA 2061”.

    Wspomnienie ślubu pana Józefa płynie w górę, do Iglicy. Kawałek po kawałku.

    Mira nagrywa wszystko. „To dowód” — mówi drżącym głosem. — „Oni ich ciągle okradają. Co noc.”`,
    [go('Odłącz się, zanim ktoś zauważy', 'sl_neighbors', { effect: { trust: 1 } })]
  ),

  sl_jozef_fail: sc(
    S,
    `Wszczep pana Józefa zaczyna mrugać na czerwono. Gdzieś daleko w górze ktoś właśnie dostał powiadomienie o nieautoryzowanym połączeniu.

    Odskakujesz od fotela. Pan Józef nadal się uśmiecha, jakby nic się nie stało. Może dla niego naprawdę nic się nie stało.`,
    [go('Wróć na klatkę', 'sl_neighbors')]
  ),

  sl_marek: sc(
    S,
    `Marek siedzi tam, gdzie poprzednio. Teodor śpi na krześle obok, z głową na stole.

    Ekran przed Markiem jest podłączony do gniazdka grubym kablem. Wystarczyłoby go wyrwać.`,
    [
      go('Wyrwij kabel z gniazdka', 'sl_unplug'),
      go('Zostaw go w spokoju', 'sl_neighbors'),
    ]
  ),

  sl_unplug: sc(
    S,
    `Ekran gaśnie. Przez sekundę nic się nie dzieje. Potem Marek zaczyna drżeć, mocniej i mocniej, aż spada z krzesła. Dioda za jego uchem wyje czerwienią.

    Teodor zrywa się i wpycha kabel z powrotem. Ekran się zapala. Marek nieruchomieje i znowu się uśmiecha.

    „Nie wolno!” — krzyczy Teodor. — „Lekarz z przychodni mówił! Jak się odetnie ekran, to mózg się wypala!”`,
    [go('Przeproś i wyjdź', 'sl_neighbors', { effect: { flag: 'unplug_danger' } })]
  ),

  sl_meds: sc(
    S,
    `Pani Halina macha ręką. „Stara jestem, to i serce stare.” Ale kiedy sięga po czajnik, ręka jej drży, a usta robią się sine.

    „Skończyły mi się tabletki na serce. W aptece Halcyonu chcą recepty z ich przychodni. A do ich przychodni ja nie pójdę. Nigdy.”`,
    [
      go('„Załatwię pani te leki.”', 'sl_hub', { effect: { flag: 'quest_meds' } }),
      hub,
    ]
  ),

  sl_meds_done: sc(
    S,
    `Pani Halina obraca w palcach słoiczek z tabletkami, jakby to była biżuteria. Połyka jedną, popija herbatą i siada ciężko.

    Potem wstaje, idzie do pokoju Hani i wraca z małym zdjęciem. Dwie dziewczyny na wieży radiowej w różowym świetle świtu.

    „Weź. Hania miała je zawsze przy sobie. Jak ją znajdziesz, pokaż jej. Niech wie, że babcia czeka.”`,
    [go('Weź zdjęcie', 'sl_hub', { effect: { flag: ['photo', 'halina_meds_done'], trust: 1 } })]
  ),

  sl_teodor: route({ if: { flag: 'kind_teodor' }, to: 'sl_teodor_kind' }, { to: 'sl_teodor_plain' }),

  sl_teodor_kind: sc(
    S,
    `Teodor rozpoznaje cię od progu i ściska ci dłoń obiema rękami.

    „To ty! Ten kurier, co nie wziął pieniędzy.” Wciska ci do ręki kostkę do gitary, pomarańczową, wytartą. „Marka. Niech ci przyniesie szczęście, jemu już się nie przyda.”

    Potem ścisza głos. „Słuchaj. Co noc o trzeciej pod blok podjeżdża biały van Halcyonu. Nie zatrzymuje się, tylko stoi z włączonym silnikiem dziesięć minut i odjeżdża. Jakby coś zbierał.”`,
    [go('Podziękuj', 'sl_hub', { effect: { flag: ['van_tip', 'guitar_pick'] } })]
  ),

  sl_teodor_plain: sc(
    S,
    `Teodor otwiera drzwi na łańcuchu i patrzy na ciebie przez szparę.

    „Kurier. Pieniądze oddam w przyszłym tygodniu, mówiłem.” Już chce zamknąć, ale się waha. „Coś jeszcze?”`,
    [
      go('„Proszę zatrzymać resztę.”', 'sl_teodor_kind', { effect: { flag: 'kind_teodor' } }),
      go('Oddaj mu zegarek', 'sl_teodor_kind', { req: { flag: 'watch' }, effect: { flag: 'kind_teodor', trust: 1 } }),
      go('„Nic. Przepraszam.”', 'sl_hub'),
    ]
  ),

  sl_witek: sc(
    S,
    `Witek mieszka na parterze bloku czwartego. Drzwi są otwarte, w środku pachnie stęchlizną. Mężczyzna w wieku Kreta, z tą samą blizną nad brwią, siedzi przed ekranem i się uśmiecha.

    Na stole leży nieotwarta paczka odżywek od Halcyonu i kartka napisana dziecięcym pismem: „Tato, wrócę po szkole. Ania.”

    Ktoś się nim opiekuje. Ktoś mały.`,
    [go('Zostaw Ani trochę kredytów (30 kr)', 'sl_witek2', { req: { credits: 30 }, effect: { credits: -30, flag: ['witek_seen', 'ania_help'] } }), go('Wyjdź po cichu', 'sl_hub', { effect: { flag: 'witek_seen' } })]
  ),

  sl_witek2: sc(
    S,
    `Kładziesz kredyty pod kartkę i dopisujesz jedno słowo: „Trzymaj się”.

    Kiedy wychodzisz, na schodach mijasz dziewczynkę z tornistrem większym od niej. Patrzy na ciebie podejrzliwie, z tą samą blizną nad brwią, co ojciec i stryj.`,
    [hub]
  ),

  sl_roof: sc(
    S,
    `Na dachu bloku siódmego stoi plastikowe krzesło i stojak na nuty, przewrócony przez wiatr. Obok leży gitara bez dwóch strun.

    Mira odzywa się nagle: „Tu grał Marek. Pamiętam… pamiętam, że siedziałam tam, na murku, i śmiałam się z niego, bo fałszował.”

    „To moje wspomnienie. Nie kogoś innego. Moje.”`,
    [go('Usiądź na murku', 'sl_roof2')]
  ),

  sl_roof2: sc(
    S,
    `Siadasz na mokrym murku. Stąd widać całą Śluzę, niebieskie okna i Wieżę Radiową na horyzoncie, czarną na tle chmur.

    Przez chwilę nikt nic nie mówi. Deszcz bębni o gitarę.

    „Dziękuję” — szepcze Mira. — „Za to, że tu przyszłaś. Przyszedłeś. Przepraszam, wciąż mi się to myli. Dużo głosów.”`,
    [go('Zejdź na dół', 'sl_hub', { effect: { trust: 1, flag: 'sl_roof_done' } })]
  ),
};
