import { go, play, route, sc } from './_h.js';

// Bazar pod wiaduktem: Sroka, Madame Zuzanna, pan Lin, Klatka i Kruki
const X = 'Dolina · Bazar pod wiaduktem';
const hub = go('Wróć między stragany', 'bz_hub');
const street = go('Wróć na ulicę', '@map');

export default {
  bazar: route({ if: { notFlag: 'bz_seen' }, to: 'bz_first' }, { to: 'bz_hub' }),

  bz_first: sc(
    X,
    `Pod betonowym wiaduktem, gdzie deszcz nie dociera, kłębi się cała Dolina. Plandeki, lampiony z puszek, stragany z kablami, rybami, wszczepami z odzysku i podrabianymi butami z Iglic.

    Ktoś smaży kalmary, ktoś kłóci się o cenę baterii, ktoś śpiewa przy akordeonie. Pachnie olejem, ozonem i mokrym betonem.

    Bazar żyje własnym życiem i nie obchodzi go żaden Halcyon.`,
    [go('Wejdź między stragany', 'bz_hub', { effect: { flag: 'bz_seen' } })]
  ),

  bz_hub: sc(
    X,
    `Przeciskasz się między straganami. Nad głową szumi wiadukt, po którym przejeżdża pusta kolejka towarowa.`,
    [
      go('Stragan Sroki (podróbki i części)', 'bz_sroka'),
      go('Namiot Madame Zuzanny (wróżby)', 'bz_zuz'),
      go('Budka pana Lina (makaron)', 'bz_lin'),
      go('Klatka (walki na pieniądze)', 'bz_cage', { req: { notFlag: 'cage_champ' } }),
      go('Kruczy róg bazaru', 'bz_kruki', { req: { flag: 'kruki_met' } }),
      go('Spalony kruczy róg', 'bz_war_after', { req: { flag: 'kruki_war', notFlag: 'war_seen' } }),
      go('Warsztat Złotej Rączki', 'bz_mech'),
      go('Kaznodzieja na skrzynce', 'bz_preach'),
      go('Budka tatuażysty Igora', 'bz_tattoo'),
      go('Dzieciaki w maskach kruków', 'bz_kids', { req: { flag: 'kruki_met', notFlag: 'kids_help' } }),
      go('Wyścigi motorów pod wiaduktem', 'bz_race', { req: { notFlag: 'race_won' } }),
      street,
    ]
  ),

  bz_sroka: sc(
    X,
    `Sroka jest drobną kobietą z siwym irokezem i lupą wszczepioną w prawe oko. Jej stragan to ściana szuflad, a w każdej szufladzie coś, czego nie powinno być w Dolinie.

    „Kurier! Co dla ciebie? Dokumenty, chipy, części? U Sroki wszystko jest prawie oryginalne.”`,
    [
      go('Zamów fałszywy chip dla Sokoła (200 kr)', 'bz_fake', { req: { flag: 'fake_plan', credits: 200, notFlag: 'fake_chip' }, effect: { credits: -200, flag: 'fake_chip' } }),
      go('Kup cewkę antenową dla Oka (150 kr)', 'bz_coil', { req: { flag: 'amp_quest', credits: 150, notFlag: 'amp_coil' }, effect: { credits: -150, flag: 'amp_coil' } }),
      go('Wymień zegarek Teodora na cewkę', 'bz_coil', { req: { flags: ['amp_quest', 'watch'], notFlags: ['amp_coil', 'kind_teodor'] }, effect: { flag: ['amp_coil', 'kind_teodor'] } }),
      go('Kup fałszywą licencję kuriera (150 kr)', 'bz_id', { req: { credits: 150, notFlag: 'fake_id' }, effect: { credits: -150, flag: 'fake_id' } }),
      go('„Skąd się tu wzięłaś, Sroka?”', 'bz_sroka_story', { req: { notFlag: 'sroka_story' } }),
      go('Sprzedaj zegarek Teodora (80 kr)', 'bz_watch', { req: { flag: 'watch', notFlag: 'kind_teodor' }, effect: { credits: 80, flag: 'kind_teodor' } }),
      hub,
    ]
  ),

  bz_fake: sc(
    X,
    `Sroka skanuje oryginalny chip przez ołowianą obudowę, mrucząc coś pod nosem. Mira w twoim uchu syczy, że to łaskocze.

    Po kwadransie Sroka wręcza ci identyczny chip, z tym samym wydrapanym napisem MIRA. „Przejdzie pierwszy skan. Drugi już nie. Masz jakieś pięć minut, zanim się zorientują.”

    „Pięć minut to w Dolinie cała wieczność” — dodaje z uśmiechem.`,
    [go('Wróć do Sroki', 'bz_sroka')]
  ),

  bz_coil: sc(
    X,
    `Sroka wyciąga z szuflady miedzianą cewkę owiniętą w gazetę sprzed dwudziestu lat.

    „Z prawdziwego masztu nadawczego. Ostatnia w Dolinie, może w całym mieście. Na co ci?” Patrzy na ciebie przez lupę. „A zresztą nie mów. W tym biznesie lepiej nie wiedzieć.”`,
    [go('Wróć do Sroki', 'bz_sroka')]
  ),

  bz_id: sc(
    X,
    `Sroka robi ci zdjęcie, wpisuje coś na starym laptopie i po dziesięciu minutach podaje plastikową kartę.

    Licencja kurierska na nazwisko „J. Kowalski”, z hologramem Halcyonu, który mieni się prawie jak prawdziwy.

    „Na Posterunku pokażesz to zamiast swojej. Oficer Nowak i tak nie odróżnia hologramu od naklejki z gumy do żucia.”`,
    [go('Wróć do Sroki', 'bz_sroka')]
  ),

  bz_watch: sc(
    X,
    `Sroka ogląda zegarek przez lupę i cmoka z uznaniem.

    „Mechanizm szwajcarski, koperta poprawiana. Osiemdziesiąt. I nie targuj się, bo zmienię zdanie.”`,
    [go('Wróć do Sroki', 'bz_sroka')]
  ),

  bz_zuz: route(
    { if: { flag: 'zuz2' }, to: 'bz_zuz3' },
    { if: { flag: 'zuz1' }, to: 'bz_zuz2' },
    { to: 'bz_zuz1' }
  ),

  bz_zuz1: sc(
    X,
    `Madame Zuzanna tasuje karty pomarszczonymi dłońmi. Kryształowa kula zmienia kolory, bo ktoś w środku zamontował diodę RGB.

    „Pięć kredytów, kochanie. Przyszłość nie jest za darmo, nawet w Dolinie.”`,
    [
      go('Zapłać 5 kr', 'bz_zuz1b', { req: { credits: 5 }, effect: { credits: -5, flag: 'zuz1' } }),
      hub,
    ]
  ),

  bz_zuz1b: sc(
    X,
    `Zuzanna odwraca kartę. Dwie kobiety trzymające jedną latarnię.

    „Widzę dwie siostry i jedną wieżę. Jedna mówi, druga słucha. Ale żeby się usłyszały, ktoś musi im przypomnieć, jak brzmi ich imię.”

    Patrzy na ciebie zmrużonymi oczami. „To ty, kochanie. Ty jesteś tym kimś.”`,
    [hub]
  ),

  bz_zuz2: sc(
    X,
    `Zuzanna znowu tasuje. Tym razem wyciąga kartę z wieżą trafioną piorunem.

    „Wieża musi krzyczeć głośniej niż Iglice. Szept do Doliny to za mało. Potrzeba miedzi i ognia z portu.”

    „Pięć kredytów, kochanie. Proroctwa kosztują.”`,
    [
      go('Zapłać 5 kr', 'bz_hub', { req: { credits: 5 }, effect: { credits: -5, flag: 'zuz2' } }),
      hub,
    ]
  ),

  bz_zuz3: sc(
    X,
    `Zuzanna wyciąga ostatnią kartę i długo na nią patrzy. Ptak w klatce z otwartymi drzwiczkami.

    „Ktoś w szarym płaszczu czeka na ciebie na końcu drogi. Możesz z nim walczyć. Możesz go oszukać. Możesz też zapytać, kim był, zanim dostał czerwone oko.”

    „Na dziś koniec, kochanie. Więcej przyszłości nie ma. Wyczerpała się.”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { flag: 'zuz3' } })]
  ),

  bz_lin: sc(
    X,
    `Pan Lin ma osiemdziesiąt lat, jeden prawdziwy ząb i najlepszy makaron w Nowej Wiśle. Jego budka stoi w tym samym miejscu od czasów, kiedy wiadukt był jeszcze nowy.

    „Makaron z wołowiną? Piętnaście. Z opowieścią gratis.”`,
    [
      go('Zjedz makaron (15 kr, +1 zdrowie)', 'bz_lin_eat', { req: { credits: 15 }, effect: { credits: -15, hp: 1 } }),
      go('Poproś o opowieść', 'bz_lin_story', { req: { notFlag: 'lin_story' }, effect: { flag: 'lin_story' } }),
      go('„Co to za lampiony nad budką?”', 'bz_lin_anniv', { req: { notFlag: 'lin_story' } }),
      hub,
    ]
  ),

  bz_lin_eat: sc(
    X,
    `Makaron jest gorący, tłusty i pachnie anyżem. Przez pięć minut świat składa się tylko z miski, pary i deszczu bębniącego o plandekę.

    Pan Lin patrzy, jak jesz, i kiwa głową z zadowoleniem.`,
    [hub]
  ),

  bz_lin_story: sc(
    X,
    `„Pięćdziesiąt lat temu Dolina była dzielnicą ogrodów” — mówi pan Lin, mieszając w garnku. — „Potem przyszła wielka woda, a za wodą przyszedł Halcyon. Postawili Iglice na palach, żeby bogaci nie zmokli. Nas zostawili na dole.”

    „Ale wiesz co? Tu na dole ludzie jeszcze pamiętają, jak się dzieli makaron. Tam na górze już nie.”

    Nakłada ci miskę i nie chce pieniędzy.`,
    [go('Podziękuj', 'bz_hub', { effect: { hp: 1 } })]
  ),

  bz_cage: sc(
    X,
    `Klatka to stalowa siatka rozpięta między filarami wiaduktu. Wokół tłum krzyczy i obstawia zakłady. W środku dwóch zawodników okłada się pięściami w rękawicach z wszczepami.

    Organizator, gruby mężczyzna z cygarem, klepie cię po ramieniu. „Nowa twarz! Wchodzisz? Wpisowe pięćdziesiąt, wygrana sto pięćdziesiąt.”`,
    [
      play('Wejdź do klatki (wpisowe 50 kr)', 'duel', 2, { to: 'bz_cage_win', effect: { credits: 100 } }, { to: 'bz_cage_lose', effect: { credits: -50, hp: -1 } }, { req: { credits: 50 } }),
      hub,
    ]
  ),

  bz_cage_win: sc(
    X,
    `Tłum ryczy. Twój przeciwnik leży na deskach i macha ręką na znak, że ma dosyć.

    Organizator wciska ci w dłoń kredyty i ociera pot z czoła. „Masz talent, kurierze. Wracaj, kiedy chcesz. Albo lepiej nie wracaj, bo mi zrujnujesz zakłady.”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { flag: 'cage_champ' } })]
  ),

  bz_cage_lose: sc(
    X,
    `Budzisz się na stercie worków z ryżem, z rozciętą wargą i dzwonieniem w uszach. Ktoś przyłożył ci do twarzy zimną puszkę napoju.

    „Nie przejmuj się” — mówi organizator. — „Każdy kiedyś przegrywa. Ty po prostu przegrywasz wyjątkowo efektownie.”`,
    [hub]
  ),

  bz_kruki: route({ if: { flag: 'kr_msg', notFlags: ['kruki_peace', 'kruki_war'] }, to: 'bz_gawron_msg' }, { to: 'bz_gawron' }),

  bz_gawron: sc(
    X,
    `W kruczym rogu bazaru stragany są czarne, a sprzedawcy noszą maski z dziobami. Na skrzynce po amunicji siedzi wysoki mężczyzna z piórami wplecionymi w warkocz. Gawron.

    „Kurier, o którym gadają na bazarze” — mówi bez uśmiechu. — „Przyjść tu samemu to odważne. Głupie, ale odważne. Czego chcesz?”`,
    [hub]
  ),

  bz_gawron_msg: sc(
    X,
    `Wręczasz Gawronowi kartkę od Kreta. Czyta ją raz, potem drugi. Szczęka mu tężeje.

    „Spokój wziął twojego syna i mojego brata” — powtarza na głos. — „Skąd on wie o moim synu?”

    Wstaje ze skrzynki. Kruki wokół sięgają po noże.`,
    [
      go('„Cała Dolina płaci tę samą cenę. Halcyon zabiera wam ludzi.”', 'bz_peace', { req: { any: [{ flag: 'stream_proof' }, { flag: 'diary' }] }, effect: { flag: 'kruki_peace' } }),
      play('„Rozstrzygnijmy to w Klatce.”', 'duel', 2, { to: 'bz_peace', effect: { flag: 'kruki_peace' } }, { to: 'bz_war', effect: { flag: 'kruki_war', hp: -1 } }),
      go('Sprzedaj mu kryjówki Szczurów (200 kr)', 'bz_betray', { effect: { credits: 200, flag: ['kruki_war', 'betrayed_rats'] } }),
    ]
  ),

  bz_peace: sc(
    X,
    `Gawron opuszcza nóż. Potem zdejmuje maskę z dziobem. Pod spodem jest zmęczony mężczyzna z czerwonymi oczami.

    „Mój syn ma szesnaście lat. Pół roku siedzi przed ekranem i się uśmiecha.” Przełyka ślinę. „Powiedz Kretowi, że przyjdę. Bez noży.”

    Kruki chowają ostrza. Ktoś na bazarze zaczyna klaskać.`,
    [hub]
  ),

  bz_war: sc(
    X,
    `Gawron wychodzi z Klatki bez zadrapania. Ty z rozbitym łukiem brwiowym.

    „Kret przysyła dzieciaka, żeby walczył za niego? To mówi wszystko.” Odwraca się plecami. „Wojna trwa. Powiedz mu.”`,
    [hub]
  ),

  bz_betray: sc(
    X,
    `Gawron słucha o łodziach, tunelach i wejściach do metra. Potem rzuca ci sakiewkę z kredytami.

    „Mądry wybór, kurierze. Kruki płacą lepiej niż Szczury.”

    Kiedy odchodzisz, Mira milczy. Dopiero po długiej chwili mówi cicho: „Witek ma córkę. Pamiętasz?”`,
    [go('Wróć między stragany', 'bz_hub', { effect: { trust: -2 } })]
  ),
};
