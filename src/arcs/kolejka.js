import { go, play, route, sc } from './_h.js';

// Rozdział 3: rozmowy w kolejce i kładka serwisowa nad chmurami
const T = 'Rozdział 3 · Kolejka';
const L = 'Rozdział 3 · Kładka';

export default {
  // Spokojna jazda zamienia się w rozmowę ze współpasażerem
  train_calm: sc(
    T,
    `Kolejka sunie w górę. Za oknem Dolina zamienia się w świecącą plamę, a potem znika pod chmurami. Tutaj świeci słońce. Znasz je tylko z reklam.

    W wagonie siedzi tylko jeden pasażer: starszy mężczyzna w kombinezonie konserwatora, z termosem na kolanach. Patrzy na ciebie z ciekawością.

    Mira odzywa się cicho: „Jeśli mnie oddasz, nie będę pamiętać, że kiedyś byłam kimś.”`,
    [
      go('Przysiądź się do konserwatora', 'tr_edward'),
      go('Patrz w okno', 'tr_window'),
    ]
  ),

  tr_window: sc(
    T,
    `Słońce. Prawdziwe, oślepiające, ciepłe przez szybę. Mrużysz oczy i nie możesz przestać patrzeć.

    Pod tobą chmury wyglądają jak wata. Nad chmurami sterczą Iglice, dziesiątki szklanych wież połączonych kładkami. Między nimi przelatują ptaki. Prawdziwe ptaki, białe.

    „Pchła by oszalał” — szepcze Mira.`,
    [
      go('Przysiądź się do konserwatora', 'tr_edward'),
      go('Wysiądź na poziomie 210', 'iglica_intro'),
    ]
  ),

  tr_edward: sc(
    T,
    `„Edward” — przedstawia się mężczyzna i nalewa ci herbaty z termosu, nie pytając, czy chcesz. — „Konserwator wind. Trzydzieści lat w Iglicy. Jeżdżę tą kolejką codziennie, z Doliny i do Doliny.”

    „Mieszkasz na dole, a pracujesz na górze?” — dziwisz się.

    „Ktoś musi” — wzrusza ramionami. — „Państwo z Iglic nie naprawiają wind sami. Za dużo myślą, za mało robią.”`,
    [
      go('„Jak tam jest, w środku?”', 'tr_edward2'),
      go('„Słyszał pan o Spokoju?”', 'tr_edward3'),
      go('„W Porcie czeka na pana córka. I Szymon.”', 'tr_edward_d', { req: { flag: 'edward_daughter' } }),
    ]
  ),

  tr_edward2: sc(
    T,
    `„Czysto. Cicho. Wszyscy się uśmiechają i nikt nikogo nie zna” — Edward pije herbatę. — „Ludzie mieszkają tam latami i nie wiedzą, jak ma na imię sąsiad zza ściany. Za to wiedzą, ile zarabia.”

    „Ale windy mają piękne. Szybkie jak myśl. Na poziomie 210 jest winda serwisowa, której nikt nie używa, bo prowadzi prosto na szczyt, do prezesa. Klucz mam ja. I jeszcze dwie osoby.”`,
    [go('„Kto jeszcze ma klucz?”', 'tr_edward4')]
  ),

  tr_edward3: sc(
    T,
    `Edward odstawia kubek. Jego twarz tężeje.

    „Mój wnuk wziął Spokój. W Porcie Południowym rozdawali. Siedzi teraz przed ekranem i się uśmiecha. Córka go karmi łyżeczką.”

    „Ja naprawiam windy ludziom, którzy to zrobili. Codziennie. I nic nie mówię, bo jak powiem, stracę pracę, a córka nie ma z czego żyć.”`,
    [go('„Może jest sposób, żeby to zmienić.”', 'tr_edward4')]
  ),

  tr_edward_d: sc(
    T,
    `Edward odstawia termos tak gwałtownie, że herbata wylewa mu się na kolana. Nawet tego nie zauważa.

    „W Porcie? U nich?” Głos mu drży. „Beata mówi, że nie muszę się wstydzić? Że mam przyjechać?”

    Kiwasz głową. Edward zasłania twarz dłońmi i przez chwilę siedzi tak bez ruchu, a kolejka sunie nad chmurami.`,
    [go('Poczekaj, aż się uspokoi', 'tr_edward4', { effect: { trust: 1 } })]
  ),

  tr_edward4: sc(
    T,
    `Edward patrzy na ciebie długo. Potem, jakby podjął decyzję, wyjmuje z kieszeni kombinezonu mały, mosiężny klucz na sznurku.

    „Winda serwisowa na szczyt. Panel za automatem z kawą w stołówce na 210. Klucz ma prezes, szef ochrony i ja.”

    „Nie wiem, kim jesteś ani co wieziesz. Ale jak już masz coś zmienić, to zmień to na samej górze.”`,
    [go('Weź klucz', 'tr_arrive', { effect: { flag: 'summit_key' } })]
  ),

  tr_arrive: sc(
    T,
    `Kolejka hamuje miękko. Poziom 210. Edward wysiada pierwszy i nie ogląda się za siebie.

    Drzwi wagonu rozsuwają się na peron z białego marmuru. Pachnie tu jak w nowym samochodzie. Z głośników płynie cicha muzyka bez melodii.`,
    [go('Wysiądź na poziomie 210', 'iglica_intro')]
  ),

  // Kładka serwisowa: po ostrzeżeniu Bruna albo ucieczce przed Sokołem
  train_warned: sc(
    T,
    `Pamiętasz ostrzeżenie Bruna. Na Iglicy-Wschód, stację przed celem, wysiadasz.

    Przez szybę następnego wagonu widzisz szary płaszcz i czerwony błysk wszczepu. Sokół czeka na peronie na kogoś, kto nie przyjedzie.

    Z Iglicy-Wschód do twojego celu prowadzi tylko kładka serwisowa. Trzysta metrów nad chmurami.`,
    [go('Wejdź na kładkę', 'kl_start')]
  ),

  agent_avoid: sc(
    T,
    `Drzwi otwierają się na Iglicy-Wschód. Wyskakujesz w ostatniej chwili, zanim Sokół zdąży zrobić krok. Przez szybę widzisz jego wściekłą twarz, gdy kolejka odjeżdża.

    Bruno miał rację. Teraz zostaje ci tylko kładka serwisowa.`,
    [go('Wejdź na kładkę', 'kl_start')]
  ),

  kl_start: sc(
    L,
    `Kładka to stalowa kratownica szeroka na metr, z barierkami do pasa. Pod nią nie ma nic. Tylko chmury, białe i gęste, a pod chmurami gdzieś daleko Dolina.

    Wiatr szarpie kurtką. Na drugim końcu, trzysta metrów dalej, majaczą drzwi z napisem SERWIS 210.

    Mira szepcze: „Nie patrz w dół. Ja patrzę za ciebie. Jest bardzo, bardzo daleko.”`,
    [
      go('Idź powoli, trzymając się barierki', 'kl_mid'),
      play('Biegnij, zanim wiatr się wzmoże', 'timing', 2, { to: 'kl_gate' }, { to: 'kl_slip', effect: { hp: -1 } }),
    ]
  ),

  kl_mid: sc(
    L,
    `W połowie kładki wiatr nagle cichnie. Słychać tylko brzęczenie stalowych lin. Chmury pod tobą rozstępują się na chwilę.

    W dziurze widać Dolinę. Malutką, jak zabawkę. Śluzę, Wieżę Radiową, bazar pod wiaduktem. Gdzieś tam pani Halina parzy herbatę, a Pchła karmi gołębie.

    „Stąd wygląda tak spokojnie” — mówi Mira. — „Z góry nikt nie widzi kałuż.”`,
    [go('Idź dalej', 'kl_gate')]
  ),

  kl_slip: sc(
    L,
    `Podmuch wiatru uderza w ciebie jak pięść. Noga ześlizguje się z mokrej kratownicy i przez sekundę wisisz nad pustką, trzymając się barierki jedną ręką.

    Podciągasz się, zdzierając skórę z dłoni. Leżysz na kładce, ciężko oddychając, a serce wali jak młot.

    „Żyjesz?” — pyta Mira. — „Powiedz, że żyjesz.”`,
    [go('„Żyję.” Wstań i idź dalej', 'kl_gate')]
  ),

  kl_gate: sc(
    L,
    `Drzwi z napisem SERWIS 210 są zamknięte na czytnik kart. Nad nimi kamera. Czerwona dioda mruga leniwie.`,
    [
      go('Użyj przepustki serwisowej od Bruna', 'kl_pass', { req: { flag: 'service_pass' } }),
      play('Zhakuj czytnik', 'hack', 2, { to: 'kl_in' }, { to: 'kl_alarm', effect: { heat: 20 } }),
    ]
  ),

  kl_pass: sc(
    L,
    `Czytnik mruga na zielono. „Witamy, dostawco. Miłego dnia” — mówi syntetyczny głos.

    Kamera nad drzwiami nawet się nie obraca. Przepustka Bruna sprzed lat wciąż działa. W Iglicy nikt nie sprząta starych uprawnień.`,
    [go('Wejdź do środka', 'iglica_intro', { effect: { heat: -10 } })]
  ),

  kl_in: sc(
    L,
    `Czytnik poddaje się z cichym pyknięciem. Drzwi otwierają się na wąski korytarz serwisowy pełen rur i kabli.

    Za tobą wiatr trzaska drzwiami. Przed tobą poziom 210.`,
    [go('Wejdź do środka', 'iglica_intro')]
  ),

  kl_alarm: sc(
    L,
    `Czytnik piszczy przeraźliwie. Kamera obraca się na ciebie i robi zdjęcie z fleszem.

    Drzwi i tak się otwierają, bo system bezpieczeństwa najpierw wpuszcza, a potem raportuje. Masz kilka minut przewagi, zanim ochrona przeczyta raport.`,
    [go('Wbiegnij do środka', 'iglica_intro')]
  ),

  // Przekierowanie wejścia do Iglicy: kładka prowadzi przez serwis
  train: route(
    { if: { heat: 50 }, to: 'train_agent' },
    { if: { flag: 'sokol_known' }, to: 'train_warned' },
    { to: 'train_calm' }
  ),
};
