import { go, route, sc } from './_h.js';

// Dodatkowe sceny epilogów, wpinane w łańcuchy z epilogi.js
const E = 'Epilog';
const next = (to) => go('Dalej', to);

export default {
  // Wpinane między ep_name_1 a ep_name_2
  ep_name_1b: route({ if: { flag: 'families' }, to: 'ep_name_families' }, { to: 'ep_name_1c' }),

  ep_name_families: sc(
    E,
    `Pod Iglicą stoi sto tysięcy ludzi. Na czele idą rodziny z piwnicy na Śluzie: Teodor, Ania, kobieta z Portu z koszem ryb, Gawron bez maski.

    Nie krzyczą. Nie rzucają kamieniami. Stoją w deszczu i trzymają kartki z imionami bliskich, którzy siedzą przed ekranami.

    Ochrona Halcyonu nie wie, co robić z ludźmi, którzy tylko stoją. Po godzinie odkłada pałki.`,
    [next('ep_name_1c')]
  ),

  ep_name_1c: route({ if: { flag: 'antoni' }, to: 'ep_name_antoni' }, { to: 'ep_name_1d' }),

  ep_name_antoni: sc(
    E,
    `W Porcie Południowym, pierwszy raz od pięćdziesięciu lat, zapala się latarnia morska. Ola podłączyła ją do Wieży kablem, który Szczury przeciągnęły tunelami.

    Na schodach latarni siedzi stary Antoni w żółtym sztormiaku. Nie wypływa już w nocy. Patrzy tylko na światło, które obraca się nad szarą wodą.

    „Ireno” — mówi do morza. — „Teraz już widać.”`,
    [next('ep_name_1d')]
  ),

  ep_name_1d: route({ if: { flag: 'pchla_mom' }, to: 'ep_name_mom' }, { to: 'ep_name_2' }),

  ep_name_mom: sc(
    E,
    `Oddział Regeneracji Premium na poziomie 205 pustoszeje w ciągu tygodnia. Ludzie wstają z foteli powoli, jakby po bardzo długiej chorobie.

    Jadwiga Pchalska schodzi kolejką do Doliny, wsparta na ramieniu pielęgniarki. Na peronie czeka chłopiec w za dużej kurtce, z metalowym gołębiem na ramieniu.

    Nie mówią nic. Pchła po prostu biegnie.`,
    [next('ep_name_2')]
  ),

  // Wpinane w łańcuch Neon Sygnału
  ep_signal_2b: route({ if: { flag: 'nowak_ally' }, to: 'ep_signal_nowak' }, { to: 'ep_signal_3' }),

  ep_signal_nowak: sc(
    E,
    `Oficer Nowak nagrywa zeznanie na tle swojego Posterunku. Jedenaście lat przy szlabanie, setki vanów jadących na Śluzę.

    Nagranie obiega Dolinę w godzinę. Następnego dnia Nowak zdejmuje biały płaszcz, wiesza go na szlabanie i odchodzi. Szlaban zostaje podniesiony na zawsze.`,
    [next('ep_signal_3')]
  ),

  // Wpinane w łańcuch Ostatniej audycji
  ep_martyr_2b: route({ if: { flag: 'sokol_turned' }, to: 'ep_martyr_sokol' }, { to: 'ep_martyr_3' }),

  ep_martyr_sokol: sc(
    E,
    `Szóstego dnia do celi obok wprowadzają nowego więźnia. Mężczyznę bez płaszcza, z pustym oczodołem, z którego wymontowano czerwony wszczep.

    W nocy stuka w ścianę. Kropka, kreska, kropka.

    „Dziękuję” — mówi przez kratkę wentylacyjną Tomasz Lis. — „Pierwszy raz od dwudziestu lat śnię o Marcie. I to jest dobry sen.”`,
    [next('ep_martyr_3')]
  ),

  // Wpinane w łańcuch Ducha w sieci
  ep_ghost_2b: route({ if: { flag: 'pchla_friend' }, to: 'ep_ghost_pchla' }, { to: 'ep_ghost_3' }),

  ep_ghost_pchla: sc(
    E,
    `Pchła przychodzi pod Ul z Kubą na ramieniu. Gołąb mruga diodą w dziwnym rytmie.

    „Kuba się zmienił” — mówi Pchła. — „Lata sam tam, gdzie trzeba. Przynosi leki dla starej Haliny, zanim ktoś go o to poprosi. Raz przyniósł mi jabłko. Prawdziwe, z Iglic.”

    Patrzy na ciebie podejrzliwie. „Myślisz, że ktoś w nim mieszka?”`,
    [next('ep_ghost_3')]
  ),

  // Wpinane w łańcuch Umowy
  ep_deal_2b: route({ if: { flag: 'pchla_mom' }, to: 'ep_deal_mom' }, { to: 'ep_deal_3' }),

  ep_deal_mom: sc(
    E,
    `Oddział na poziomie 205 zostaje „zrestrukturyzowany”. Pracownicy wracają do domów z pismem o „zakończeniu programu regeneracji”.

    Pchła dostaje list z Halcyonu: „Z przyjemnością informujemy, że pani Jadwiga Pchalska wraca do zdrowia”. Bez przeprosin, bez wyjaśnień.

    Pchła czyta go mamie na głos, dwadzieścia razy dziennie, bo ona lubi, jak się z niego śmieje.`,
    [next('ep_deal_3')]
  ),
};
