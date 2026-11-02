import { go, play, sc } from './_h.js';

// Drobniejsze sceny w Dolinie: burza na Wieży, dzieciństwo sióstr, oficer Nowak,
// mama Pchły, Igła o wszczepach, pani Halina i Teodor
const W = 'Dolina · Wieża Radiowa';
const C = 'Dolina · Posterunek';
const D = 'Dolina · Gołębnik';
const K = 'Dolina · Klinika Igła';
const S = 'Dolina · Szósta Śluza';

export default {
  ok_storm: sc(
    W,
    `Nad Wieżą rozpętuje się burza. Piorun trafia w maszt i coś na szczycie strzela snopem iskier. Oko klnie, łapiąc za uprząż.

    „Antena kierunkowa się przekrzywiła! Jak jej nie wyprostuję, nadajnik będzie nadawał w chmury!”

    Patrzy na ciebie. Na górze wieje tak, że deszcz leci poziomo.`,
    [
      play('Wspinaj się z nią na szczyt', 'timing', 2, { to: 'ok_storm_ok', effect: { flag: 'antenna_fixed', trust: 1 } }, { to: 'ok_storm_fall', effect: { hp: -1, flag: 'antenna_fixed' } }),
      go('Trzymaj linę na dole', 'ok_storm_rope', { effect: { flag: 'antenna_fixed' } }),
    ]
  ),

  ok_storm_ok: sc(
    W,
    `Wspinasz się za Oko po mokrych szczeblach. Wiatr szarpie, piorun bije w sąsiedni maszt, a ty trzymasz antenę, kiedy Oko dokręca śruby.

    Kiedy schodzicie, obie strony są przemoczone do kości i śmieją się jak wariaci.

    „Dobra” — mówi Oko. — „Teraz należysz do Wieży. Nie ma odwrotu.”`,
    [go('Wróć do rozmowy', 'oko_done')]
  ),

  ok_storm_fall: sc(
    W,
    `Na trzecim przęśle noga ześlizguje się ze szczebla. Spadasz dwa metry i zatrzymuje cię dopiero lina asekuracyjna, z szarpnięciem, które wybija ci powietrze z płuc.

    Oko kończy naprawę sama. Potem schodzi i ogląda twoje żebra. „Złamane nie są. Ale jutro pokochasz schody.”`,
    [go('Wróć do rozmowy', 'oko_done')]
  ),

  ok_storm_rope: sc(
    W,
    `Trzymasz linę na dole przez czterdzieści minut, w deszczu, który leje się za kołnierz. Oko na górze krzyczy coś, czego nie słychać.

    W końcu antena wraca na miejsce. Oko zjeżdża po linie jak strażak. „Bez ciebie by mnie zwiało do Iglic” — mówi i klepie cię po ramieniu.`,
    [go('Wróć do rozmowy', 'oko_done')]
  ),

  ok_child: sc(
    W,
    `Oko siada na krawędzi platformy, z nogami nad Doliną.

    „Kiedy byłyśmy małe, mama pracowała na trzy zmiany. Ja miałam dziesięć lat, Hania cztery. Przychodziłyśmy tu na Wieżę, bo stary radiowiec, pan Zenon, pozwalał nam siedzieć w swojej budce.”

    „Hania zasypiała przy szumie radia. Mówiła, że szum to głosy ludzi, którzy nie zdążyli się pożegnać.”`,
    [go('„I co się stało z panem Zenonem?”', 'ok_child2')]
  ),

  ok_child2: sc(
    W,
    `„Umarł. Zostawił mi Wieżę w testamencie, pisanym na serwetce” — Oko się uśmiecha. — „Sąd uznał to za nieważne, ale Halcyon nie chciał tej ruiny, więc nikt mnie stąd nie wyrzucił.”

    „Każdą śrubkę tu znam. Każdy kabel. To jedyny dom, jaki mi został.”

    Patrzy w dół na Śluzę. „No, może nie jedyny. Babcia wciąż tam mieszka.”`,
    [go('Wróć do rozmowy', 'oko_done', { effect: { trust: 1 } })]
  ),

  ps_nowak: sc(
    C,
    `Nowak przypatruje ci się dłużej niż zwykle. Potem gasi papierosa i mówi cicho, nie patrząc w twoją stronę.

    „Wiem, co wozisz. Cały system o tym huczy. Wiesz, dlaczego mnie zesłali z mostu w Iglicach? Bo na zebraniu zapytałem, dlaczego Spokój rozdaje się tylko w Dolinie.”

    „Jedenaście lat stoję przy tym szlabanie i patrzę, jak vany jeżdżą na Śluzę.”`,
    [go('„Mógłby pan to powiedzieć jeszcze raz? Głośno?”', 'ps_nowak2')]
  ),

  ps_nowak2: sc(
    C,
    `Nowak długo milczy. Deszcz bębni o dach kontenera.

    „Jak twoja Wieża zacznie nadawać, nagram zeznanie. Dla ludzi, nie dla sądu.” Odwraca się do terminala i stuka w klawiaturę. „A na razie ostatni prezent od starego policjanta. Twoja kartoteka właśnie miała awarię. Całkowitą.”`,
    [go('Odejdź', '@map', { effect: { heat: -40, flag: 'nowak_ally' } })]
  ),

  pc_mom: sc(
    D,
    `Pchła patrzy na zdjęcie w twoim komunikatorze. Kobieta w szarym swetrze, w fotelu, przed ekranem. Za oknem słońce.

    Długo nic nie mówi. Potem dotyka ekranu palcem, jakby mógł ją pogłaskać.

    „Mama” — szepcze. — „Mówili, że wypadek przy windzie. Trzy lata.”`,
    [go('„Ona żyje, Pchła.”', 'pc_mom2')]
  ),

  pc_mom2: sc(
    D,
    `Pchła ociera nos rękawem. Raz, drugi, trzeci. Kuba siada mu na ramieniu i gruchnie cicho.

    „Ty tam jedziesz, do Iglicy. Do Wieży. Do tego wszystkiego.” Łapie cię za rękę, mocno, jak dziecko na przejściu przez ulicę. „Zrób to tak, żeby ona wróciła. Proszę. Zrobię wszystko. Kuba zrobi wszystko.”`,
    [go('„Zrobię, co się da.”', 'pc_hub_main', { effect: { flag: ['pchla_mom_told', 'pchla_escort'], trust: 1 } })]
  ),

  ig_talk: sc(
    K,
    `Igła czyści narzędzia w spirytusie i mówi, nie podnosząc wzroku.

    „Wiesz, czym się różni dobry wszczep od złego? Dobry pomaga ci robić to, co chcesz. Zły pomaga komuś innemu robić z tobą to, co on chce.”

    „Spokój to najpiękniejszy zły wszczep, jaki widziałam. Elegancki, tani, bezbolesny. Gdybym nie wiedziała, do czego służy, podziwiałabym go.”`,
    [go('Wróć do rozmowy', 'clinic')]
  ),

  sl_recipe: sc(
    S,
    `Pani Halina wyjmuje z szuflady pożółkły zeszyt z przepisami. Na pierwszej stronie, krzywymi literami dziecka: „ROSÓŁ BABCI. NIE RUSZAĆ. HANIA”.

    „Moja mama, Stefania, gotowała ten rosół. Potem ja. Hania obiecała, że też się nauczy.” Kładzie zeszyt na stole. „Jedna marchewka, dwie cebule i dobre chęci. Reszta to już tylko woda.”

    Mira mówi cicho: „Stefania to moja prababcia. To ona śpiewała w kuchni. A ja przez cały czas myślałam, że to babcia.”`,
    [go('Wróć do pani Haliny', 'sl_hub', { effect: { flag: 'recipe', trust: 1 } })]
  ),

  sl_teodor_bike: sc(
    S,
    `Teodor siedzi na podwórku pod blaszanym daszkiem i grzebie w silniku starego motoru kurierskiego.

    „Marka. Jeździł nim, zanim…” Macha ręką. „Naprawiam go co tydzień. Jak Marek się obudzi, będzie na chodzie.”

    Wyciera ręce w szmatę i podaje ci klucz do motoru. „Na razie weź ty. Lepiej, żeby jeździł, niż rdzewiał.”`,
    [go('Weź klucz od motoru', 'sl_hub', { effect: { flag: 'marek_bike' } })]
  ),

  kr_lore: sc(
    'Dolina · Zalane metro',
    `Kret wskazuje na mapę metra wymalowaną na ścianie peronu. Część linii jest zamalowana na niebiesko, czyli zalana.

    „Tunelami metra można dojść pod całą Doliną. Pod Śluzą, pod bazarem, nawet pod Posterunkiem. Halcyon o tym nie wie, bo ich mapy kończą się na powierzchni.”

    „Szczury żyją tam, gdzie Halcyon nie patrzy. To nasza jedyna przewaga.”`,
    [go('Wróć do rozmowy', 'kr_hub')]
  ),
};
