import { go, sc } from './_h.js';

// Wieża Radiowa po zdobyciu klucza: wzmacniacz nadajnika i historia Oka
const W = 'Dolina · Wieża Radiowa';
const hub = go('Wróć do rozmowy', 'oko_done');
const street = go('Wróć na ulicę', '@map');

export default {
  oko_done: sc(
    W,
    `Oko siedzi między monitorami, z lutownicą w zębach i kablem w każdej ręce. Na twój widok wypluwa lutownicę.

    „Na co czekasz? Iglica sama się nie zhakuje.” Po chwili dodaje łagodniej: „Chyba że czegoś potrzebujesz.”`,
    [
      go('„Czy nadajnik mógłby być silniejszy?”', 'ok_amp', { req: { notFlag: 'amp_quest' }, effect: { flag: 'amp_quest' } }),
      go('Oddaj cewkę i akumulator', 'ok_amp_done', { req: { flags: ['amp_coil', 'amp_battery'], notFlag: 'amp' }, effect: { flag: 'amp' } }),
      go('„Jak straciłaś oko?”', 'ok_eye', { req: { notFlag: 'ok_eye' }, effect: { flag: 'ok_eye' } }),
      go('„Babcia czeka na ciebie, Ola.”', 'ok_halina', { req: { flags: ['photo', 'sisters'], notFlag: 'sisters_home' } }),
      go('Pomóż Oku przy antenie w czasie burzy', 'ok_storm', { req: { notFlag: 'antenna_fixed' } }),
      go('„Jak wyglądało wasze dzieciństwo?”', 'ok_child', { req: { flag: 'sisters', notFlag: 'ok_child' }, effect: { flag: 'ok_child' } }),
      go('„Naucz mnie alfabetu Morse’a.”', 'ok_morse', { req: { notFlag: 'ok_morse' }, effect: { flag: 'ok_morse' } }),
      go('Pokaż jej zdjęcie od pani Haliny', 'ok_photo', { req: { flags: ['photo', 'sisters'], notFlag: 'ok_photo' }, effect: { flag: 'ok_photo' } }),
      go('Pokaż jej dziennik Hani', 'ok_diary', { req: { flags: ['diary', 'sisters'], notFlag: 'ok_diary' }, effect: { flag: 'ok_diary' } }),
      street,
    ]
  ),

  ok_amp: sc(
    W,
    `Oko drapie się po bliźnie wokół wszczepu.

    „Mógłby. Z lampą sygnał dojdzie do całej Doliny. Ale gdybym miała wzmacniacz, dotarłby wyżej. Do Iglic. Do biur, stołówek, wind. Do każdego ekranu w mieście.”

    „Potrzebuję dwóch rzeczy: cewki antenowej, takie ma tylko Sroka z bazaru, i dużego akumulatora, bo moja instalacja nie pociągnie takiej mocy. Akumulatory zbiera Pchła na swoim gołębniku.”`,
    [hub]
  ),

  ok_amp_done: sc(
    W,
    `Oko montuje cewkę na szczycie masztu, wisząc na jednej ręce sto metrów nad ziemią. Ty podajesz jej narzędzia i starasz się nie patrzeć w dół.

    Akumulator Pchły ląduje w szafie obok nadajnika. Coś iskrzy, coś bucha dymem. Potem Wieża zaczyna brzęczeć głębiej i równiej niż kiedykolwiek.

    „Teraz” — mówi Oko, ocierając sadzę z twarzy — „usłyszy nas całe miasto.”`,
    [hub]
  ),

  ok_eye: sc(
    W,
    `Oko długo nie odpowiada. Kamera w jej oczodole bzyczy, przybliżając i oddalając obraz.

    „Rok temu włamałam się do przychodni Halcyonu na Śluzie. Szukałam siostry. Strażnik miał paralizator, a ja miałam pecha.”

    „Igła mi to zszyła. Kamerę złożyłam sama, ze starego drona. Widzę w podczerwieni i w nocy. Czasem myślę, że to lepsza zamiana, niż się wydaje.”`,
    [hub]
  ),

  ok_morse: sc(
    W,
    `Oko bierze twoją dłoń i stuka nią w metalową barierkę. Krótko, długo, krótko.

    „To R. Kropka, kreska, kropka. Pierwsza litera, jakiej nauczyłam siostrę. R jak radio.”

    Uczysz się przez godzinę. Kiedy wychodzisz, umiesz już nadać SOS, swoje imię i jedno brzydkie słowo, na którym Oko upierała się szczególnie.`,
    [go('Wróć do rozmowy', 'oko_done', { effect: { trust: 1 } })]
  ),

  ok_photo: sc(
    W,
    `Oko bierze zdjęcie ostrożnie, dwoma palcami, jakby było ze szkła. Dwie dziewczyny na tej wieży, w różowym świetle świtu.

    „Babcia je miała? Myślałam, że zginęło, kiedy się wyprowadzałam.” Przyciska je do piersi. „Jak to się skończy, pójdę do niej. Obiecuję. Pierwszy raz od roku.”`,
    [hub]
  ),

  ok_diary: sc(
    W,
    `Oko czyta dziennik siostry w milczeniu, strona po stronie. Przy ostatnim wpisie zatrzymuje się na długo.

    „Szukaj mnie w eterze” — czyta na głos. — „Kropka, kreska, kropka.”

    Odkłada zeszyt i patrzy na ciebie zaczerwienionym okiem. „Ona wiedziała. Wiedziała, że to tak się skończy, i zostawiła mi wskazówkę. A ja przez rok szukałam w złym miejscu.”`,
    [go('Wróć do rozmowy', 'oko_done', { effect: { trust: 1 } })]
  ),
};
