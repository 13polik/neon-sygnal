import { go, play, route, sc } from './_h.js';

// Ul: kapsuła gracza, odpoczynek, tablica zleceń kurierskich i ostatnia noc przed Iglicą
const U = 'Dolina · Ul';
const home = go('Wróć do kapsuły', 'ul_hub');
const street = go('Wyjdź na ulicę', '@map');

export default {
  ul: route({ if: { flag: 'key', notFlag: 'ul_night' }, to: 'ul_night' }, { to: 'ul_hub' }),

  ul_hub: sc(
    U,
    `Twoja kapsuła na czterdziestym piętrze Ula. Dwa metry na trzy, materac, okienko wielkości talerza i tablica korkowa z przypiętymi zleceniami.

    Chip w kieszeni ciepło pulsuje. Mira mówi: „Przytulnie tu. W taki ciasny sposób.”`,
    [
      go('Prześpij się (zdrowie do pełna, ślad −10%)', 'ul_rest', { req: { notFlag: 'ul_rested' }, effect: { hp: 4, heat: -10, flag: 'ul_rested' } }),
      go('Przejrzyj tablicę zleceń', 'ul_board'),
      go('Zapukaj do pani Zofii z kapsuły obok', 'ul_zofia', { req: { notFlag: 'job_cat' } }),
      go('Odwiedź panią Zofię i Pimpka', 'ul_zofia2', { req: { flag: 'job_cat', notFlag: 'zofia2' } }),
      go('Zajdź na trzydzieste piętro', 'ul_wojtek', { req: { notFlag: 'premium_rumor' } }),
      street,
    ]
  ),

  ul_rest: sc(
    U,
    `Zasypiasz, zanim zdążysz zdjąć buty. Śni ci się morze, którego nikt w Dolinie nie widział na żywo. A może to sen Miry. Albo kogoś z czterech tysięcy ludzi w chipie.

    Budzisz się po sześciu godzinach. Bolą mniej rany, boli mniej głowa. W systemie Halcyonu twój ślad trochę wystygł.`,
    [home]
  ),

  ul_board: sc(
    U,
    `Na tablicy wiszą zlecenia z aplikacji Kurierzy Dolina, wydrukowane na pomarańczowych karteczkach.`,
    [
      go('„Pierścionek. Pilne. Romantyczne.” (40 kr)', 'job_ring', { req: { notFlag: 'job_ring' }, effect: { flag: 'job_ring' } }),
      go('„Krew 0 Rh−. Natychmiast!” (80 kr)', 'job_blood', { req: { notFlag: 'job_blood' }, effect: { flag: 'job_blood' } }),
      go('„List. Doręczyć osobiście.” (30 kr)', 'job_letter', { req: { notFlag: 'job_letter' }, effect: { flag: 'job_letter' } }),
      go('„Paczka. Bez pytań.” (120 kr)', 'job_box', { req: { notFlag: 'job_box' }, effect: { flag: 'job_box' } }),
      go('„Ryby dla pana Lina. Świeże!” (30 kr)', 'job_fish', { req: { notFlag: 'job_fish' }, effect: { flag: 'job_fish' } }),
      go('„Urna. Do morza. Z szacunkiem.” (60 kr)', 'job_ashes', { req: { notFlag: 'job_ashes' }, effect: { flag: 'job_ashes' } }),
      go('„Dokumenty z przychodni. Pilne.” (70 kr)', 'job_clinic', { req: { notFlag: 'job_clinic' }, effect: { flag: 'job_clinic' } }),
      go('„Prezent dla Leona, 8 lat.” (100 kr)', 'job_gift', { req: { notFlag: 'job_gift' }, effect: { flag: 'job_gift' } }),
      home,
    ]
  ),

  // Zlecenie: pierścionek
  job_ring: sc(
    U,
    `Klient to chudy chłopak w okularach, który czeka na ciebie pod Ulem z pudełkiem w drżących rękach.

    „To pierścionek dla Kasi. Pracuje w budce z ramenem przy wiadukcie. Ja… ja nie umiem jej tego dać sam. Proszę tylko oddać i powiedzieć, że od Tomka. I że… że ją kocham. Albo nie, nie mów tego. Albo mów. Nie wiem!”`,
    [go('Idź do budki z ramenem', 'job_ring2')]
  ),

  job_ring2: sc(
    U,
    `Kasia ma fioletowe włosy, kolczyk w brwi i wzrok, który mógłby kroić ryby. Patrzy na pudełko, potem na ciebie.

    „Od kogo?”`,
    [
      go('„Od Tomka. On cię kocha.”', 'job_ring_yes'),
      go('„Od Tomka. Resztę powinien powiedzieć sam.”', 'job_ring_self'),
    ]
  ),

  job_ring_yes: sc(
    U,
    `Kasia otwiera pudełko. Pierścionek jest z miedzianego drutu, wygiętego w kształt małej łódki.

    Przez chwilę nic nie mówi. Potem się śmieje, ociera oczy rękawem i krzyczy przez ramię do kuchni: „Szefie, biorę wolne! Idę zabić Tomka! A potem za niego wyjść!”

    Zostawia ci na ladzie miskę ramenu i podwójny napiwek.`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 60, hp: 1 } })]
  ),

  job_ring_self: sc(
    U,
    `Kasia zamyka pudełko i kiwa głową z uznaniem.

    „Mądrze. Powiedz mu, że czekam o północy pod wiaduktem. I że jak nie przyjdzie sam, to rzucę tym pierścionkiem w kanał.”

    Kiedy przekazujesz to Tomkowi, ten blednie, czerwienieje i biegnie w deszcz bez parasola.`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 40, trust: 1 } })]
  ),

  // Zlecenie: krew
  job_blood: sc(
    U,
    `Pod Ulem czeka chłodziarka z czerwonym krzyżem i adres podziemnego szpitala w Porcie Południowym. Na karteczce dopisek: „Dziewczynka, 7 lat, wypadek. Mamy 15 minut.”

    Najszybsza droga to zalanymi ulicami, motorem.`,
    [
      play('Gnaj motorem przez zalane ulice', 'chase', 1, { to: 'job_blood_ok', effect: { credits: 80 } }, { to: 'job_blood_late', effect: { credits: 40, hp: -1 } }),
    ]
  ),

  job_blood_ok: sc(
    U,
    `Wpadasz do piwnicy pod starą halą rybną z chłodziarką pod pachą. Lekarz w fartuchu z plamami wyrywa ci ją z rąk bez słowa.

    Pół godziny później wychodzi i siada obok ciebie na schodach. „Będzie żyła” — mówi tylko. Zapala papierosa i patrzy w deszcz.`,
    [home]
  ),

  job_blood_late: sc(
    U,
    `Motor ślizga się na zakręcie i lądujesz w kałuży razem z chłodziarką. Ostatnie przecznice biegniesz, kulejąc.

    Dobiegasz minutę po czasie. Lekarz tylko kiwa głową, bierze krew i znika w środku. Godzinę później wychodzi zmęczony. „Zdążyliśmy. Na styk. Następnym razem nie pij kawy po drodze.”`,
    [home]
  ),

  // Zlecenie: list
  job_letter: sc(
    U,
    `List jest w prawdziwej kopercie, z prawdziwym znaczkiem. Takich nikt już nie wysyła. Nadawca: Adam Rybak, Iglica Halcyon, poziom 160. Odbiorca: Leokadia Rybak, Dolina, ulica Kanałowa 3.

    Pod adresem mieszka staruszka, która otwiera drzwi z kotem na rękach. Patrzy na kopertę i blednie.`,
    [go('Podaj jej list', 'job_letter2')]
  ),

  job_letter2: sc(
    U,
    `„To od syna” — szepcze pani Leokadia. — „Dwanaście lat temu wyjechał do Iglic. Nie pisał. Ani razu.”

    Wyciąga z kieszeni okulary, ale ręce drżą jej tak, że nie może ich założyć. „Przeczytasz mi? Ja już nie widzę tak dobrze.”`,
    [go('Przeczytaj list na głos', 'job_letter3')]
  ),

  job_letter3: sc(
    U,
    `„Mamo. Przepraszam, że tak długo. Tutaj, na górze, łatwo zapomnieć, że istnieje dół. Mam dobrą pracę, mieszkanie z oknem na słońce i wszystko, czego chciałem.

    Ale ostatnio śni mi się nasza kuchnia. Twoje racuchy. Deszcz na parapecie. Budzę się i nie wiem, czy to moje sny, czy coś, co sprzedają nam w aplikacji do relaksu.

    Chcę przyjechać na święta. Jeśli mnie jeszcze chcesz. Adam.”

    Pani Leokadia płacze w kota.`,
    [go('Zostaw ją z listem', 'ul_hub', { effect: { credits: 30, trust: 1, flag: 'letter_read' } })]
  ),

  // Zlecenie: paczka bez pytań
  job_box: sc(
    U,
    `Paczka jest ciężka, owinięta w czarną folię i oklejona taśmą. Nadawca: nieznany. Odbiorca: Kruczy róg bazaru. Wynagrodzenie płatne z góry. Sto dwadzieścia kredytów.

    Kiedy podnosisz paczkę, coś w środku cicho bzyczy.`,
    [
      go('Dostarcz bez pytań', 'job_box_deliver', { effect: { credits: 120 } }),
      go('Rozetnij taśmę i zajrzyj do środka', 'job_box_open'),
    ]
  ),

  job_box_open: sc(
    U,
    `W środku leżą trzy drony Halcyonu, rozebrane do połowy. Na każdym naklejka: WŁASNOŚĆ PROJEKTU SPOKÓJ. Ktoś je ukradł z magazynu i przerabia na coś swojego.

    Mira mówi: „Te drony mają moduły do odczytu wszczepów. Jeśli Kruki je przerobią, mogą podsłuchiwać ludzi na Śluzie. Albo zakłócać sygnał vana.”`,
    [
      go('Dostarcz paczkę Krukom', 'job_box_deliver', { effect: { credits: 120 } }),
      go('Zanieś drony Oku na Wieżę', 'job_box_oko', { effect: { flag: 'drones_to_oko' } }),
    ]
  ),

  job_box_deliver: sc(
    U,
    `Kruk w masce z dziobem odbiera paczkę bez słowa i znika za straganem. Kredyty już są na twoim koncie.

    Ktoś zawsze płaci za to, żeby nie pytać. W Dolinie to najlepiej płatna praca.`,
    [home]
  ),

  job_box_oko: sc(
    U,
    `Oko rozkłada drony na stole i gwiżdże z uznaniem.

    „Moduły odczytu wszczepów. Halcyon używa ich w vanach na Śluzie.” Przekręca coś śrubokrętem. „Jak je przeprogramuję, mogę zagłuszyć zbieranie danych na całej Śluzie. Na jakiś czas. Ludzie przestaną tracić wspomnienia, choć tych utraconych nie oddadzą.”

    „Kruki będą wściekłe. Ale kto by się przejmował Krukami.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { trust: 1, flag: 'sluza_jammed' } })]
  ),

  // Kot pani Zofii
  ul_zofia: sc(
    U,
    `Pani Zofia z kapsuły 4012 otwiera drzwi w szlafroku w różowe flamingi. Ma oczy czerwone od płaczu.

    „Pimpek zniknął! Mój kot! Od wczoraj go nie ma. Ul jest taki wielki, a on taki mały.”`,
    [go('„Poszukam go.”', 'ul_cat1', { effect: { flag: 'job_cat' } }), home]
  ),

  ul_cat1: sc(
    U,
    `Szukasz Pimpka na klatce schodowej, w szybie windy, w pralni na dziesiątym piętrze. Nic.

    Mira podpowiada: „Koty lubią ciepło. Gdzie w Ulu jest najcieplej?”

    Kotłownia w piwnicy. Albo dach, gdzie stoją wentylatory serwerowni piętra pięćdziesiątego.`,
    [
      go('Zejdź do kotłowni', 'ul_cat_boiler'),
      go('Wejdź na dach', 'ul_cat_roof'),
    ]
  ),

  ul_cat_boiler: sc(
    U,
    `W kotłowni jest gorąco i ciemno. Coś szura w kącie. Szczur, wielki jak kot, ale nie kot.

    Pimpka tu nie ma.`,
    [go('Wejdź na dach', 'ul_cat_roof')]
  ),

  ul_cat_roof: sc(
    U,
    `Na dachu, przy kratce wentylatora, który dmucha ciepłym powietrzem z serwerowni, śpi rudy kot z jednym uchem. Na obroży napis: PIMPEK.

    Kiedy go podnosisz, mruczy jak mały silnik i drapie cię w rękę. Z wdzięczności, zapewne.`,
    [go('Odnieś kota pani Zofii', 'ul_cat_done')]
  ),

  ul_cat_done: sc(
    U,
    `Pani Zofia porywa Pimpka w ramiona i obcałowuje go po całym pyszczku. Kot wygląda na niezadowolonego.

    „Dziecko złote!” Wciska ci w ręce słoik konfitur i pięćdziesiąt kredytów. „Z wiśni z Iglic. Mój zięć tam pracuje. Wiśnie mają, a serca nie mają.”`,
    [go('Wróć do kapsuły', 'ul_hub', { effect: { credits: 50, hp: 1 } })]
  ),

  // Ostatnia noc przed Iglicą
  ul_night: sc(
    'Dolina · Ostatnia noc',
    `Wracasz do kapsuły, kiedy nad Doliną zapada noc. Klucz Oka leży na materacu obok chipu. Jutro Iglica.

    Siadasz pod okienkiem. Deszcz rysuje na szybie mapy miast, których nie ma.

    „Nie śpisz” — zauważa Mira. — „Ja też nie. Chociaż ja nigdy nie śpię.”`,
    [
      go('„Boisz się jutra?”', 'ul_night_fear'),
      go('„Opowiedz mi coś na dobranoc.”', 'ul_night_story'),
    ]
  ),

  ul_night_fear: sc(
    'Dolina · Ostatnia noc',
    `„Tak” — mówi Mira po prostu. — „Ale inaczej niż wcześniej. Wcześniej bałam się, że mnie wyczyszczą. Teraz boję się, że coś ci się stanie przeze mnie.”

    „To chyba znaczy, że mam znowu coś do stracenia. Dziwne uczucie. Prawie przyjemne.”`,
    [go('Posłuchaj deszczu', 'ul_night_visit')]
  ),

  ul_night_story: sc(
    'Dolina · Ostatnia noc',
    `Mira opowiada ci o rybaku z Portu Południowego, który co noc wypływał we mgłę szukać latarni. Latarni nie było od pięćdziesięciu lat, ale on i tak wypływał. Bo ktoś musiał pamiętać, gdzie stała.

    „To nie moje wspomnienie” — mówi na koniec. — „To kogoś z chipu. Ale chyba mi go dał, żebym ci je opowiedziała.”`,
    [go('Zamknij oczy', 'ul_night_visit')]
  ),

  ul_night_visit: route(
    { if: { flag: 'pchla_friend' }, to: 'ul_night_pchla' },
    { if: { flag: 'bruno_ally' }, to: 'ul_night_bruno' },
    { to: 'ul_night_end' }
  ),

  ul_night_pchla: sc(
    'Dolina · Ostatnia noc',
    `O drugiej w nocy coś stuka w okienko. Kuba, z połatanym skrzydłem, trzyma w dziobie zwinięty liścik.

    Pismo krzywe, ale staranne: „Jak będziesz na górze, popatrz na słońce. Za mnie i za mamę. Kuba będzie leciał za kolejką, jakby co. Pchła.”`,
    [go('Uśmiechnij się w ciemności', 'ul_night_end', { effect: { flag: 'pchla_escort' } })]
  ),

  ul_night_bruno: sc(
    'Dolina · Ostatnia noc',
    `O północy przychodzi wiadomość od Bruna. Jedna linijka, bez emotikonów.

    „Pączek z różowym lukrem czeka w barze. Jak wrócicie. Oboje.”

    Mira śmieje się cicho. „On naprawdę o tym pamięta.”`,
    [go('Zamknij oczy', 'ul_night_end')]
  ),

  ul_night_end: sc(
    'Dolina · Ostatnia noc',
    `Zasypiasz w końcu nad ranem, z chipem w zaciśniętej dłoni.

    Śni ci się dziewczyna z warkoczem, która lutuje radio na dachu bloku siódmego i śmieje się z chłopaka, który fałszuje na gitarze. W tym śnie świeci słońce. W Dolinie nigdy nie świeci słońce.

    Rano wszystko jest gotowe na Iglicę.`,
    [go('Wyjdź na ulicę', '@map', { effect: { flag: 'ul_night', hp: 1 } })]
  ),
};
