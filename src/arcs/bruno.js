import { go, route, sc } from './_h.js';

// Bar Pod Pompą: dług Bruna, plan z fałszywym chipem, przeszłość Hani
const B = 'Dolina · Bar Pod Pompą';
const hub = go('Wróć do rozmowy', 'br_hub');
const street = go('Wróć na ulicę', '@map');

export default {
  bruno_map: route({ if: { notFlag: 'bruno_seen' }, to: 'bruno_first' }, { to: 'br_hub' }),

  br_hub: sc(
    B,
    `Bar jest pusty. Bruno poleruje szklankę, która od dawna jest czysta. Na twój widok drga mu powieka.

    „Mówiłem, żebyś nie wracał… żebyś nie wracała… a, nieważne. Co jest?”`,
    [
      go('„Czego się tak boisz, Bruno?”', 'br_debt', { req: { notFlag: 'br_debt' }, effect: { flag: 'br_debt' } }),
      go('„Jak mogę ci pomóc z długiem?”', 'br_plan', { req: { flag: 'br_help', notFlag: 'fake_plan' }, effect: { flag: 'fake_plan' } }),
      go('Daj Brunie 300 kr na spłatę raty', 'br_paid', { req: { flag: 'br_help', credits: 300, notFlag: 'br_paid' }, effect: { credits: -300, flag: 'br_paid' } }),
      go('„Pamiętasz Hanię? Dziewczynę, która programowała ci chipy?”', 'br_past', { req: { flag: 'mem3', notFlag: 'br_past' }, effect: { flag: 'br_past' } }),
      go('Sprzedaj mu zegarek Teodora', 'br_watch', { req: { flag: 'watch', notFlag: 'kind_teodor' }, effect: { credits: 60, flag: 'kind_teodor' } }),
      go('„Skąd te ślady sadzy na suficie?”', 'br_fire', { req: { flag: 'br_debt', notFlag: 'br_fire' }, effect: { flag: 'br_fire' } }),
      go('Zamów coś do jedzenia (15 kr)', 'br_food', { req: { credits: 15 }, effect: { credits: -15, hp: 1 } }),
      street,
    ]
  ),

  br_debt: sc(
    B,
    `Bruno odstawia szklankę. Długo patrzy w okno, za którym spływa deszcz.

    „Trzy lata temu bar się palił. Zwarcie w instalacji. Ubezpieczenia nie miałem, w Dolinie nikt nie ma. Halcyon dał mi pożyczkę. Pięć tysięcy, na odbudowę.”

    „Teraz chcą z powrotem. Z odsetkami to już dwanaście. Ten chip miał być ostatnią ratą. Jak go nie dowieziesz, przyjdzie Sokół. I nie po pieniądze.”`,
    [
      go('„Pomogę ci. Jakoś to rozwiążemy.”', 'br_hub', { effect: { flag: 'br_help' } }),
      go('„To twój problem, nie mój.”', 'br_cold', { effect: { flag: 'br_cold' } }),
    ]
  ),

  br_cold: sc(
    B,
    `Bruno kiwa głową, jakby się tego spodziewał.

    „Jasne. W Dolinie każdy ma swój problem.” Odwraca się do półek z butelkami. „Drzwi są tam, gdzie zawsze.”`,
    [street]
  ),

  br_plan: sc(
    B,
    `Bruno zniża głos, chociaż w barze nie ma nikogo poza tobą.

    „Na bazarze pod wiaduktem jest Sroka. Robi podróbki wszystkiego: dokumentów, chipów, nawet wszczepów. Jak dasz jej zdjęcie oryginału, zrobi chip, który przejdzie pierwszy skan Halcyonu.”

    „Gdyby Sokół dostał podróbkę, zanim ty dojdziesz do Wren… Zyskałbyś czas. Zyskałabyś. Ugh, wiesz, o co chodzi.”

    Mira w twoim uchu: „To szaleństwo. Ale dobre szaleństwo.”`,
    [hub]
  ),

  br_paid: sc(
    B,
    `Bruno patrzy na przelew i przez chwilę nie może nic powiedzieć.

    „Nikt nigdy… W Dolinie nikt nigdy nie daje pieniędzy za darmo.”

    Grzebie pod ladą i wyciąga plastikową kartę z logo Halcyonu. „Przepustka serwisowa. Został mi z czasów, kiedy dostarczałem im kawę do Iglicy. Otwiera wejście dla dostawców na poziomie 210. Może się przydać.”`,
    [go('Weź przepustkę', 'br_hub', { effect: { flag: 'service_pass' } })]
  ),

  br_past: sc(
    B,
    `Bruno zastyga ze ścierką w ręku. Potem siada ciężko na stołku za barem.

    „Hania. Mała Wójcik z Śluzy. Najlepsza programistka, jaką miałem. Zawsze z lutownicą, zawsze z plamą smaru na twarzy.” Uśmiecha się do wspomnienia. „Kupowałem jej pączki. Z różowym lukrem, innych nie chciała.”

    „Zniknęła rok temu. Myślałem, że wyjechała.” Nagle rozumie. Patrzy na twoją kieszeń, gdzie leży chip. „Nie. Nie, nie, nie.”

    Mira mówi cicho: „Powiedz mu, że pamiętam pączki.”`,
    [go('„Ona pamięta pączki, Bruno.”', 'br_past2')]
  ),

  br_past2: sc(
    B,
    `Bruno zakrywa twarz dłońmi. Ramiona mu drżą.

    Kiedy w końcu podnosi głowę, jego oczy są czerwone, ale głos twardy. „Rób, co musisz. Ja się nie liczę. Nie oddawaj jej im. Słyszysz? Nie oddawaj jej.”`,
    [go('Wróć do rozmowy', 'br_hub', { effect: { trust: 1, flag: 'bruno_ally' } })]
  ),

  br_watch: sc(
    B,
    `Bruno ogląda zegarek pod lampą i gwiżdże cicho.

    „Mechaniczny, sprzed wojny. Takich już nie robią.” Odlicza kredyty na ladę. „Sześćdziesiąt. Więcej nie dam, to Dolina, nie dom aukcyjny.”`,
    [hub]
  ),

  br_food: sc(
    B,
    `Bruno stawia przed tobą miskę gorącego makaronu z jajkiem i czymś, co udaje kiełbasę. Smakuje lepiej, niż wygląda.

    „Na koszt firmy byłoby ładniej” — mruczy — „ale firma ma dwanaście tysięcy długu.”`,
    [hub]
  ),
};
