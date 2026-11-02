import { go, play, sc } from './_h.js';

// Kolejne zlecenia z tablicy w Ulu
const U = 'Dolina · Zlecenie';
const home = go('Wróć do kapsuły', 'ul_hub');

export default {
  // Ryby dla pana Lina
  job_fish: sc(
    U,
    `Zlecenie od pana Lina z bazaru: „Odebrać skrzynkę ryb od Szczurów przy pompowni. Dowieźć świeże. Płacę makaronem i kredytami.”

    Skrzynka czeka przy pompowni, owinięta w mokrą gazetę. Śmierdzi rybą i obietnicą dobrej zupy. Od Szczurów do bazaru idzie się przez ulicę, na której właśnie patroluje dron.`,
    [
      play('Przemknij obok drona', 'timing', 1, { to: 'job_fish_ok' }, { to: 'job_fish_late', effect: { heat: 10 } }),
      go('Obejdź dookoła, wolniej', 'job_fish_late'),
    ]
  ),

  job_fish_ok: sc(
    U,
    `Pan Lin otwiera skrzynkę, wącha ryby z miną sommeliera i kiwa głową.

    „Świeże. Dzisiejsze. Rzadkość w Dolinie.” Wciska ci w ręce miskę zupy i trzydzieści kredytów. „Jak będziesz chcieć, mam dla ciebie stałą robotę. Ryby we wtorki i piątki.”`,
    [go('Zjedz zupę', 'ul_hub', { effect: { credits: 30, hp: 1 } })]
  ),

  job_fish_late: sc(
    U,
    `Kiedy docierasz na bazar, ryby są już ciepłe, a pan Lin marszczy nos.

    „Wczorajsze. Jutro będą przedwczorajsze.” Ale płaci, bo pan Lin zawsze płaci. „Zrobię z nich pastę. Z pasty jeszcze nikt nie umarł. Prawie nikt.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 20 } })]
  ),

  // Prochy do morza
  job_ashes: sc(
    U,
    `Najdziwniejsze zlecenie od miesięcy. Urna z prochami i list od zleceniodawczyni: „Mój mąż był rybakiem w Porcie. Chciał spocząć w morzu. Ja już nie mam siły tam płynąć. Proszę, zrób to za mnie. Leokadia Rybak.”

    Do morza najbliżej z Portu Południowego, a do Portu dopłynąć można tylko łodzią Szczurów.`,
    [
      go('Popłyń ze Szczurami do portu', 'job_ashes2', { req: { flag: 'lamp' } }),
      go('Rozsyp prochy w kanale przy Ulu', 'job_ashes_canal'),
    ]
  ),

  job_ashes2: sc(
    U,
    `Mały wiosłuje w milczeniu aż za ostatni dźwig portowy, tam, gdzie zaczyna się prawdziwe morze. Szare, ciężkie, ale prawdziwe.

    Otwierasz urnę. Wiatr porywa popiół i niesie go nad falami jak mgłę.

    Mira mówi cicho: „Każdy powinien mieć prawo do takiego pożegnania. Ja swojego ciała nawet nie widziałam.”`,
    [go('Wróć do Doliny', 'job_ashes_done')]
  ),

  job_ashes_canal: sc(
    U,
    `Rozsypujesz prochy w kanale za Ulem. Woda niesie je w stronę kratki ściekowej.

    To nie morze. Ale kanał płynie do rzeki, rzeka do portu, a port do morza. Kiedyś tam dotrą.

    Mira nic nie mówi. Ty też nie.`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 20 } })]
  ),

  job_ashes_done: sc(
    U,
    `Zleceniodawczyni płaci ci podwójnie, choć nie prosisz. Na koniec ściska ci dłoń.

    „Pięćdziesiąt lat żyliśmy razem w Dolinie. Pięćdziesiąt lat deszczu. A on zawsze mówił, że gdzieś za chmurami jest słońce.” Uśmiecha się przez łzy. „Mam nadzieję, że tam, gdzie popłynął, świeci.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 60, trust: 1 } })]
  ),

  // Prezent dla dziecka z Iglic
  job_gift: sc(
    U,
    `Zlecenie z wyższego poziomu: „Dostarczyć prezent urodzinowy na stację Iglica-Wschód. Odbiorca: Leon, 8 lat. Nadawca: tata.”

    Prezent to pudełko z dziurkami. W środku coś szeleści.`,
    [
      go('Zajrzyj przez dziurki', 'job_gift2'),
      go('Jedź prosto na stację', 'job_gift3'),
    ]
  ),

  job_gift2: sc(
    U,
    `Przez dziurki patrzy na ciebie para paciorkowatych oczu. Mysz. Prawdziwa, żywa, biała mysz z różowym nosem.

    Mira się zachwyca: „Prawdziwe zwierzę! W Iglicach nie ma prawdziwych zwierząt. Mają tylko holograficzne koty, które nie drapią.”`,
    [go('Jedź na stację', 'job_gift3')]
  ),

  job_gift3: sc(
    U,
    `Na peronie Iglica-Wschód czeka chłopiec w szkolnym mundurku i niania-robot. Chłopiec otwiera pudełko i krzyczy z radości.

    „Prawdziwa! Tata obiecał, że prawdziwa!” Patrzy na ciebie. „Ty jesteś z dołu? Tata mówi, że na dole mieszkają sami źli ludzie. Ale ty wcale nie wyglądasz groźnie.”`,
    [
      go('„Na dole mieszkają zwykli ludzie. Tacy jak ty.”', 'job_gift4'),
      go('Uśmiechnij się i odejdź', 'job_gift_done'),
    ]
  ),

  job_gift4: sc(
    U,
    `Leon zastanawia się nad tym bardzo poważnie, jak potrafią tylko ośmiolatki.

    „To dlaczego wy jesteście na dole, a my na górze?”

    Niania-robot ciągnie go za rękę do windy, zanim zdążysz odpowiedzieć. Ale chłopiec ogląda się jeszcze przez ramię, z myszą przyciśniętą do piersi.`,
    [go('Wróć do Doliny', 'job_gift_done', { effect: { trust: 1, flag: 'leon' } })]
  ),

  job_gift_done: sc(
    U,
    `Kolejką wracasz do Doliny. Za oknem słońce znika pod chmurami jak moneta w automacie.

    Zapłata przychodzi, zanim dojedziesz. Sto kredytów, dużo za mysz. W Iglicach nikt nie liczy drobnych.`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 100 } })]
  ),

  // Sąsiedzi w Ulu
  ul_wojtek: sc(
    'Dolina · Ul',
    `Na trzydziestym piętrze wpadasz na starego Wojtka, tego od kopania automatów. Wrócił do Ula po roku. Ma nowe buty i stare oczy.

    „Byłem na górze, w Iglicy” — mówi. — „Dostałem pracę przy sprzątaniu. Rok wytrzymałem.” Kręci głową. „Tam nikt nie kopie automatów, wiesz? Jak automat nie działa, dzwonią po serwis i czekają. Czekają i się uśmiechają. Nie dało się żyć.”`,
    [
      go('„A jak tam naprawdę jest?”', 'ul_wojtek2'),
      home,
    ]
  ),

  ul_wojtek2: sc(
    'Dolina · Ul',
    `Wojtek zapala papierosa i długo milczy.

    „Pięknie. Czysto. Słońce co rano. I wszyscy mają ten sam wszczep do snu. Spokój Premium, w abonamencie. Nie ten darmowy dla Doliny, tylko lepszy, droższy. Śpią po osiem godzin jak dzieci.”

    „Tylko że nikt nie pamięta, co mu się śniło. Nikt. Nigdy.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { flag: 'premium_rumor' } })]
  ),
};
