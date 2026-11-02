import { go, play, sc } from './_h.js';

// Klinika Igła: zemsta Igły i leki dla pani Haliny
const K = 'Dolina · Klinika Igła';
const back = go('Wróć do rozmowy', 'clinic');
const street = go('Wróć na ulicę', '@map');

export default {
  ig_quest: sc(
    K,
    `Igła zamyka drzwi kliniki na zasuwę i opuszcza żaluzje.

    „Mój wypadek przy maszynie nie był wypadkiem. Wiem to. Ale potrzebuję dowodu. Halcyon trzyma moje akta medyczne i nagrania z tamtego dnia w swoim archiwum.”

    „Co czwartek kurier Halcyonu wiezie kopie akt z przychodni w Dolinie do Iglicy. Przechodzi przez Posterunek koło Śluzy. Ma tablet przypięty do nadgarstka.”`,
    [go('„Co mam zrobić?”', 'ig_quest2')]
  ),

  ig_quest2: sc(
    K,
    `„Zdobądź ten tablet. Albo chociaż skopiuj, co na nim jest” — mówi Igła. — „Nie musisz nikogo krzywdzić. Kurierzy Halcyonu to dzieciaki z Doliny w białych kurtkach, tacy sami jak ty.”

    „Jak mi to przyniesiesz, wszczepię ci, co tylko zechcesz. Za darmo. Słowo chirurga.”`,
    [
      go('„Zrobię to.”', 'clinic', { effect: { flag: 'ig_quest' } }),
      go('„Muszę się zastanowić.”', 'clinic'),
    ]
  ),

  ig_meds: sc(
    K,
    `Igła słucha o pani Halinie, kiwa głową i bez słowa idzie na zaplecze. Wraca z małym słoiczkiem bez etykiety.

    „Digoksyna. Zrobiłam sama, z prawdziwej naparstnicy, nie z syntetyku Halcyonu. Jedna dziennie, rano, do herbaty.”

    „Sześćdziesiąt za materiały. Za robotę nic, starszych pań z Śluzy nie kasuję.”`,
    [back]
  ),

  ig_done: sc(
    K,
    `Igła podłącza tablet do swojego komputera. Przewija pliki stalowymi palcami, szybko, coraz szybciej. Potem nieruchomieje.

    Na ekranie nagranie z kamery przemysłowej. Hala operacyjna w Iglicy. Kobieta w białym fartuchu przy maszynie. Mężczyzna w szarym płaszczu, z czerwonym okiem, podchodzi z tyłu i włącza prasę.

    „Sokół” — szepcze Igła. — „To był Sokół. Na rozkaz Wren.”`,
    [go('Położyć jej dłoń na ramieniu', 'ig_done2')]
  ),

  ig_done2: sc(
    K,
    `Igła oddycha głęboko. Potem kopiuje nagranie na trzy różne nośniki i chowa je w trzech różnych miejscach kliniki.

    „Dziękuję. Teraz mam dowód. A jak twój sygnał z Wieży kiedyś pójdzie w eter, to nagranie pójdzie razem z nim.”

    Rozkłada narzędzia na tacy. „Obiecałam wszczep. Wybieraj.”`,
    [
      go('Lodołamacz (Włam: +3 sekundy)', 'ig_thanks', { req: { notFlag: 'icebreaker' }, effect: { flag: ['icebreaker', 'igla_proof'] } }),
      go('Neuroprzyspieszacz (wolniejsze minigry zręcznościowe)', 'ig_thanks', { req: { notFlag: 'reflex' }, effect: { flag: ['reflex', 'igla_proof'] } }),
      go('Zagłuszacz (drony widzą cię wolniej)', 'ig_thanks', { req: { notFlag: 'jammer' }, effect: { flag: ['jammer', 'igla_proof'] } }),
      go('Pancerz podskórny (+1 maks. zdrowia)', 'ig_thanks', { req: { notFlag: 'armor' }, effect: { flag: ['armor', 'igla_proof'], hp: 1 } }),
      go('„Nic nie trzeba. Zatrzymaj to dla kogoś innego.”', 'ig_thanks', { effect: { flag: 'igla_proof', trust: 1, credits: 100 } }),
    ]
  ),

  ig_thanks: sc(
    K,
    `Kiedy wychodzisz, Igła stoi w drzwiach kliniki i patrzy na Iglice nad chmurami.

    „Wiesz, co jest najgorsze?” — mówi. — „Że ja ich znam. Wren, Sokoła, nawet prezesa. Jadłam z nimi obiady w stołówce na poziomie 180. Byli dla mnie mili.”

    „Uważaj na miłych ludzi z Iglicy, kurierze.”`,
    [street]
  ),

  ig_ambush: sc(
    'Dolina · Posterunek',
    `Czwartek, druga w nocy. Przy Posterunku zatrzymuje się elektryczny skuter. Kurier Halcyonu w białej kurtce, może siedemnastoletni, zsiada i podchodzi do szlabanu. Na nadgarstku ma przypięty tablet.

    Strażnik ziewa. Skaner szumi. Masz kilka sekund.`,
    [
      play('Zhakuj tablet z ukrycia', 'hack', 2, { to: 'ig_got', effect: { flag: 'ig_records' } }, { to: 'ig_fail', effect: { heat: 20 } }),
      go('Wypuść gołębia Pchły, żeby odwrócił uwagę', 'ig_pigeon', { req: { flag: 'pchla_friend' }, effect: { flag: 'ig_records' } }),
      go('Podejdź i zaproponuj 150 kr za kopię', 'ig_bribe', { req: { credits: 150 }, effect: { credits: -150, flag: 'ig_records' } }),
      go('Odpuść na dziś', '@map'),
    ]
  ),

  ig_got: sc(
    'Dolina · Posterunek',
    `Tablet łączy się z twoim komunikatorem na sekundę. Wystarczy. Pliki spływają paskiem postępu, zanim kurier w ogóle podniesie wzrok.

    Skuter odjeżdża w stronę Iglic. W twojej kieszeni leżą akta Igły. I kilka innych rzeczy, których Halcyon nie chciałby nikomu pokazywać.`,
    [go('Zanieś to Igle', '@map')]
  ),

  ig_fail: sc(
    'Dolina · Posterunek',
    `Tablet piszczy alarmem. Kurier podskakuje, strażnik upuszcza kawę, a dron nad szlabanem obraca się w twoją stronę.

    Uciekasz w boczną uliczkę. Skuter Halcyonu odjeżdża z aktami. Następny czwartek za tydzień, ale może dziś w nocy jeszcze raz?`,
    [go('Wróć na ulicę', '@map')]
  ),

  ig_pigeon: sc(
    'Dolina · Posterunek',
    `Kuba sfruwa z dachu i ląduje kurierowi prosto na głowie. Chłopak wrzeszczy, macha rękami, strażnik śmieje się do rozpuku.

    W zamieszaniu tablet zsuwa się z nadgarstka. Kuba łapie go w szpony i odlatuje. Pięć minut później tablet leży ci na kolanach, a na dachu Pchła pokazuje ci kciuk w górę.`,
    [go('Zanieś to Igle', '@map')]
  ),

  ig_bribe: sc(
    'Dolina · Posterunek',
    `Kurier Halcyonu patrzy na ciebie, potem na kredyty, potem na strażnika, który drzemie.

    „Kopia, nie oryginał” — mówi szybko. — „I nikt się nie dowie.” Przykłada tablet do twojego komunikatora. „Wiesz, ile mi płacą za te kursy? Dwadzieścia za noc. W Dolinie każdy ma swoją cenę.”`,
    [go('Zanieś to Igle', '@map')]
  ),
};
