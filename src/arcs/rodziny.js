import { go, route, sc } from './_h.js';

// Piwnica bloku 7: rodziny ludzi, którzy wzięli Spokój
const R = 'Dolina · Piwnica na Śluzie';
const back = go('Wróć do pani Haliny', 'sl_hub');

export default {
  rd_1: sc(
    R,
    `Piwnica bloku siódmego pachnie wilgocią i parafiną. Na skrzynkach po owocach siedzi kilkanaście osób, oświetlonych świeczkami, bo prąd tu dawno odcięli.

    Teodor. Mała Ania z blizną nad brwią. Kobieta z Portu z koszem ryb. Mężczyzna w masce kruka podniesionej na czoło. Ludzie, którzy nie mają ze sobą nic wspólnego, oprócz tego, że ktoś im bliski siedzi przed ekranem i się uśmiecha.

    Pani Halina przedstawia cię krótko: „To kurier. Ten, o którym wam mówiłam.”`,
    [go('Usiądź na skrzynce', 'rd_2')]
  ),

  rd_2: sc(
    R,
    `Spotkanie wygląda jak każde inne spotkanie ludzi w żałobie. Ktoś mówi, że jego żona przestała go poznawać. Ktoś, że brat zapomniał imienia matki. Ania mówi, że tata już nie czyta jej bajek, więc teraz to ona czyta jemu.

    Teodor wstaje na końcu. „Halcyon mówi, że to skutek uboczny. Jeden na tysiąc. Ale na Śluzie co trzecie okno świeci na niebiesko. To nie jest skutek uboczny. To jest cel.”

    Wszyscy patrzą na ciebie. Jakby czekali.`,
    [
      go('Pokaż im dowody, które masz', 'rd_truth', { req: { any: [{ flag: 'diary' }, { flag: 'stream_proof' }, { flag: 'van_proof' }] } }),
      go('„Nie mam dla was odpowiedzi. Ale szukam.”', 'rd_hope'),
    ]
  ),

  rd_truth: sc(
    R,
    `Pokazujesz im wszystko, co masz. Dziennik Hani. Nagrania. Etykiety: „DAWCA 2217 / WSPOMNIENIE: ŚLUB”.

    W piwnicy robi się tak cicho, że słychać, jak skapuje wosk ze świeczek.

    Potem mężczyzna w masce kruka wstaje. „Mój syn ma szesnaście lat. Jego wspomnienia leżą teraz na jakimś serwerze w Iglicy?” Jego głos się łamie. „To co mamy robić?”`,
    [go('Opowiedz o Wieży Radiowej i planie Oka', 'rd_plan')]
  ),

  rd_hope: sc(
    R,
    `Ludzie kiwają głowami. W Dolinie nikt nie oczekuje odpowiedzi. Wystarczy, że ktoś szuka.

    Pani Halina nalewa wszystkim herbaty z wielkiego termosu. Ania podaje ci kubek i mówi: „Mój stryj mówi, że jesteś w porządku. Stryj Kret.” Mruga. „Ale nie mów nikomu, że ci powiedziałam.”`,
    [back]
  ),

  rd_plan: sc(
    R,
    `Opowiadasz o Wieży, o kluczu do serwera i o nadajniku, który może pokazać całemu miastu, co się dzieje na Śluzie.

    Teodor zaciska pięści. „Kiedy Wieża zacznie nadawać, nie będziemy siedzieć w piwnicy. Wyjdziemy na ulice. Wszyscy. Pod samą Iglicę.”

    Kobieta z Portu: „Przypłyniemy łodziami.” Mężczyzna z Kruków: „Przyprowadzę swoich.” Ania: „Ja też idę!” Wszyscy się śmieją, pierwszy raz tego wieczoru.`,
    [go('„Dam wam znać, kiedy.”', 'rd_song', { effect: { flag: 'families', trust: 1 } })]
  ),

  rd_song: sc(
    R,
    `Kiedy wychodzisz, ktoś w piwnicy zaczyna nucić. Najpierw cicho, potem coraz głośniej, aż śpiewa cała piwnica.

    „Płynie łódka po kałużach, w łódce sen i w łódce ja…”

    Mira w twoim uchu milczy. Ale wiesz, że śpiewa razem z nimi.`,
    [back]
  ),

  rd_entry: route({ if: { flag: 'families' }, to: 'rd_after' }, { to: 'rd_1' }),

  rd_after: sc(
    R,
    `Piwnica jest pusta, ale na ścianie ktoś wymalował antenę i datę: „Kiedy Wieża zagra”.

    Pod spodem kilkanaście podpisów. Teodor. Ania. Witek, krzywymi literami, jakby ktoś prowadził mu rękę.`,
    [back]
  ),
};
