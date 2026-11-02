import { go, route, sc } from './_h.js';

// Epilogi: co dzieje się po finale. Sceny pojawiają się zależnie od tego, komu udało się pomóc.
const E = 'Epilog';
const next = (to) => go('Dalej', to);

export default {
  // Imię (najlepsze zakończenie)
  ep_name_1: sc(
    E,
    `Trzy dni później.

    Wieża Radiowa nadaje bez przerwy. Na każdym ekranie w Dolinie, na każdym tablecie w Iglicach, w każdej windzie i każdej stołówce leci to samo: wspomnienia ze Śluzy, umowa Spokoju i nagrania, których Halcyon nigdy nie chciał pokazać.

    Akcje Halcyonu spadają do zera w jedną noc. Prezes Wolański nie pokazuje się publicznie. Doktor Wren składa zeznania.`,
    [next('ep_name_1b')]
  ),

  ep_name_2: route({ if: { flag: 'met_teodor' }, to: 'ep_name_marek' }, { to: 'ep_name_3' }),

  ep_name_marek: sc(
    E,
    `Na dachu bloku siódmego na Śluzie ktoś gra na gitarze bez dwóch strun. Fałszuje okropnie.

    Marek siedzi na plastikowym krześle, chudy i blady, z bandażem za uchem. Teodor stoi obok i płacze bez wstydu.

    Kiedy cię widzi, Marek przerywa grę. „Tata mówi, że to ty” — mówi zachrypniętym głosem. — „Nie wiem, jak dziękować. Mogę zagrać? Znam tylko jedną piosenkę.”

    Gra piosenkę o łódce. Ze Śluzy dołącza cały chór.`,
    [next('ep_name_3')]
  ),

  ep_name_3: route({ if: { flag: 'witek_seen' }, to: 'ep_name_witek' }, { to: 'ep_name_4' }),

  ep_name_witek: sc(
    E,
    `W zalanym metrze odbywa się najdziwniejsze przyjęcie, jakie widziała Dolina. Szczury, a jeśli się udało, to i Kruki, piją przy płonących beczkach. Na tronie z samochodowych foteli siedzi Ania i rządzi wszystkimi jak królowa.

    Witek siedzi obok brata. Mówi powoli, czasem myli słowa, ale mówi. Kret nie puszcza jego ręki przez cały wieczór.

    „Rodzina” — mówi do ciebie Kret, unosząc kubek. — „Na zawsze.”`,
    [next('ep_name_4')]
  ),

  ep_name_4: route({ if: { flag: 'bruno_ally' }, to: 'ep_name_bruno' }, { to: 'ep_name_5' }),

  ep_name_bruno: sc(
    E,
    `Bar Pod Pompą pęka w szwach. Ktoś przyniósł akordeon, ktoś inny garnek bigosu.

    Bruno stawia przed tobą talerz z pączkiem w różowym lukrze. Obok kładzie mały głośnik i włącza go.

    „Ej, Bruno” — odzywa się z głośnika głos Hani. — „Lukier za słodki. Jak zawsze.”

    Bruno śmieje się i płacze jednocześnie. Dług Halcyonu przepadł razem z Halcyonem.`,
    [next('ep_name_5')]
  ),

  ep_name_5: route({ if: { flag: 'igla_proof' }, to: 'ep_name_igla' }, { to: 'ep_name_6' }),

  ep_name_igla: sc(
    E,
    `Proces Halcyonu trwa miesiąc. Najważniejszym świadkiem jest kobieta z dziesięcioma stalowymi palcami.

    Igła pokazuje sądowi nagranie z prasy hydraulicznej. Opowiada o operacjach, które nie były leczeniem. Kiedy kończy, na sali panuje cisza.

    Wychodząc z sądu, puszcza do ciebie oko. „Dla ciebie wszczepy dożywotnio za darmo. Słowo chirurga.”`,
    [next('ep_name_6')]
  ),

  ep_name_6: route({ if: { flag: 'pchla_friend' }, to: 'ep_name_pchla' }, { to: 'ep_name_7' }),

  ep_name_pchla: sc(
    E,
    `Ola zabiera Pchłę na szczyt Wieży Radiowej o świcie. Chmury akurat się rozstępują, pierwszy raz od miesięcy.

    Słońce wschodzi nad Doliną. Pchła stoi z otwartymi ustami i nie mówi nic, co mu się nigdy nie zdarza. Kuba siedzi mu na ramieniu i świeci diodą.

    „Mama miała rację” — szepcze w końcu. — „Jest bardzo jasne.”`,
    [next('ep_name_7')]
  ),

  ep_name_7: route({ if: { flag: 'photo' }, to: 'ep_name_halina' }, { to: 'ep_name_8' }),

  ep_name_halina: sc(
    E,
    `Ola wraca na Śluzę po raz pierwszy od roku. Pani Halina otwiera drzwi i przez długą chwilę obie stoją w progu bez słowa.

    Potem Ola stawia na stole mały głośnik.

    „Babciu” — mówi głośnik głosem Hani. — „Pamiętasz piosenkę o łódce? Fałszowałaś w trzecim wersie. Ja też.”

    Pani Halina siada, kładzie dłoń na głośniku i śpiewa. Fałszuje w trzecim wersie.`,
    [next('ep_name_8')]
  ),

  ep_name_8: sc(
    E,
    `Wieczorem siedzisz na szczycie Wieży Radiowej z Olą. Między wami stoi nadajnik, przez który Hania rozmawia jednocześnie z tobą, z siostrą i z połową Doliny.

    „Ola mówi, że mogę zostać tutaj, w Wieży” — mówi Hania. — „Albo w twoim komunikatorze, jeśli chcesz. Albo wszędzie po trochu. Nie mam ciała, ale mam wybór. Pierwszy raz w życiu, albo w czymś, co jest po życiu.”

    „A ty? Co teraz będziesz robić?”`,
    [
      go('„Dalej wozić paczki. Ktoś musi.”', 'end_name'),
      go('„Zostań ze mną. Dolina jest duża.”', 'end_name', { req: { flag: 'promise_stay' } }),
      go('„Zostań z siostrą. Będę wpadać.”', 'end_name'),
    ]
  ),

  // Neon Sygnał
  ep_signal_1: sc(
    E,
    `Trzy dni później.

    Nagrania ze Śluzy krążą po Dolinie jak wirus. Ludzie wychodzą na ulice. Przychodnie Halcyonu w Dolinie zamykają się jedna po drugiej, a ich szyldy ktoś zamalowuje sprayem: antena i słowo WIEŻA.`,
    [next('ep_signal_2')]
  ),

  ep_signal_2: route({ if: { flag: 'amp' }, to: 'ep_signal_amp' }, { to: 'ep_signal_2b' }),

  ep_signal_amp: sc(
    E,
    `Dzięki wzmacniaczowi Oka sygnał dociera też do Iglic. W stołówkach, windach i biurach na wszystkich ekranach widać ludzi przed niebieskimi ekranami.

    Pracownicy Halcyonu po raz pierwszy widzą, na czym zarabiają. Część z nich rzuca pracę. Część przyjeżdża do Doliny z kocami, jedzeniem i pytaniem, jak mogą pomóc.

    Kucharka Ewa ze stołówki gotuje zupę na Śluzie, dla wszystkich.`,
    [next('ep_signal_2b')]
  ),

  ep_signal_3: sc(
    E,
    `Mira mieszka teraz w Wieży Radiowej, razem z Oko. Nie pamięta, kim była. Ale codziennie o świcie nadaje do Doliny prognozę pogody, zawsze tę samą.

    „Deszcz. Przez cały dzień deszcz. Ale jutro może się przejaśni.”

    Czasem dzwoni do ciebie w nocy i pyta, czy nie wiesz, kim mogła być. Opowiadasz jej o pralni, o pączkach z różowym lukrem i o dziewczynie z lutownicą. Ona słucha, jakby to była bajka.`,
    [go('Dalej', 'end_signal')]
  ),

  // Ostatnia audycja
  ep_martyr_1: sc(
    E,
    `Cela na poziomie minus trzy Iglicy nie ma okien. Ma tylko światło, które nigdy nie gaśnie, i głośnik, który co godzinę przypomina o regulaminie.

    Ale przez ściany przechodzą wibracje. Ktoś tam na dole, w Dolinie, krzyczy. Tysiące gardeł naraz.`,
    [next('ep_martyr_2')]
  ),

  ep_martyr_2: route(
    { if: { flag: 'pchla_friend' }, to: 'ep_martyr_pchla' },
    { if: { flag: 'bruno_ally' }, to: 'ep_martyr_bruno' },
    { to: 'ep_martyr_2b' }
  ),

  ep_martyr_pchla: sc(
    E,
    `Czwartego dnia przez kratkę wentylacyjną wpada metalowy gołąb z przestrzelonym kiedyś skrzydłem. W dziobie trzyma zwinięty liścik.

    „Cała Dolina wie, kto to zrobił. Oko mówi, że nagranie obejrzało milion osób. Wytrzymaj. Wyciągniemy cię. Pchła.”

    Kuba mruga diodą i odlatuje, zanim strażnik zdąży zajrzeć.`,
    [next('ep_martyr_2b')]
  ),

  ep_martyr_bruno: sc(
    E,
    `Piątego dnia przychodzi adwokat. Gruby, spocony, w za ciasnym garniturze. To Bruno.

    „Nie jestem adwokatem” — szepcze przez szybę. — „Ale mam dobre papiery od Sroki. Cała Dolina zrzuca się na twoją kaucję. Pan Lin dał ostatnie oszczędności. Pani Halina sprzedała pierścionek.”

    „Trzymaj się. Pączek czeka.”`,
    [next('ep_martyr_2b')]
  ),

  ep_martyr_3: sc(
    E,
    `Proces trwa tydzień. Prokurator Halcyonu mówi o kradzieży mienia, włamaniu i terroryzmie.

    Kiedy przychodzi twoja kolej, wstajesz i mówisz tylko jedno zdanie: „Moja praca to doręczanie przesyłek. Ta trafiła do adresata. Adresatem była cała Dolina.”

    Na galerii dla publiczności ktoś zaczyna klaskać. Potem wszyscy.`,
    [go('Dalej', 'end_martyr')]
  ),

  // Duch w sieci
  ep_ghost_1: sc(
    E,
    `Uciekasz z Iglicy schodami przeciwpożarowymi. Czterysta pięter w dół, w ciemności, z pustym chipem w kieszeni.

    Na dole czeka deszcz. Pierwszy raz w życiu cieszy cię jego zimno.`,
    [next('ep_ghost_2')]
  ),

  ep_ghost_2: sc(
    E,
    `Tygodnie mijają. Halcyon ogłasza „awarię systemów asystenckich” i wycofuje produkt, zanim trafił na rynek. Nikt nie wie dlaczego.

    W Dolinie dzieją się dziwne rzeczy. Automaty z makaronem same wydają darmowe kubki biednym. Kamery Halcyonu gasną, kiedy ktoś ucieka przed patrolem. Na ekranach na Śluzie czasem na sekundę pojawia się różowa twarz i znika.`,
    [next('ep_ghost_2b')]
  ),

  ep_ghost_3: sc(
    E,
    `Pewnej nocy twój komunikator włącza się sam. Na ekranie pojawia się jedno słowo, pisane alfabetem Morse’a, kropkami i kreskami.

    DZIĘKUJĘ.

    Potem ekran gaśnie. Za oknem kapsuły wszystkie neony w Dolinie mrugają jednocześnie, trzy razy.`,
    [go('Dalej', 'end_ghost')]
  ),

  // Dostarczone
  ep_deliv_1: sc(
    E,
    `Kredyty na koncie wyglądają nierealnie. Kupujesz nową kurtkę, nowe buty i tydzień w hotelu z oknem na… na nic, bo w Dolinie zawsze pada.

    Śpisz źle. W nocy słyszysz głos, którego już nie ma.`,
    [next('ep_deliv_2')]
  ),

  ep_deliv_2: route({ if: { flag: 'br_help' }, to: 'ep_deliv_bruno' }, { to: 'ep_deliv_3' }),

  ep_deliv_bruno: sc(
    E,
    `Bruno spłaca ostatnią ratę długu i oddycha pierwszy raz od trzech lat. Stawia ci wódkę i nie patrzy w oczy.

    „Stało się, co musiało się stać” — mówi. — „Dla mnie. Dla ciebie.” Nalewa sobie. Butelka stuka o szklankę trzy razy.

    Wiecie, że to nieprawda.`,
    [next('ep_deliv_3')]
  ),

  ep_deliv_3: sc(
    E,
    `Miesiąc później na wieżowcu naprzeciwko twojego hotelu zapala się nowa reklama Halcyonu. Gigantyczna twarz dziewczyny o łagodnym uśmiechu.

    „Mira. Twoja asystentka. Pamięta wszystko za ciebie.”

    Zasłaniasz okno.`,
    [go('Dalej', 'end_delivered')]
  ),

  // Popiół
  ep_ash_1: sc(
    E,
    `Ochrona wyprowadza cię z Iglicy i wyrzuca na peron kolejki jak worek śmieci. Wren nie dzwoni na policję. Po co, skoro dowód leży rozsypany na podłodze laboratorium.

    W kieszeni zostało ci kilka okruchów krzemu. Nie wyrzucasz ich.`,
    [next('ep_ash_2')]
  ),

  ep_ash_2: sc(
    E,
    `Na Śluzie wciąż świecą niebieskie ekrany. Van Halcyonu wciąż przyjeżdża o trzeciej w nocy. Nic się nie zmieniło.

    Ale Halcyon nie dostał Miry. Nie zrobił z niej asystentki. Czasem myślisz, że to jedyne zwycięstwo, jakie da się wygrać w Dolinie: nie dać im wszystkiego.

    Okruchy krzemu nosisz w medalionie na szyi.`,
    [go('Dalej', 'end_ash')]
  ),

  // Umowa
  ep_deal_1: sc(
    E,
    `Wolański długo patrzy przez okno. Potem podnosi słuchawkę i wydaje trzy polecenia. Krótkie, rzeczowe, jak przy zamykaniu nierentownej fabryki.

    „Projekt Spokój zostaje zakończony. Partycja Wolański zostaje usunięta. Prototyp Mira zostaje przekazany kurierowi.”

    Odkłada słuchawkę. „Satysfakcja? Nikt się nie dowie. Ani o mnie, ani o tobie. Taka jest cena.”`,
    [next('ep_deal_2')]
  ),

  ep_deal_2: sc(
    E,
    `Tydzień później vany przestają przyjeżdżać na Śluzę. Ludzie przed ekranami powoli zaczynają mrugać, potem mówić, potem płakać. Nie wszyscy wracają całkiem. Nikt nie wie, dlaczego to się dzieje.

    Halcyon wydaje oświadczenie o „aktualizacji oprogramowania wszczepów Spokój”. Gazety piszą o tym na dziesiątej stronie.`,
    [next('ep_deal_2b')]
  ),

  ep_deal_3: sc(
    E,
    `Mira mieszka teraz w twoim komunikatorze. Czasem w radiu Oka. Czasem w automacie z makaronem na korytarzu Ula, bo, jak mówi, tam jest ciepło.

    „Nikt się nie dowiedział prawdy” — mówi któregoś wieczoru. — „Ale ludzie się budzą. Może to ważniejsze niż prawda.”

    „A może nie. Nie wiem. Zapytaj mnie za rok.”`,
    [go('Dalej', 'end_deal')]
  ),

  // Korona Iglicy
  ep_crown_1: sc(
    E,
    `Gabinet na szczycie Iglicy ma najpiękniejszy widok na świecie. Chmury jak ocean, słońce co rano, cisza.

    Masz nowe imię, nowy garnitur i nowe zdjęcie na stronie internetowej Halcyonu. Ludzie w Iglicy kłaniają ci się na korytarzach. Nikt nie wie, skąd przychodzisz. Nikt nie pyta.`,
    [next('ep_crown_2')]
  ),

  ep_crown_2: sc(
    E,
    `Raz w tygodniu podchodzisz do okna i patrzysz w dół, przez dziurę w chmurach, na Dolinę. Stąd wygląda jak rozbite akwarium. Malutka. Daleka.

    Na Śluzie wciąż świecą niebieskie ekrany. Raporty kwartalne mówią, że Projekt Spokój przynosi trzydzieści procent zysku.

    Podpisujesz raporty.`,
    [next('ep_crown_3')]
  ),

  ep_crown_3: sc(
    E,
    `Któregoś dnia na biurku znajdujesz kostkę do gitary. Pomarańczową, wytartą. Nie wiesz, skąd się wzięła.

    Długo ją obracasz w palcach. Potem wkładasz do szuflady i zamykasz na klucz.

    W twoim uchu nikt już nie mówi.`,
    [go('Dalej', 'end_crown')]
  ),
};
