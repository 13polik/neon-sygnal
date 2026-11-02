import { go, sc } from './_h.js';

// Dalsze tematy rozmów z Mirą, odblokowywane postępami w grze (wpięte w mira_talk)
const M = 'Rozmowa · Mira';
const back = go('Wróć do tematów', 'mira_talk');

export default {
  mt_rain: sc(
    M,
    `„Wiesz, dlaczego w Dolinie zawsze pada?” — pyta Mira. — „Halcyon postawił Iglice tak wysoko, że przebijają chmury. Chmury się o nie zaczepiają i zostają nad Doliną. Cała para z miasta wisi nad nami jak mokry koc.”

    „Ludzie z Iglic mają słońce, bo zabrali nam niebo. Dosłownie.”

    „Ale kaznodzieja z bazaru twierdzi, że deszcz to wspomnienia. Ładniejsza wersja.”`,
    [back]
  ),

  mt_port: sc(
    M,
    `„Antoni i Irena” — mówi Mira cicho. — „Pięćdziesiąt lat temu poznali się na tańcach w porcie. Ona deptała mu po palcach przez cały wieczór. To pamiętam z jego wspomnień.”

    „Dziwnie jest nosić w sobie czyjąś miłość. Jakbym miała w kieszeni cudzy list i nie mogła go oddać.”

    „Ale oddałam. Dzięki tobie oddałam.”`,
    [back]
  ),

  mt_families: sc(
    M,
    `„W tej piwnicy było czterdzieści dwa wspomnienia, które znam” — mówi Mira. — „Ania ma oczy po ojcu. Teodor tak samo przeciąga ostatnią sylabę jak Marek. Wszyscy mieli w sobie kawałki ludzi, których mam w sobie ja.”

    „Kiedy śpiewali, to było jak… jak rodzina, która się odnalazła po latach. Tylko że ja byłam po drugiej stronie szyby.”`,
    [back]
  ),

  mt_sokol2: sc(
    M,
    `„Tomasz Lis” — powtarza Mira. — „Teraz pamiętam. W moich wspomnieniach jest chłopak, który wiosłował po porcie w noc powodzi. Krzyczał imię siostry tak długo, aż stracił głos.”

    „Halcyon wziął jego ból i zrobił z niego broń. Podobnie jak ze mną. Wzięli nasze wspomnienia i zrobili z nich narzędzia.”

    „Może on wcale nie jest nożem. Może jest tylko człowiekiem, któremu ktoś włożył nóż do ręki.”`,
    [back]
  ),

  mt_prezes: sc(
    M,
    `„Wolański” — w głosie Miry słychać chłód, którego wcześniej nie było. — „Partycja z jego nazwiskiem. Rozumiesz, co to znaczy? On nie budował asystentki. On budował dla siebie ciało. Ze mnie. Z nas wszystkich.”

    „Czterech tysięcy ludzi z Doliny miało być fundamentem domu, w którym zamieszka jeden staruszek z Iglicy.”`,
    [back]
  ),

  mt_edward: sc(
    M,
    `„Edward to dobry człowiek, który robi złą robotę” — mówi Mira. — „Takich jest w Iglicy najwięcej. Nie potworów, tylko ludzi, którzy mają córki, rachunki i strach.”

    „Dał ci ten klucz, bo chciał, żeby ktoś zrobił to, na co on nie ma odwagi. To też jest rodzaj odwagi. Mały, ale jest.”`,
    [back]
  ),

  mt_kruki: sc(
    M,
    `„Szczury i Kruki” — Mira wzdycha. — „Pół Doliny pamięta ich bijatyki. Ja też, z czterdziestu różnych perspektyw. Najczęściej z perspektywy straganiarza, któremu wywrócili stragan.”

    „Ale wiesz, co jest śmieszne? Gawron i Kret jako dzieci chodzili do tej samej szkoły. Siedzieli w jednej ławce. Jest takie wspomnienie nauczycielki, która rozdzielała ich za karę.”`,
    [back]
  ),

  mt_ewa: sc(
    M,
    `„Ewa ze stołówki” — mówi Mira ciepło. — „Piętnaście lat gotuje dla ludzi, którzy nie znają jej imienia. I wciąż nakłada podwójne porcje każdemu, kto wygląda na zmęczonego.”

    „W Iglicy są tacy ludzie. Mało, ale są. Jak kwiaty, które przebiły się przez beton.”`,
    [back]
  ),

  mt_pchla2: sc(
    M,
    `„Matka Pchły sprzątała biura na poziomie 205” — mówi Mira powoli. — „Mam jej wspomnienie. Jedno. Okno, za którym wschodzi słońce, i myśl: «muszę to kiedyś pokazać małemu».”

    „Halcyon nie wysłał jej w żaden wypadek przy windzie. Wzięła Spokój Premium, jak wszyscy pracownicy. I już nie wróciła z pracy.”

    „Jeśli ona gdzieś tam jest, w Iglicy, przed ekranem…” Mira nie kończy.`,
    [go('Wróć do tematów', 'mira_talk', { effect: { flag: 'pchla_mom_hint' } })]
  ),

  mt_music: sc(
    M,
    `„W chipie jest dużo muzyki” — mówi Mira. — „Kołysanki, przeboje sprzed pięćdziesięciu lat, piosenki z wesel, hymn szkolny Szóstej Śluzy. I jedna piosenka, której nikt nigdy nie nagrał. Ktoś ją tylko nucił, sam dla siebie, w kuchni.”

    „Takie rzeczy znikają, kiedy umiera ostatnia osoba, która je pamięta. Ja jestem ostatnią osobą dla wielu piosenek.”`,
    [back]
  ),

  mt_tattoo: sc(
    M,
    `„Pokaż jeszcze raz” — prosi Mira. Podnosisz rękę, a tatuaż świeci w ciemności.

    „Antena i WIEŻA. Pierwszy raz ktoś ma na skórze coś, co jest o mnie. To dziwne. Dobre dziwne.”`,
    [back]
  ),

  mt_leon: sc(
    M,
    `„Ten chłopiec z myszą” — Mira się śmieje. — „«To dlaczego wy jesteście na dole, a my na górze?» Najmądrzejsze pytanie, jakie słyszałam w Iglicach.”

    „Może za dwadzieścia lat to on będzie prezesem. I może zapamięta mysz z Doliny.”`,
    [back]
  ),

  mt_premium: sc(
    M,
    `„Spokój Premium” — powtarza Mira. — „Czyli ludzie w Iglicach też oddają wspomnienia. Tylko płacą za to abonament.”

    „Wiesz, co jest najstraszniejsze? Oni wiedzą. Podpisują regulamin, czytają w nim o «przetwarzaniu danych sennych» i podpisują. Bo dobrze się po tym śpi.”`,
    [back]
  ),

  mt_igla: sc(
    M,
    `„Igła zobaczyła nagranie, na którym Sokół włącza prasę” — mówi Mira. — „I wiesz, co powiedziała, kiedy wyszliśmy? «Biedny chłopak». O Sokole.”

    „Ja bym tak nie umiała. Ale chciałabym się nauczyć.”`,
    [back]
  ),

  mt_thanks: sc(
    M,
    `Mira milczy długo. Potem mówi bardzo cicho, jakby się bała, że ktoś podsłuchuje.

    „Dziękuję. Nie za coś konkretnego. Za to, że jesteś. Że mówisz do mnie jak do kogoś, a nie do czegoś.”

    „Czterech tysięcy ludzi w chipie, a pierwszy raz od roku czuję się jak jedna osoba.”`,
    [back]
  ),
};
