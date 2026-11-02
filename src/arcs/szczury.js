import { go, play, route, sc } from './_h.js';

// Zalane metro: Kret, jego brat Witek i wojna z Krukami
const Z = 'Dolina · Zalane metro';
const hub = go('Wróć do rozmowy', 'kr_hub');
const street = go('Wróć na ulicę', '@map');

export default {
  rats: route(
    { if: { flag: 'lamp' }, to: 'kr_hub' },
    { if: { flag: 'oko_quest' }, to: 'rats_lamp' },
    { to: 'rats_intro' }
  ),

  kr_hub: sc(
    Z,
    `Kret siedzi na swoim tronie z samochodowych foteli i karmi szczura skórką od chleba. Na twój widok unosi brew.

    „Znowu ty. Czego chcesz tym razem?”`,
    [
      go('„Opowiedz mi o swoim bracie.”', 'kr_brother', { req: { flag: 'rats_deal', notFlag: 'kr_brother_q' }, effect: { flag: 'kr_brother_q' } }),
      go('Opowiedz Kretowi o Witku i Ani', 'kr_brother_news', { req: { flag: 'witek_seen', notFlag: 'kret_friend' }, effect: { flag: 'kret_friend' } }),
      go('„Kim są Kruki?”', 'kr_kruki', { req: { flag: 'kruki_met', notFlag: 'kr_kruki' }, effect: { flag: 'kr_kruki' } }),
      go('„Przekażę wiadomość Gawronowi.”', 'kr_msg', { req: { flag: 'kr_kruki', notFlags: ['kr_msg', 'kruki_peace', 'kruki_war'] }, effect: { flag: 'kr_msg' } }),
      go('Opowiedz, jak poszło z Krukami', 'kr_result', { req: { any: [{ flag: 'kruki_peace' }, { flag: 'kruki_war' }], notFlag: 'kr_result' }, effect: { flag: 'kr_result' } }),
      go('Popatrz na bójkę na peronie', 'kr_fight', { req: { notFlag: 'kr_fight' } }),
      go('Zobacz spotkanie Kreta z Gawronem', 'kr_meeting', { req: { flag: 'gangs_united', notFlag: 'kr_meeting' } }),
      go('Pogadaj z Małym, przewoźnikiem', 'kr_maly', { req: { notFlag: 'kr_maly' }, effect: { flag: 'kr_maly' } }),
      go('Popłyń łodzią Szczurów do Portu Południowego', 'port_1', { req: { notFlag: 'port_done' } }),
      go('„Jak wy tu przetrwaliście tyle lat?”', 'kr_lore', { req: { notFlag: 'kr_lore' }, effect: { flag: 'kr_lore' } }),
      go('Kup bilet na łódź przemytników (100 kr, ślad −25%)', 'kr_boat', { req: { credits: 100, notFlag: 'kr_boat' }, effect: { credits: -100, heat: -25, flag: 'kr_boat' } }),
      street,
    ]
  ),

  kr_brother: sc(
    Z,
    `Kret przestaje karmić szczura.

    „Witek. Młodszy o dwa lata. Prowadził ze mną łodzie, kiedy zalało Port Południowy. Wyciągnęliśmy wtedy z wody czterdzieści osób.”

    „Rok temu wziął Spokój. Ma córkę, Anię, dziesięć lat. Nie mogę tam chodzić, Halcyon pilnuje Śluzy, a mnie zna każdy dron. Zajrzysz do niego? Powiesz mi, czy mała daje radę?”`,
    [
      go('„Zajrzę.”', 'kr_hub'),
    ]
  ),

  kr_brother_news: route({ if: { flag: 'ania_help' }, to: 'kr_news_good' }, { to: 'kr_news_plain' }),

  kr_news_good: sc(
    Z,
    `Opowiadasz Kretowi o kartce na stole, o Ani z tornistrem większym od niej i o kredytach pod kartką.

    Kret długo milczy. Potem wstaje z tronu, podchodzi i ściska ci rękę tak mocno, że trzeszczą kości.

    „Od dziś jesteś dla Szczurów rodziną. Cokolwiek się stanie w Iglicy, mamy twoje plecy. Każdy Szczur w Dolinie.”`,
    [go('Wróć do rozmowy', 'kr_hub', { effect: { flag: 'rats_family' } })]
  ),

  kr_news_plain: sc(
    Z,
    `Opowiadasz Kretowi o Witku przed ekranem i o kartce od Ani.

    Kret kiwa głową. „Daje radę. Jest twarda, po matce.” Odwraca wzrok. „Dzięki, kurierze. Nie zapomnę.”`,
    [hub]
  ),

  kr_kruki: sc(
    Z,
    `„Kruki” — Kret spluwa do wody. — „Gang z bazaru pod wiaduktem. Kradną, handlują wszczepami z odzysku i biorą haracz od straganiarzy. Ich szef, Gawron, chce zabrać nam tunele metra.”

    „Od miesiąca bijemy się o każdy korytarz. Ginęli już ludzie. Po obu stronach.” Patrzy na ciebie uważnie. „Ty chodzisz wszędzie, nikt cię nie zna. Mógłbyś zanieść Gawronowi wiadomość.”`,
    [go('„Jaką wiadomość?”', 'kr_kruki2')]
  ),

  kr_kruki2: sc(
    Z,
    `„Że chcę rozmawiać. Bez noży” — mówi Kret niechętnie. — „Bo prawda jest taka, że Halcyon śmieje się z nas obu. Podczas gdy my bijemy się o tunele, oni zabierają ludzi z Doliny przez wszczepy.”

    „Ale jak Gawron cię zabije, to nie moja wina.”`,
    [hub]
  ),

  kr_msg: sc(
    Z,
    `Kret pisze coś na skrawku mapy metra, składa go na czworo i wręcza ci.

    „Daj mu to osobiście. I nie czytaj.”

    Oczywiście, że czytasz po drodze. Jest tam tylko jedno zdanie: „Spokój wziął twojego syna i mojego brata. Pogadajmy.”`,
    [street]
  ),

  kr_result: route({ if: { flag: 'kruki_peace' }, to: 'kr_peace' }, { to: 'kr_war' }),

  kr_peace: sc(
    Z,
    `Kiedy mówisz Kretowi, że Gawron się zgodził, ten najpierw nie wierzy. Potem śmieje się tak głośno, że echo niesie się przez tunele.

    „Szczury i Kruki razem. Dolina jeszcze tego nie widziała.” Gwiżdże na swoich ludzi. „Słyszeliście? Od dziś nikt nie dotyka kruczych łodzi!”

    „A ty, kurierze, jak będziesz w Iglicy, pamiętaj: masz za sobą dwa gangi.”`,
    [go('Wróć do rozmowy', 'kr_hub', { effect: { flag: 'gangs_united' } })]
  ),

  kr_war: sc(
    Z,
    `Kret słucha w milczeniu. Potem rzuca kubkiem o ścianę.

    „Wiedziałem. Z Gawronem się nie gada.” Patrzy na ciebie zimno. „Dobrze, że ktoś chociaż spróbował. Ale teraz trzymaj się z daleka od bazaru, tam będzie gorąco.”`,
    [hub]
  ),

  kr_boat: sc(
    Z,
    `Szczur o imieniu Mały przewozi cię łodzią przez zalane tunele metra. W ciemności słychać tylko plusk wioseł i kapanie wody.

    Wychodzicie na powierzchnię trzy ulice dalej, przy starej pompowni. Żadna kamera Halcyonu cię tu nie widzi, a ślad w systemie się urywa.

    „Polecamy się na przyszłość” — mówi Mały i znika w tunelu.`,
    [street]
  ),

  kr_fight: sc(
    Z,
    `Na peronie dwóch Szczurów okłada się pięściami o ostatnią puszkę gulaszu. Kret przygląda się z tronu i ziewa.

    „Ty, kurierze. Chcesz zarobić? Pokonaj mojego najlepszego chłopaka, a dam ci pięćdziesiąt.”`,
    [
      play('Stań do walki', 'duel', 1, { to: 'kr_hub', effect: { credits: 50, flag: 'kr_fight' } }, { to: 'kr_hub', effect: { hp: -1, flag: 'kr_fight' } }),
      hub,
    ]
  ),
};
