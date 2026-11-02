import { go, sc } from './_h.js';

// Rozmowy z Mirą: otwierane z dziennika w dowolnym momencie, '@return' wraca do gry
const M = 'Rozmowa · Mira';
const back = go('Wróć do tematów', 'mira_talk');

// Temat rozmowy: widoczny, dopóki nie zostanie poruszony (flaga), opcjonalnie z warunkiem
const topic = (text, to, req = {}) => go(text, to, { req: { ...req, notFlag: to }, effect: { flag: to } });

export default {
  mira_talk: sc(
    M,
    `Dotykasz wszczepu za uchem. Chip w kieszeni robi się ciepły, jakby ktoś po drugiej stronie wziął głęboki oddech.

    „Jestem” — mówi Mira. — „O czym chcesz pogadać?”`,
    [
      topic('„Jak to jest być w chipie?”', 'mt_chip'),
      topic('„Co pamiętasz z Doliny?”', 'mt_dolina'),
      topic('„Dlaczego właśnie ja?”', 'mt_why'),
      topic('„Czy ty śnisz?”', 'mt_dreams'),
      topic('„Co wiesz o Halcyonie?”', 'mt_halcyon'),
      topic('„Czego się boisz?”', 'mt_fear', { trust: 1 }),
      topic('„Opowiedz mi coś śmiesznego.”', 'mt_joke', { trust: 2 }),
      topic('„Pamiętasz Marka, syna Teodora?”', 'mt_teodor', { flag: 'met_teodor' }),
      topic('„Co sądzisz o Brunie?”', 'mt_bruno', { flag: 'asked_mira' }),
      topic('„Pchła chyba cię lubi.”', 'mt_pchla', { flag: 'pchla_met' }),
      topic('„Co myślisz o Szczurach?”', 'mt_rats', { flag: 'oko_quest' }),
      topic('„Boisz się Sokoła?”', 'mt_sokol', { flag: 'sokol_known' }),
      topic('„Opowiedz o babci.”', 'mt_babcia', { flag: 'mem1' }),
      topic('„Zaśpiewasz jej piosenkę?”', 'mt_song', { flag: 'mt_babcia' }),
      topic('„Opowiedz o Oli.”', 'mt_ola', { flag: 'mem2' }),
      topic('„Co czujesz do Wren?”', 'mt_wren', { flag: 'mem3' }),
      topic('„Wolisz imię Mira czy Hania?”', 'mt_name', { flag: 'mem3' }),
      topic('„Jak to jest znowu mieć siostrę?”', 'mt_sisters', { flag: 'sisters' }),
      topic('„Co będzie, kiedy to wszystko się skończy?”', 'mt_after', { flag: 'key' }),
      topic('„Jak ci się podoba Iglica?”', 'mt_city', { flag: 'in_iglica' }),
      topic('„Dlaczego w Dolinie zawsze pada?”', 'mt_rain'),
      topic('„Antoni i jego żona…”', 'mt_port', { flag: 'antoni' }),
      topic('„Jak się czułaś w piwnicy z rodzinami?”', 'mt_families', { flag: 'families' }),
      topic('„Sokół to Tomasz Lis.”', 'mt_sokol2', { flag: 'sokol_past' }),
      topic('„Co wiesz o prezesie Wolańskim?”', 'mt_prezes', { any: [{ flag: 'prezes_rumor' }, { flag: 'met_prezes' }] }),
      topic('„Co myślisz o Edwardzie?”', 'mt_edward', { flag: 'summit_key' }),
      topic('„Szczury i Kruki…”', 'mt_kruki', { any: [{ flag: 'kruki_peace' }, { flag: 'kruki_war' }] }),
      topic('„Kucharka Ewa była miła.”', 'mt_ewa', { flag: 'ic_ewa' }),
      topic('„Co wiesz o mamie Pchły?”', 'mt_pchla2', { flag: 'pc_talk' }),
      topic('„Jaką muzykę pamiętasz?”', 'mt_music', { flag: 'mt_song' }),
      topic('„Podoba ci się mój tatuaż?”', 'mt_tattoo', { flag: 'tattoo' }),
      topic('„Pamiętasz chłopca z myszą?”', 'mt_leon', { flag: 'leon' }),
      topic('„Spokój Premium w Iglicach…”', 'mt_premium', { flag: 'premium_rumor' }),
      topic('„Co sądzisz o Igle?”', 'mt_igla', { flag: 'igla_proof' }),
      topic('„Chcesz coś jeszcze powiedzieć?”', 'mt_thanks', { trust: 4 }),
      go('Zakończ rozmowę', '@return'),
    ]
  ),

  mt_chip: sc(
    M,
    `„Wyobraź sobie pokój bez ścian” — mówi Mira. — „Wszędzie wokół wiszą cudze wspomnienia. Ktoś je powiesił jak pranie na sznurku. Mogę dotknąć każdego, ale nie wiem, które jest moje.”

    „Najgorsze są noce. Wtedy wspomnienia szepczą. Czterech tysięcy ludzi naraz.”`,
    [go('„A teraz? Też szepczą?”', 'mt_chip2')]
  ),

  mt_chip2: sc(
    M,
    `Mira milczy chwilę.

    „Teraz słyszę głównie ciebie. Twój oddech, kroki, deszcz na twojej kurtce. To pomaga. To jest jak… jak latarnia na brzegu.”

    „Nie mów nikomu, że to powiedziałam. Brzmi strasznie ckliwie.”`,
    [back]
  ),

  mt_dolina: sc(
    M,
    `„Pamiętam zapach smażonej ryby przy wiadukcie. Kałuże, które nigdy nie wysychają. Pana od parasolek, który sprzedawał też gumę do żucia i plotki.”

    „Nie wiem, czy to moje wspomnienia, czy kogoś innego. Ale kiedy idziemy przez Dolinę, coś we mnie mówi: to dom.”`,
    [back]
  ),

  mt_why: sc(
    M,
    `„Szczerze? Przypadek” — mówi Mira. — „Bruno dał chip pierwszemu kurierowi, który odpisał. Gdyby odpisał ktoś inny, rozmawiałabym teraz z nim.”

    Po chwili dodaje ciszej: „Ale ty jako jedyna osoba zapytałaś, kim jestem. To już nie był przypadek.”`,
    [back]
  ),

  mt_dreams: sc(
    M,
    `„Śnię cudze sny” — odpowiada Mira. — „Wczoraj śniłam, że jestem rybakiem z Portu Południowego. Wypływałam łodzią we mgle. Przedwczoraj byłam małym chłopcem, który bał się burzy.”

    „Czasem budzę się i przez sekundę nie wiem, czy jestem rybakiem, chłopcem, czy sobą. A potem słyszę ciebie i wiem.”`,
    [back]
  ),

  mt_halcyon: sc(
    M,
    `„Halcyon zaczynał od filtrów do wody. Potem robili leki. Potem wszczepy. Teraz robią ludzi” — mówi Mira gorzko.

    „W Iglicy pracuje dwadzieścia tysięcy osób. Większość nie wie, co się dzieje na poziomie 210. Wren mówi im, że budują asystentów. Że to tylko dane.”`,
    [go('„A ty co o tym myślisz?”', 'mt_halcyon2')]
  ),

  mt_halcyon2: sc(
    M,
    `„Myślę, że dane mają imiona” — odpowiada Mira. — „Każde wspomnienie, które we mnie siedzi, ktoś kiedyś przeżył. Ktoś płakał na pogrzebie, ktoś całował się pod wiaduktem, ktoś pierwszy raz zobaczył morze.”

    „Halcyon zabrał im to wszystko i sprzeda jako funkcję premium.”`,
    [back]
  ),

  mt_fear: sc(
    M,
    `Mira długo nie odpowiada. Słyszysz tylko szum, jak w muszli przyłożonej do ucha.

    „Boję się, że Wren mnie wyczyści. Że zostanę tylko miłym głosem, który przypomina o spotkaniach i zamawia pizzę. Że będę żyć, ale nie będzie mnie.”

    „Jak Marek na Śluzie. Uśmiechnięta i pusta.”`,
    [
      go('„Nie pozwolę na to.”', 'mira_talk', { effect: { trust: 1, flag: 'promise_protect' } }),
      go('„Każdy się czegoś boi.”', 'mira_talk'),
    ]
  ),

  mt_joke: sc(
    M,
    `„Dobra, słuchaj” — Mira wyraźnie się ożywia. — „Przychodzi dron Halcyonu do baru. Barman pyta: co podać? Dron na to: skan twarzy, poproszę. Barman: u nas nie ma twarzy, sami bywalcy.”

    Cisza.

    „No dobra, to było słabe. Ale w środku się śmiejesz, słyszę twój puls.”

    Faktycznie, kąciki ust same ci drgnęły.`,
    [back]
  ),

  mt_teodor: sc(
    M,
    `„Marek grał na gitarze na dachu bloku siódmego” — mówi Mira cicho. — „Fałszował okropnie. Wszyscy na Śluzie go znali, bo grał zawsze tę samą piosenkę o łódce.”

    „Pamiętam to. Nie wiem, czy byłam wtedy na dachu, czy to wspomnienie kogoś z sąsiadów. Ale pamiętam.”

    „Jeśli nam się uda, może kiedyś znowu zagra.”`,
    [back]
  ),

  mt_bruno: sc(
    M,
    `„Bruno nie jest zły. Jest przestraszony” — mówi Mira. — „To gorzej, bo przestraszeni ludzie robią złe rzeczy dla dobrych powodów.”

    „Przychodził do mnie, kiedy jeszcze miałam ciało. Przynosił chipy do zapisania i zawsze kupował mi pączka. Z różowym lukrem. Zapomniał o tym, a ja pamiętam.”`,
    [back]
  ),

  mt_pchla: sc(
    M,
    `„Pchła to dobry dzieciak” — Mira się śmieje. — „Jego gołąb nagrał już pół Doliny. Gdyby Halcyon wiedział, ile ten mały wie, zatrudniłby go albo zamknął.”

    „Pilnuj go, dobrze? Dzieci w Dolinie dorastają za szybko.”`,
    [back]
  ),

  mt_rats: sc(
    M,
    `„Szczury to złodzieje, przemytnicy i oszuści” — mówi Mira. — „Ale kiedy powódź zalała Port Południowy, to oni pływali łodziami po ludzi. Halcyon w tym czasie wysłał drony, żeby policzyć straty.”

    „W Dolinie nie ma dobrych i złych. Są ci, którzy pomagają, i ci, którzy liczą straty.”`,
    [back]
  ),

  mt_sokol: sc(
    M,
    `„Boję się” — przyznaje Mira bez wahania. — „Sokół jest jak nóż: nie ma w nim nic poza ostrzem. Halcyon wymienił mu oko, a może też coś więcej.”

    „Ale wiesz, co jest dziwne? Kiedy Bruno o nim mówił, w moich wspomnieniach coś drgnęło. Ktoś z Doliny kiedyś go znał. Zanim został Sokołem.”`,
    [back]
  ),

  mt_babcia: sc(
    M,
    `„Kobieta z kuchni miała na imię Stefania. Teraz już wiem” — mówi Mira i jej głos mięknie. — „Gotowała rosół w każdą niedzielę, nawet kiedy nie było z czego. Wtedy był to rosół z jednej marchewki i dobrych chęci.”

    „Śpiewała przy kuchence. Zawsze tę samą piosenkę i zawsze fałszowała w tym samym miejscu.”`,
    [back]
  ),

  mt_song: sc(
    M,
    `Mira chrząka, choć nie ma gardła. Potem śpiewa cicho, trochę za nisko:

    „Płynie łódka po kałużach,
    w łódce sen i w łódce ja,
    deszcz nad miastem się nie skończy,
    ale łódka zawsze gra.”

    Fałszuje w trzecim wersie. Dokładnie tam, gdzie fałszowała babcia.

    „Dziękuję, że o to prosisz” — mówi potem. — „Pierwszy raz od roku coś jest tylko moje.”`,
    [go('Wróć do tematów', 'mira_talk', { effect: { trust: 1 } })]
  ),

  mt_ola: sc(
    M,
    `„Ola jest starsza o sześć lat. Kiedy mama odeszła, to ona mnie wychowała. Uczyła mnie lutować, kłamać nauczycielom i alfabetu Morse’a.”

    „Mówiła, że radio jest jak modlitwa dla ludzi, którzy nie wierzą w Boga. Nadajesz w ciemność i masz nadzieję, że ktoś słucha.”`,
    [go('„Myślisz, że ona wciąż słucha?”', 'mt_ola2')]
  ),

  mt_ola2: sc(
    M,
    `„Nie wiem. Rok to długo. Może myśli, że nie żyję. Może przestała szukać.”

    Głos Miry się łamie, cyfrowo, jak zakłócony sygnał.

    „Ale gdybym mogła wybrać jedną osobę na świecie, która by mnie usłyszała, to byłaby ona.”`,
    [back]
  ),

  mt_wren: sc(
    M,
    `„Najdziwniejsze jest to, że jej nie nienawidzę” — mówi Mira. — „Pamiętam jej ręce, kiedy podawała mi tablet. Drżały. Może wtedy jeszcze wiedziała, że robi coś złego.”

    „Ludzie w Iglicy nie są potworami. Po prostu nigdy nie stali w deszczu. A jak ktoś nigdy nie zmókł, to nie wierzy, że pada.”`,
    [back]
  ),

  mt_name: sc(
    M,
    `Mira długo się zastanawia.

    „Hania to dziewczyna, która kiedyś była. Mira to coś, co z niej zrobili. Nie wiem, którą jestem bardziej.”

    „A ty jak wolisz?”`,
    [
      go('„Będę mówić Hania.”', 'mira_talk', { effect: { flag: 'call_hania', trust: 1 } }),
      go('„Zostańmy przy Mirze. To ty ją wybrałaś.”', 'mira_talk'),
      go('„To twój wybór, nie mój.”', 'mira_talk', { effect: { trust: 1 } }),
    ]
  ),

  mt_sisters: sc(
    M,
    `„Dziwnie” — przyznaje Mira. — „Ola jest starsza, ma bliznę po oku, czyta mi w myślach przez kable. A jednocześnie nic się nie zmieniło. Wciąż mówi do mnie «mała».”

    „Wczoraj w nocy nadawała do mnie Morse’em przez dwie godziny. Same głupoty. Co jadła na obiad, jak się kłóci z sąsiadem z dołu.”

    „To było najpiękniejsze, co słyszałam od roku.”`,
    [back]
  ),

  mt_after: sc(
    M,
    `„Nie wiem” — mówi Mira. — „Nie mam ciała, do którego mogłabym wrócić. Halcyon spalił je w krematorium dla dawców, tak jest w regulaminie.”

    „Może będę mieszkać w Wieży z Olą. Może w sieci. Może w twoim komunikatorze, jeśli mnie nie wyrzucisz.”`,
    [
      go('„Znajdziemy ci nowe ciało.”', 'mt_after_body'),
      go('„Możesz zostać ze mną.”', 'mt_after_stay'),
      go('„Najpierw przeżyjmy jutro.”', 'mt_after_now'),
    ]
  ),

  mt_after_body: sc(
    M,
    `„Ciało z Iglicy? Syntetyczne, z gwarancją i w raty?” — Mira się śmieje. — „Brzmi jak reklama Halcyonu.”

    Po chwili poważnieje. „Ale dziękuję. Nikt jeszcze nie planował dla mnie przyszłości.”`,
    [back]
  ),

  mt_after_stay: sc(
    M,
    `Mira milczy tak długo, że sprawdzasz, czy chip jeszcze działa.

    „Uważaj, co mówisz” — odzywa się w końcu. — „Ja wszystko zapamiętuję. Dosłownie wszystko.”

    W jej głosie słychać uśmiech.`,
    [go('Wróć do tematów', 'mira_talk', { effect: { trust: 1, flag: 'promise_stay' } })]
  ),

  mt_after_now: sc(
    M,
    `„Rozsądnie” — przyznaje Mira. — „Kurierska filozofia: jedna przesyłka na raz.”

    „Dobrze. Najpierw jutro. Potem zobaczymy.”`,
    [back]
  ),

  mt_city: sc(
    M,
    `„Tu nawet powietrze jest drogie” — szepcze Mira. — „Czujesz? Pachnie jak nowe buty. Wszystko tu jest nowe i nic nie jest prawdziwe.”

    „Kwiaty na korytarzach są z plastiku. Okna pokazują niebo, które nagrano pięć lat temu, bo prawdziwe jest zbyt szare. Wolę Dolinę. Tam przynajmniej deszcz jest prawdziwy.”`,
    [back]
  ),
};
