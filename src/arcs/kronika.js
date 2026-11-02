import { go, route, sc } from './_h.js';

// Kronika Doliny: krótkie sceny w epilogach Imienia i Neon Sygnału.
// Każda pojawia się tylko wtedy, gdy wcześniej udało się komuś pomóc.
const E = 'Epilog · Kronika Doliny';

// Wpis kroniki: scena pokazywana przy danej fladze, potem następny wpis
const ENTRIES = [
  ['job_ring', 'kk_ring'],
  ['letter_read', 'kk_letter'],
  ['leon', 'kk_leon'],
  ['job_cat', 'kk_cat'],
  ['mech_chip', 'kk_mech'],
  ['preach', 'kk_preach'],
  ['tattoo', 'kk_tattoo'],
  ['lin_story', 'kk_lin'],
  ['ic_ewa', 'kk_ewa'],
  ['edward_daughter', 'kk_edward'],
  ['kruki_peace', 'kk_gawron'],
  ['ln_basia', 'kk_basia'],
  ['marek_bike', 'kk_bike'],
  ['kids_help', 'kk_kids'],
  ['pigeon_named', 'kk_pigeon'],
];

const steps = {};
ENTRIES.forEach(([flag, scene], i) => {
  const nextStep = i + 1 < ENTRIES.length ? `kk_${i + 1}` : 'kk_end';
  steps[`kk_${i}`] = route({ if: { flag }, to: scene }, { to: nextStep });
  steps[`${scene}_next`] = nextStep;
});
const next = (scene) => go('Dalej', steps[`${scene}_next`]);

export default {
  kk_start: sc(
    E,
    `Mijają tygodnie. Dolina wciąż moknie, ale coś się w niej zmieniło. Ludzie częściej podnoszą głowy znad kałuż.

    Kurierzy roznoszą nie tylko paczki, ale też plotki. A plotek jest teraz dużo, i większość jest dobra.`,
    [go('Posłuchaj plotek', 'kk_0')]
  ),

  ...Object.fromEntries(Object.entries(steps).filter(([k]) => !k.endsWith('_next'))),

  kk_end: route({ if: { flag: 'sisters' }, to: 'ep_name_8' }, { to: 'ep_signal_3' }),

  kk_ring: sc(
    E,
    `Pod wiaduktem odbywa się ślub. Kasia z fioletowymi włosami i Tomek w okularach, z pierścionkiem w kształcie łódki na palcu.

    Wesele jest w budce z ramenem. Szef kuchni płacze do garnka. Tomek mówi przysięgę tak cicho, że nikt nie słyszy, ale Kasia słyszy i to wystarcza.

    Na stole leży jedna wolna miska, z karteczką: „Dla kuriera. Bez ciebie by nie było”.`,
    [next('kk_ring')]
  ),

  kk_letter: sc(
    E,
    `Na ulicy Kanałowej 3 pali się światło do późna. Adam Rybak przyjechał z poziomu 160 na święta. Pierwszy raz od dwunastu lat.

    Pani Leokadia smaży racuchy, a syn siedzi przy stole i płacze nad talerzem, bo smakują dokładnie tak, jak w jego snach.

    „Zostanę dłużej” — mówi. — „Może na zawsze. Tu przynajmniej wiem, że sny są moje.”`,
    [next('kk_letter')]
  ),

  kk_leon: sc(
    E,
    `Na peronie w Dolinie wysiada chłopiec w szkolnym mundurku, z klatką w ręku. W klatce biała mysz z różowym nosem.

    Leon przyjechał bez niani-robota. Bez pozwolenia. Bo chciał zobaczyć, jak naprawdę wyglądają ludzie z dołu.

    Pan Lin częstuje go makaronem. Pchła pokazuje mu gołębie. Pod wieczór Leon nie chce wracać na górę.`,
    [next('kk_leon')]
  ),

  kk_cat: sc(
    E,
    `Pimpek z kapsuły 4012 znowu znika. Tym razem cały Ul szuka go razem: pani Zofia w szlafroku w flamingi, Wojtek z trzydziestki, dzieciaki z piętra dwudziestego.

    Znajdują go na dachu, przy kratce wentylatora. Śpi na kurtce, którą ktoś tam zostawił.

    To twoja kurtka. Pani Zofia pierze ją i oddaje z konfiturami.`,
    [next('kk_cat')]
  ),

  kk_mech: sc(
    E,
    `Złota Rączka buduje dla Pchły nowego gołębia. Różowego, ze świecącymi oczami i małym głośnikiem w brzuchu.

    „Prototyp” — mówi z dumą. — „Mieści pół terabajta i jeden głos.”

    Gołąb otwiera dziób i mówi głosem Hani: „Tylko nie każcie mi gruchać.”`,
    [next('kk_mech')]
  ),

  kk_preach: sc(
    E,
    `Pewnego ranka chmury nad bazarem rozstępują się na całe trzy minuty. Na Dolinę pada słońce.

    Kaznodzieja Wiecznego Deszczu stoi na swojej skrzynce z otwartymi ustami i opuszczonym parasolem.

    Potem chmury wracają. Kaznodzieja ogłasza nowy dogmat: „Deszcz oddał, co zabrał. Teraz czas na słońce. Ale nie za często, żeby się nie przyzwyczaić.”`,
    [next('kk_preach')]
  ),

  kk_tattoo: sc(
    E,
    `Igor ma kolejkę na trzy tygodnie do przodu. Wszyscy chcą ten sam tatuaż: antenę i napis WIEŻA, tuszem świecącym w ciemności.

    W nocy na bazarze pod wiaduktem świecą setki przedramion. Wygląda to jak rój świetlików.

    „Dzięki tobie mam najlepszy sezon w życiu” — mówi Igor i macha na ciebie igłą.`,
    [next('kk_tattoo')]
  ),

  kk_lin: sc(
    E,
    `Budka pana Lina obchodzi pięćdziesiąte urodziny. Pan Lin gotuje makaron dla całego bazaru, za darmo, od rana do nocy.

    Ludzie przynoszą mu prezenty: nowy garnek, nowy parasol, zdjęcie budki sprzed pół wieku, kiedy wiadukt był jeszcze nowy.

    Pan Lin płacze tylko raz, kiedy Dolina śpiewa mu „Sto lat”. Fałszuje cała Dolina, ale nikt się nie przejmuje.`,
    [next('kk_lin')]
  ),

  kk_ewa: sc(
    E,
    `Kucharka Ewa rzuca pracę w stołówce na poziomie 210 i wraca do Portu Południowego. Na dachu zatopionego biurowca otwiera jadłodajnię dla wszystkich.

    Zupę stawia na stole każdemu, kto wygląda na zmęczonego. Pyta każdego o imię i każde zapamiętuje.

    Jej siostra, która kiedyś wzięła Spokój, kroi chleb obok niej.`,
    [next('kk_ewa')]
  ),

  kk_edward: sc(
    E,
    `Edward, konserwator wind, przyjeżdża do Portu Południowego. Pierwszy raz od pół roku.

    Beata otwiera mu drzwi łodzi bez słowa. Szymon siedzi na pokładzie i mruży oczy od światła. Już nie przed ekranem.

    „Dziadku” — mówi chrapliwie. — „Gdzie byłeś?”

    Edward nie umie odpowiedzieć. Po prostu siada obok i trzyma wnuka za rękę, aż zajdzie słońce.`,
    [next('kk_edward')]
  ),

  kk_gawron: sc(
    E,
    `Syn Gawrona budzi się w czwartek rano. Pierwsze, o co pyta, to czy Kruki dalej biją się ze Szczurami.

    „Nie” — mówi Gawron. — „Teraz pływamy razem.”

    Chłopak nie wierzy, dopóki nie zobaczy, jak jego ojciec i Kret wiosłują w jednej łodzi i kłócą się o to, kto wiosłuje krzywo.`,
    [next('kk_gawron')]
  ),

  kk_basia: sc(
    E,
    `Pani Basia z pralni wiesza nad ladą nowy szyld, wymalowany ręcznie: „TU SIĘ ZACZĘŁO”.

    Turyści z Iglic przyjeżdżają robić sobie zdjęcia przy pralce, pod którą siedział kurier z chipem. Pani Basia bierze od nich pięć kredytów za wstęp.

    Dla ludzi z Doliny wstęp jest za darmo. Pranie też.`,
    [next('kk_basia')]
  ),

  kk_bike: sc(
    E,
    `Na podwórku na Śluzie Marek siedzi na swoim starym motorze kurierskim. Teodor naprawiał go co tydzień przez rok.

    Silnik zaskakuje za pierwszym razem. Marek robi rundkę dookoła podwórka, powoli, ostrożnie, a cała Śluza wychodzi na balkony i bije brawo.

    Potem oddaje ci kluczyk. „Pożycz jeszcze trochę. Ja na razie muszę się nauczyć chodzić.”`,
    [next('kk_bike')]
  ),

  kk_kids: sc(
    E,
    `Dzieciaki w maskach kruków nie kradną już na bazarze. Teraz są kurierami. Roznoszą paczki za grosze, ale uczciwie.

    Najmniejsza, ta z warkoczykami, podchodzi do ciebie z dumą. „Mam pierwszą licencję! Prawdziwą, nie od Sroki!”

    Na plecaku ma przyszytą naszywkę: antenę i słowo WIEŻA.`,
    [next('kk_kids')]
  ),

  kk_pigeon: sc(
    E,
    `Pchła przychodzi pod Ul z nowym gołębiem na ramieniu. Mechanicznym, z twoim imieniem wygrawerowanym na skrzydle.

    „Obiecałem” — mówi. — „Jest najwolniejszy w całym stadzie, ale zawsze wraca.”

    Gołąb patrzy na ciebie diodą i gruchnie metalicznie. Coś w tym dźwięku brzmi znajomo.`,
    [next('kk_pigeon')]
  ),
};
