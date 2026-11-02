import { go, sc } from './_h.js';

// Domknięcie wątków: rozmowy z Mirą o nowych znajomych, Sroka, zdjęcia Bruna, Ania u Kreta, pani Zofia
const M = 'Rozmowa · Mira';
const back = go('Wróć do tematów', 'mira_talk');

export default {
  mt_kamil: sc(
    M,
    `„Kamil kalibrował vany, które mnie zbierały” — mówi Mira. — „A potem oddał ci klucze do nich. W pendrivie w kształcie kaczki.”

    „Ludzie są dziwni. Najpierw robią coś złego, bo się boją. Potem robią coś dobrego, bo boją się bardziej.”`,
    [back]
  ),

  mt_marczak: sc(
    M,
    `„Marczak oddał ci swoją kurtkę” — mówi Mira. — „Jego żona leży na 205. Fotel 64. Widziałam ją w rejestrze, kiedy szukaliśmy mamy Pchły.”

    „Może kiedyś obudzi się i zapyta, gdzie jest jego kurtka.”`,
    [back]
  ),

  mt_ul: sc(
    M,
    `„Twoja kapsuła ma dwa metry na trzy” — Mira liczy na głos. — „Chip ma dwa centymetry na trzy. Więc w porównaniu ze mną mieszkasz w pałacu.”

    „A tak serio, podoba mi się tam. Słychać deszcz i sąsiadów. Jakby świat był blisko.”`,
    [back]
  ),

  mt_basia: sc(
    M,
    `„Pani Basia mówi, że pralnia to kościół” — Mira się śmieje. — „Ma rację. Wszyscy przychodzą brudni, wychodzą czyści, a w środku nikt nie pyta, skąd jesteś.”

    „Jeśli kiedyś będę mogła wybrać, gdzie mieszkać, może wybiorę pralkę. Ciepło i kręci się.”`,
    [back]
  ),

  mt_letter: sc(
    M,
    `„List Adama do matki” — mówi Mira cicho. — „«Budzę się i nie wiem, czy to moje sny, czy coś, co sprzedają nam w aplikacji». On też ma Spokój. Premium.”

    „Może dlatego śni o racuchach. Bo ktoś w Iglicy sprzedaje mu jego własną matkę po kawałku.”`,
    [back]
  ),

  bz_sroka_story: sc(
    'Dolina · Bazar pod wiaduktem',
    `Sroka zdejmuje lupę z oka i przeciera ją rąbkiem bluzy.

    „Dwadzieścia lat temu robiłam hologramy dla Halcyonu. Logo, znaki wodne, zabezpieczenia na dokumentach. Najlepsze w mieście.”

    „Potem zorientowałam się, że moje hologramy wiszą na drzwiach przychodni, w których dzieje się Spokój. Więc zaczęłam robić podróbki moich własnych hologramów. Jak się nie da zniszczyć czegoś, co się zrobiło, to przynajmniej można to rozmnożyć tak, żeby przestało cokolwiek znaczyć.”`,
    [go('Wróć do Sroki', 'bz_sroka', { effect: { flag: 'sroka_story' } })]
  ),

  br_photo: sc(
    'Dolina · Bar Pod Pompą',
    `Bruno prowadzi cię na zaplecze. Na ścianie nad zlewem wiszą zdjęcia przypięte pinezkami: stali bywalcy, urodziny, powódź z czasów, kiedy woda sięgała do kolan także w barze.

    Na jednym dziewczyna z warkoczem i lutownicą, z pączkiem w różowym lukrze w zębach. Bruno odpina zdjęcie i podaje ci.

    „Pokaż jej. Jeśli w tym chipie można coś zobaczyć.”`,
    [go('Wróć do rozmowy', 'br_hub', { effect: { flag: 'br_photo', trust: 1 } })]
  ),

  kr_ania: sc(
    'Dolina · Zalane metro',
    `Na tronie z samochodowych foteli siedzi Ania z blizną nad brwią i odrabia lekcje. Kret stoi obok i pilnuje, żeby nie robiła błędów w mnożeniu.

    „Stryj mówi, że jesteś w porządku” — mówi Ania, nie podnosząc wzroku znad zeszytu. — „I że jak dorosnę, to mogę zostać kurierem. Albo szefową Szczurów. Jeszcze nie zdecydowałam.”

    Kret wzdycha ciężko. „Ona wybierze jedno i drugie.”`,
    [go('Wróć do rozmowy', 'kr_hub', { effect: { flag: 'kr_ania' } })]
  ),

  ul_zofia2: sc(
    'Dolina · Ul',
    `Pani Zofia otwiera drzwi z Pimpkiem na rękach. Kot ma na szyi nową obróżkę z dzwoneczkiem.

    „Żeby już nigdy nie zginął” — tłumaczy. — „Dzwoni teraz po całym Ulu. Sąsiedzi mnie nienawidzą.” Promienieje. „Ale ja śpię spokojnie. Bez żadnych wszczepów.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { flag: 'zofia2' } })]
  ),
};
