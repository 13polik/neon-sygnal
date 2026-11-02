import { go, play, sc } from './_h.js';

// Prolog: zwykła noc kuriera, zanim zadzwoni Bruno
const P = 'Prolog · Kurier';

export default {
  pr_wake: sc(
    P,
    `Czwarta nad ranem. Budzik w kapsule piszczy tak samo jak wczoraj i przedwczoraj.

    Mieszkasz w Ulu, czterdziestopiętrowym bloku z kontenerów, gdzie każde mieszkanie ma dwa metry na trzy i okienko wielkości talerza. Na suficie kapsuły skrapla się para. Za ścianą ktoś kaszle.

    Nowa Wisła, rok 2091. Kolejny dzień pracy.`,
    [
      go('Sprawdź komunikator', 'pr_msgs'),
      go('Wyjrzyj przez okienko', 'pr_window'),
      go('Zjedz coś z automatu na korytarzu', 'pr_food'),
    ]
  ),

  pr_window: sc(
    P,
    `Przecierasz okienko rękawem. Dolina leży pod tobą jak rozbite akwarium: woda na ulicach, w wodzie neony, nad neonami deszcz.

    Wyżej, ponad chmurami, świecą Iglice. Szklane wieże korporacji, gdzie podobno nigdy nie pada. Między nimi przelatują drony Halcyonu, czerwone kropki na szarym niebie.

    Na dachu sąsiedniego kontenerowca ktoś hoduje gołębie. Jeden z nich mruga diodą.`,
    [
      go('Sprawdź komunikator', 'pr_msgs'),
      go('Zjedz coś z automatu', 'pr_food'),
    ]
  ),

  pr_food: sc(
    P,
    `Automat na korytarzu ma pęknięty ekran i trzy działające przyciski. Makaron instant, makaron instant ostry, makaron instant „jak u babci”.

    Wrzucasz kredyty. Automat mruczy, myśli i nic nie wydaje.`,
    [
      go('Kopnij automat', 'pr_food_kick'),
      go('Zapłać jeszcze raz (5 kr)', 'pr_food_eat', { effect: { credits: -5 } }),
    ]
  ),

  pr_food_kick: sc(
    P,
    `Kopiesz raz, porządnie, w lewy dolny róg. Tak jak uczył stary Wojtek z trzydziestego piętra, zanim się wyprowadził.

    Automat wypluwa dwa kubki naraz. „Jak u babci” i ostry. Dzisiaj szczęście jest po twojej stronie.

    Jesz na stojąco, patrząc, jak para z kubka miesza się z parą z rur.`,
    [go('Wróć do kapsuły po kurtkę', 'pr_msgs')]
  ),

  pr_food_eat: sc(
    P,
    `Za drugim razem automat łaskawie wydaje kubek. Makaron smakuje jak zawsze, czyli trochę jak tektura, a trochę jak dzieciństwo.

    Jesz na stojąco, patrząc, jak para z kubka miesza się z parą z rur.`,
    [go('Wróć do kapsuły po kurtkę', 'pr_msgs')]
  ),

  pr_msgs: sc(
    P,
    `Komunikator ma trzy nowe wiadomości.

    Pierwsza od aplikacji Kurierzy Dolina: „Zlecenie: insulina dla p. Teodora Wiśniewskiego, Szósta Śluza, blok 7. Wynagrodzenie: 40 kr. Termin: przed świtem.”

    Druga od nieznanego numeru, sam emotikon gołębia.

    Trzecia od Bruna, pasera z baru Pod Pompą: „Wpadnij wieczorem. Może coś będę miał.”`,
    [go('Przyjmij zlecenie i wyjdź', 'pr_corridor', { effect: { flag: 'job_teodor' } })]
  ),

  pr_corridor: sc(
    P,
    `Na schodach między trzydziestym dziewiątym a trzydziestym ósmym piętrem siedzi chłopak, może dwunastoletni. Ma za dużą kurtkę, gogle na czole i gołębia na kolanach.

    Gołąb jest z metalu i plastiku. Z jego brzucha wystaje kabel, a w oku miga dioda.

    „Ty jesteś kurier z czterdziestki, nie?” — pyta chłopak. — „Jestem Pchła. Mam info, jak ktoś potrzebuje.”`,
    [
      go('Daj mu 10 kr za informację', 'pr_pchla_info', { req: { credits: 10 }, effect: { credits: -10, flag: ['pchla_met', 'tip_post'] } }),
      go('Zapytaj o gołębia', 'pr_pchla_bird', { effect: { flag: 'pchla_met' } }),
      go('Minij go bez słowa', 'pr_stairs'),
    ]
  ),

  pr_pchla_bird: sc(
    P,
    `„To Kuba” — mówi Pchła z dumą i drapie gołębia po metalowej głowie. — „Złożyłem go z dronów, które Halcyon wyrzuca na śmietnik. Lata, nagrywa i wraca do domu. Prawie jak prawdziwy.”

    Kuba przekrzywia głowę i robi ci zdjęcie. Słychać ciche kliknięcie migawki.

    „Teraz już cię zna. Jak będziesz czegoś potrzebować, szukaj gołębnika na dachu przy Śluzie.”`,
    [
      go('Daj mu 10 kr za informację', 'pr_pchla_info', { req: { credits: 10 }, effect: { credits: -10, flag: 'tip_post' } }),
      go('Pożegnaj się i schodź na dół', 'pr_stairs'),
    ]
  ),

  pr_pchla_info: sc(
    P,
    `Pchła chowa monetę do buta i zniża głos.

    „Na Posterunku przy Śluzie postawili w nocy nowy skaner. Sprawdza twarze i licencje. Jak masz cokolwiek do ukrycia, idź przez bazar pod wiaduktem. Dłużej, ale bezpieczniej.”

    Kuba gruchnie metalicznie, jakby potwierdzał.`,
    [go('Podziękuj i schodź na dół', 'pr_stairs')]
  ),

  pr_stairs: sc(
    P,
    `Winda nie działa od marca. Schodzisz czterdzieści pięter, mijając drzwi, za którymi ktoś się kłóci, ktoś śpiewa, a ktoś płacze.

    Na dole czeka paczkomat Kurierów Dolina. Skrytka numer 12 otwiera się z sykiem. W środku mała, chłodna skrzynka z napisem INSULINA i czerwonym krzyżem.

    Na zewnątrz leje. Do Śluzy prowadzą dwie drogi.`,
    [
      go('Przez bazar pod wiaduktem', 'pr_bazar'),
      go('Główną ulicą przez Posterunek', 'pr_check'),
    ]
  ),

  pr_bazar: sc(
    P,
    `Bazar pod wiaduktem nigdy nie śpi. Stragany z częściami do wszczepów, pieczone kalmary na patyku, stare telewizory pokazujące reklamy sprzed lat. Ludzie przepychają się w wąskich przejściach pod plastikowymi płachtami.

    Ktoś ociera się o twoje ramię. Za mocno. Czujesz, jak skrzynka z insuliną wyślizguje się spod pachy.`,
    [
      play('Złap złodzieja za rękę', 'timing', 1, { to: 'pr_thief_caught', effect: { credits: 20 } }, { to: 'pr_thief_run' }),
      go('Krzyknij „złodziej!”', 'pr_thief_shout'),
    ]
  ),

  pr_thief_caught: sc(
    P,
    `Łapiesz chudy nadgarstek w ostatniej chwili. Złodziej to dzieciak w masce kruka. Wyrywa się, zostawia skrzynkę i znika między straganami.

    Sprzedawca kalmarów klaszcze. „Kruki! Plaga tego bazaru.” Wciska ci w rękę kilka kredytów. „Za to, że w końcu ktoś im dał popalić.”`,
    [go('Idź dalej', 'pr_bazar_out', { effect: { flag: 'kruki_met' } })]
  ),

  pr_thief_run: sc(
    P,
    `Złodziej jest szybszy. Biegniesz za nim między straganami, przewracasz kosz z kablami i w końcu dopadasz go przy schodach wiaduktu. To dzieciak w masce kruka.

    Rzuca skrzynką w kałużę i ucieka. Insulina jest cała, ale twoje kolano już nie bardzo.`,
    [go('Podnieś skrzynkę i idź dalej', 'pr_bazar_out', { effect: { flag: 'kruki_met' } })]
  ),

  pr_thief_shout: sc(
    P,
    `Krzyczysz na cały bazar. Nikt nawet nie odwraca głowy, ale złodziej się płoszy i rzuca skrzynkę pod stragan z ryżem.

    Starsza sprzedawczyni podaje ci ją bez słowa. Na jej przedramieniu widzisz tatuaż: kruk z rozłożonymi skrzydłami, przekreślony grubą kreską.`,
    [go('Podziękuj i idź dalej', 'pr_bazar_out', { effect: { flag: 'kruki_met' } })]
  ),

  pr_bazar_out: sc(
    P,
    `Przy wyjściu z bazaru siedzi kobieta w chustce, przed nią karty i kryształowa kula z podświetleniem LED. Szyld nad jej głową głosi: MADAME ZUZANNA. PRZYSZŁOŚĆ OD 5 KR.

    „Kurier!” — woła za tobą. — „Dziś za darmo. Twoja następna przesyłka nie będzie tym, czym się wydaje. Będzie mówić.”

    Śmieje się chrapliwie. Idziesz dalej, ale jej słowa zostają w głowie jak drzazga.`,
    [go('Idź na Szóstą Śluzę', 'pr_sluza')]
  ),

  pr_check: sc(
    P,
    `Posterunek Halcyonu to biały kontener z czerwonym światłem na dachu i szlabanem, który przegradza ulicę. Nad szlabanem wisi nowy dron skanujący, jeszcze z folią ochronną na jednym skrzydle.

    Strażnik w białym płaszczu przeciwdeszczowym ziewa i macha na ciebie ręką.`,
    [
      go('Pokaż licencję kuriera', 'pr_check_ok', { effect: { heat: 5 } }),
      go('Wsuń mu 20 kr w dłoń', 'pr_check_ok', { req: { credits: 20 }, effect: { credits: -20 } }),
      play('Przemknij bokiem, kiedy dron się obraca', 'timing', 1, { to: 'pr_check_sneak' }, { to: 'pr_check_caught', effect: { heat: 15, credits: -30 } }),
    ]
  ),

  pr_check_ok: sc(
    P,
    `Dron przesuwa czerwony promień po twojej twarzy. Coś piszczy, coś mruga. Strażnik patrzy na ekran, potem na ciebie, potem znowu na ekran.

    „Kurier. Insulina. Przechodzić.” Szlaban unosi się powoli. Gdzieś w bazie Halcyonu właśnie pojawił się nowy wpis z twoją twarzą.`,
    [go('Idź na Szóstą Śluzę', 'pr_sluza')]
  ),

  pr_check_sneak: sc(
    P,
    `Czekasz, aż dron obróci się w stronę ciężarówki z rybami. Trzy kroki, schylasz się pod szlabanem i już jesteś po drugiej stronie.

    Strażnik nawet nie podnosi głowy znad kubka z kawą. Najlepsza ochrona to taka, której się nie chce.`,
    [go('Idź na Szóstą Śluzę', 'pr_sluza')]
  ),

  pr_check_caught: sc(
    P,
    `Dron obraca się szybciej, niż się spodziewasz. Czerwone światło, alarm, strażnik wylewa kawę na płaszcz.

    „Mandat za omijanie kontroli. Trzydzieści kredytów. Płatne od ręki.” Ściąga ci pieniądze z konta jednym dotknięciem tabletu. „I uśmiechnij się, jesteś w systemie.”`,
    [go('Idź na Szóstą Śluzę', 'pr_sluza')]
  ),

  pr_sluza: sc(
    P,
    `Szósta Śluza to sześć starych bloków wokół dawnego zbiornika retencyjnego. Kiedyś mieszkali tu robotnicy z wodociągów. Teraz mieszkają tu wszyscy, na których nie stać nigdzie indziej.

    W wielu oknach świecą niebieskie ekrany. Przed nimi siedzą ludzie i się uśmiechają. Nie ruszają się.

    W drzwiach bloku 7 stoi starsza kobieta w chustce i patrzy na ciebie podejrzliwie.`,
    [go('„Szukam pana Teodora Wiśniewskiego.”', 'pr_halina')]
  ),

  pr_halina: sc(
    P,
    `„Teodor? Trzecie piętro” — mówi kobieta. — „Ja jestem Halina, mieszkam naprzeciwko. Niech pan… niech się kurier nie dziwi temu, co zobaczy u niego.”

    Prowadzi cię po schodach pachnących kapustą i wilgocią. Za jednymi drzwiami gra telewizor, za innymi panuje cisza. Taka gęsta, że aż dzwoni w uszach.`,
    [go('Zapukaj do Teodora', 'pr_teodor', { effect: { flag: 'met_halina' } })]
  ),

  pr_teodor: sc(
    P,
    `Teodor jest chudy jak wieszak, ma ręce poplamione smarem i oczy, które dawno nie spały. Bierze skrzynkę z insuliną, jakby była ze złota.

    Za jego plecami, w pokoju, siedzi młody mężczyzna przed ekranem. Uśmiecha się. Nie mruga. Na stoliku obok stygnie nietknięta herbata.

    „To mój syn, Marek” — mówi Teodor cicho. — „Pół roku temu wziął Spokój.”`,
    [
      go('„Co to jest Spokój?”', 'pr_marek'),
      go('Poproś o zapłatę', 'pr_pay'),
    ]
  ),

  pr_marek: sc(
    P,
    `„Darmowy wszczep od Halcyonu. Na bezsenność” — Teodor mówi to tak, jak mówi się nazwę choroby. — „Rozdawali na Śluzie w przychodni, z ulotkami i balonami. Marek nie spał od śmierci matki. Poszedł pierwszy.”

    „Mówili, że będzie spał lepiej. I śpi. Tylko że już się nie budzi. Je, jak mu podam. Oddycha. Patrzy w ekran. Ale jego tam nie ma.”

    Marek uśmiecha się do ekranu, na którym nic nie ma. Tylko niebieskie światło.`,
    [go('Poproś o zapłatę', 'pr_pay', { effect: { flag: 'met_teodor' } })]
  ),

  pr_pay: sc(
    P,
    `Teodor przeszukuje kieszenie, szufladę, puszkę po herbacie. Wysypuje na stół monety i stary chip kredytowy.

    „Dwadzieścia. Mam dwadzieścia. Reszta w przyszłym tygodniu, przysięgam.” Patrzy w podłogę. Na jego nadgarstku tyka stary mechaniczny zegarek, pewnie jedyna cenna rzecz w tym mieszkaniu.`,
    [
      go('Weź dwadzieścia', 'pr_home', { effect: { credits: 20 } }),
      go('„Niech pan zatrzyma. Na lekarstwa.”', 'pr_home', { effect: { flag: 'kind_teodor' } }),
      go('Weź dwadzieścia i zegarek', 'pr_home', { effect: { credits: 20, flag: 'watch' } }),
    ]
  ),

  pr_home: sc(
    P,
    `Wracasz przez Dolinę, kiedy niebo zaczyna szarzeć. Świt w Nowej Wiśle to tylko inny odcień deszczu.

    Przez cały dzień śpisz, budzisz się, robisz dwa małe zlecenia i znowu śpisz. Ale uśmiech Marka nie chce wyjść ci z głowy.

    Zbliża się wieczór.`,
    [go('Doczekaj wieczoru', 'pr_evening')]
  ),
};
