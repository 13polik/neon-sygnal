import { go, play, sc } from './_h.js';

// Posterunek Halcyonu przy Śluzie: oficer Nowak, skonfiskowane rzeczy, kurier z aktami
const C = 'Dolina · Posterunek';
const hub = go('Wróć do szlabanu', 'post');
const street = go('Odejdź', '@map');

export default {
  post: sc(
    C,
    `Biały kontener z czerwonym światłem na dachu. Szlaban, dron skanujący i oficer Nowak w płaszczu przeciwdeszczowym, który ma minę człowieka liczącego dni do emerytury.

    Obok kontenera stoi drugi, mniejszy, z napisem RZECZY ZATRZYMANE. Kłódka wygląda na tanią.`,
    [
      go('Porozmawiaj z oficerem Nowakiem', 'ps_talk', { req: { notFlag: 'ps_talk' }, effect: { flag: 'ps_talk' } }),
      go('Schowaj się: pod Posterunek podjeżdża czarny samochód', 'ps_sokol', { req: { heat: 40, notFlag: 'sokol_seen' } }),
      go('Zapytaj Nowaka, dlaczego tu trafił', 'ps_nowak', { req: { flag: 'ps_talk', notFlag: 'nowak_ally' } }),
      go('Pokaż fałszywą licencję od Sroki', 'ps_fakeid', { req: { flag: 'fake_id', notFlag: 'ps_fakeid' }, effect: { flag: 'ps_fakeid', heat: -25 } }),
      go('Zaproponuj Nowakowi 150 kr za „błąd w systemie”', 'ps_bribe', { req: { credits: 150, notFlag: 'ps_bribe' }, effect: { credits: -150, heat: -30, flag: 'ps_bribe' } }),
      go('Poszukaj Kuby w kontenerze z rzeczami', 'ps_kuba', { req: { flag: 'pc_kuba_q', notFlag: 'kuba_found' } }),
      go('Zaczaj się na kuriera Halcyonu z aktami Igły', 'ig_ambush', { req: { flag: 'ig_quest', notFlag: 'ig_records' } }),
      go('Obserwuj biały van Halcyonu o trzeciej w nocy', 'ps_van', { req: { flag: 'van_tip', notFlag: 'van_proof' } }),
      street,
    ]
  ),

  ps_talk: sc(
    C,
    `Nowak zapala papierosa pod daszkiem kontenera.

    „Wiesz, ile tu stoję? Jedenaście lat. Kiedyś pilnowałem mostu w Iglicach, mieli tam ładne windy i kawę z prawdziwych ziaren. Potem coś powiedziałem za głośno na zebraniu i wylądowałem tu.”

    „Rada dla ciebie, kurierze. Halcyon pamięta wszystko. Twoją twarz, twoje kroki, twój głos. Jak już raz trafisz do systemu, to tylko przekupstwo albo cud cię z niego wyciągną.”`,
    [hub]
  ),

  ps_fakeid: sc(
    C,
    `Nowak bierze kartę, przykłada ją do czytnika i patrzy na ekran długo, za długo.

    Potem oddaje ci ją bez słowa i coś wystukuje na klawiaturze. „J. Kowalski, kurier. Czysta kartoteka.” Przez sekundę kącik ust mu drga. „Ładny hologram. Prawie jak prawdziwy.”`,
    [hub]
  ),

  ps_bribe: sc(
    C,
    `Nowak przelicza kredyty, nie patrząc na ciebie.

    „Wiesz, system Halcyonu czasem gubi dane. Zwłaszcza podczas burzy. A dziś jest burza, prawda?”

    Coś wystukuje. Na ekranie twój profil blednie, jakby ktoś go przetarł gumką.`,
    [hub]
  ),

  ps_kuba: sc(
    C,
    `Kontener z rzeczami zatrzymanymi stoi w cieniu. Kłódka jest tania, ale dron nad szlabanem obraca się co kilka sekund w twoją stronę.`,
    [
      play('Otwórz kłódkę, kiedy dron patrzy w drugą stronę', 'timing', 2, { to: 'ps_kuba_found', effect: { flag: 'kuba_found' } }, { to: 'ps_kuba_caught', effect: { heat: 20 } }),
      go('Poproś Nowaka o oddanie gołębia (50 kr)', 'ps_kuba_found', { req: { credits: 50 }, effect: { credits: -50, flag: 'kuba_found' } }),
      hub,
    ]
  ),

  ps_kuba_found: sc(
    C,
    `Między skonfiskowanymi parasolami, telefonami i jedną protezą nogi leży metalowy gołąb z przestrzelonym skrzydłem. Dioda w oku mruga słabo, ale mruga.

    Kuba rozpoznaje cię i gruchnie cicho, jakby chciał powiedzieć: „no nareszcie”.`,
    [go('Zanieś Kubę do Pchły', '@map')]
  ),

  ps_kuba_caught: sc(
    C,
    `Dron obraca się w ostatniej chwili. Czerwony promień, syrena, Nowak wybiega z kontenera z kubkiem w ręce.

    Uciekasz za róg. Kłódka wciąż zamknięta, a ty jesteś teraz w systemie jeszcze wyraźniej niż wcześniej.`,
    [go('Odejdź', '@map')]
  ),

  ps_van: sc(
    C,
    `Trzecia w nocy. Pod blok siódmy na Śluzie podjeżdża biały van bez okien. Nie gasi silnika. Na dachu rozkłada się antena, zupełnie jak parasol.

    Wszczepy w oknach dookoła zaczynają mrugać jednocześnie, w jednym rytmie. Antena vana świeci na niebiesko.`,
    [
      play('Nagraj transmisję przez wszczep', 'hack', 2, { to: 'ps_van_ok', effect: { flag: 'van_proof' } }, { to: 'ps_van_fail', effect: { heat: 20 } }),
      go('Zostaw to i odejdź', '@map'),
    ]
  ),

  ps_van_ok: sc(
    C,
    `Twój komunikator łapie fragment transmisji. Dziesięć sekund, ale wystarczy. Lista dawców, numery bloków, rodzaje wspomnień: „dzieciństwo”, „miłość”, „żałoba”. I podpis cyfrowy: HALCYON / PROJEKT SPOKÓJ / DR WREN.

    Van zwija antenę i odjeżdża. Mira mówi cicho: „Każda noc. Od roku. A my mamy to teraz czarno na białym.”`,
    [go('Odejdź z dowodem', '@map', { effect: { trust: 1 } })]
  ),

  ps_van_fail: sc(
    C,
    `Twój wszczep łapie sygnał vana i przez sekundę czujesz zawrót głowy, jakby ktoś zajrzał ci pod czaszkę. Antena odwraca się w twoją stronę.

    Van rusza z piskiem opon. Nie masz nic poza bólem głowy i świadomością, że ktoś w Iglicy właśnie zobaczył twój numer wszczepu.`,
    [go('Odejdź', '@map')]
  ),
};
