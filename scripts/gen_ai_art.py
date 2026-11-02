"""Generuje realistyczne obrazy scen i portrety postaci w Pollinations.ai.

Surowe obrazy trafiają do folderu podanego jako argument (domyślnie ./ai-raw),
a scripts/grade_art.py przycina je i ujednolica do assets/scenes i assets/portraits.
Darmowy limit to jeden obraz na ~45 sekund, więc skrypt sam czeka między zapytaniami.
Uruchom: python scripts/gen_ai_art.py [folder] [klucz ...]
Inny wariant wybranych obrazów: SEED_SHIFT=7 python scripts/gen_ai_art.py ai-raw bar tower
"""

import os
import re
import sys
import time
import urllib.parse
import urllib.request

STYLE = (
    'cinematic film still, cyberpunk noir, realistic photograph, night, rain, neon pink and cyan light, '
    'volumetric fog, 35mm lens, shallow depth of field, moody, highly detailed, no text, no letters, no watermark'
)
MEMORY = 'dreamy hazy memory, soft focus, nostalgic film photograph, warm pink tint, realistic, no text, no watermark'
PORTRAIT = (
    'cinematic close-up portrait photograph, cyberpunk noir, realistic face, neon rim light, dark background, '
    '85mm lens, shallow depth of field, highly detailed, no text, no watermark'
)

SCENES = {
    'street': 'flooded slum street in a future Polish city, ankle-deep water reflecting neon signs, lone hooded courier walking, giant glass corporate skyscrapers above disappearing into clouds',
    'drone': 'surveillance police drone with a red scanning light beam hovering over a rainy neon street, two hooded gang members behind a lone courier',
    'bike': 'motorbike speeding through a rainy neon-lit street, light trails, motion blur, water splashing',
    'roofs': 'rooftops of a dense slum in heavy rain, a hooded figure leaping between roofs, antennas and air conditioners, distant glowing skyscrapers',
    'bar': 'small grimy bar interior, shelves of glowing bottles, neon sign, nervous heavy bartender sliding a small glowing data chip across the wet counter',
    'laundry': 'empty 24-hour laundromat at night, row of washing machines glowing, flickering fluorescent light, hooded courier sitting on the floor holding a tiny glowing pink chip',
    'sluza': 'old tenement facade in the rain, every window glowing blue from screens with motionless silhouettes of people staring, elderly woman standing in a warmly lit doorway',
    'clinic': 'illegal implant clinic inside an old pharmacy, green neon cross, surgical chair under a bright lamp, shelves with jars of implants, surgeon with steel mechanical fingers',
    'tower': 'old rusty radio tower in the rain above a neon slum, red aviation lights, a small makeshift hacker shack with glowing monitors on a platform halfway up',
    'metro': 'flooded abandoned subway station used as a gang hideout, burning oil barrels reflected in the water, a throne made of old car seats, rats',
    'station': 'clean futuristic maglev train station platform at night, sleek white train with a cyan stripe, wet glossy floor reflections',
    'train': 'interior of a futuristic maglev train above the clouds at sunset, golden light through the windows, empty seats',
    'agent': 'interior of a futuristic train, menacing agent in a long grey coat with a glowing red cybernetic eye standing in the aisle',
    'iglica': 'sterile white futuristic corporate corridor high in a skyscraper, glass walls, bright light strips, small security drones hovering',
    'blackout': 'dark futuristic corporate corridor during a power blackout, red emergency lights, security drones lying on the floor',
    'lab': 'high-tech white laboratory in a corporate skyscraper, holographic displays, female scientist in a spotless white lab coat',
    'server': 'enormous server room, long aisles of racks with blinking green and red lights, cold blue fog, cables',
    'archive': 'secret archive room full of old metal filing cabinets and paper folders, dim warm desk lamp, papers scattered on the floor',
    'ramp': 'spiral emergency ramp inside a skyscraper, red alarm lights, motorbike headlight streak, smoke',
    'dawn': 'dawn over a futuristic city after rain, huge crowd gathered in the street looking up at a giant glass tower, an old radio tower broadcasting, hopeful golden light',
    'cell': 'dark prison cell, cold light through a small barred window, a silhouette sitting on the floor',
    'whiteroom': 'sterile white medical interrogation room, small glowing implant on a metal tray, doctor in white with back turned',
    'network': 'abstract glowing data network of lines and nodes over a night city, a ghostly female face formed from light and data',
    'billboard': 'giant holographic advertisement on a skyscraper showing a gentle female AI assistant face, rainy neon street below with tiny people',
    'ash': 'close-up of a hand crushing a glowing data chip, sparks and glass shards falling, rain, dark',
    'flatline': 'point of view lying on wet asphalt looking up at blurred neon lights in the rain, bokeh, fading vision',
    'bazar': 'crowded night market under a concrete overpass, plastic tarps, stalls with cables and implants, lanterns made of cans, steam from food stalls',
    'checkpoint': 'corporate security checkpoint in a flooded slum street, white container with a red rooftop light, barrier, scanning drone, bored guard in a white raincoat',
    'capsule': 'tiny capsule apartment in a stacked container tower, mattress, small round window with rain, cork board with orange notes, warm lamp',
    'pigeon': 'rooftop pigeon coop made of corrugated metal and old antennas in the rain, real and mechanical pigeons, a boy with goggles',
    'bridge': 'narrow service skybridge between skyscrapers above the clouds, strong wind, safety rails, city lights far below',
    'canteen': 'clean corporate staff canteen inside a skyscraper, white tables, food counters, lockers with white security jackets',
    'security': 'corporate security control room with dozens of camera monitors, blue light, empty chair, coffee cup',
    'port': 'flooded harbor district, half-sunken buildings and port cranes sticking out of grey water, small boats, laundry on rooftops, an old leaning lighthouse',
    'basement': 'damp basement meeting lit by candles, a dozen ordinary people sitting on fruit crates, an old woman pouring tea, a small girl',
    'summit': 'luxurious penthouse office at the top of a skyscraper above the clouds, sunrise through huge windows, a man in an expensive suit standing at the window',
}

MEMORIES = {
    'mem_kitchen': 'cozy small old kitchen, elderly grey-haired grandmother in her seventies cooking soup at the stove and singing, warm light through the window',
    'mem_tower': 'two young sisters standing on a radio tower platform at sunrise, wind in their hair, pink sky',
    'mem_clinic': 'sterile white clinic, smiling female doctor in a white coat handing a tablet with a contract to a young woman',
}

PORTRAITS = {
    'p_mira': 'young woman made of soft pink holographic light and digital glitches, 19 years old, gentle sad eyes, translucent',
    'p_bruno': 'heavy-set middle-aged bartender and fence, greasy apron, stubble, sweaty nervous face, dim bar',
    'p_oko': 'hacker woman in her late twenties, short cropped hair, a camera lens cybernetic implant replacing her left eye, cables',
    'p_kret': 'gang boss with a scarred face, leather jacket, a rat sitting on his shoulder, lit by fire',
    'p_wren': 'female scientist in her forties, immaculate white lab coat, neat hair, cold polite smile, sterile light',
    'p_sokol': 'middle-aged man, male corporate agent in a long grey coat, short grey hair, stubble, glowing red cybernetic eye, stern face',
    'p_igla': 'older woman street surgeon, steel mechanical fingers, magnifying surgical loupes, green neon light',
    'p_halina': 'elderly woman in a headscarf, worried kind face, warm doorway light, rain',
    'p_pchla': 'twelve year old street boy with oversized jacket and goggles on his forehead, mechanical pigeon on his shoulder, cheeky smile',
    'p_sroka': 'small older woman fixer with a grey mohawk and a magnifying lens implant in her right eye, market stall light',
    'p_gawron': 'tall gang leader with feathers braided into his hair, crow beak mask pushed up on his forehead, tired eyes',
    'p_prezes': 'powerful corporate chief executive in his sixties, silver hair, expensive suit, calm cold eyes, sunrise light',
    'p_teodor': 'thin old man with grease stained hands and tired sleepless eyes, dim apartment light',
}


def jobs():
    for i, (k, p) in enumerate(SCENES.items()):
        yield k, f'{p}, {STYLE}', 1024, 576, 100 + i
    for i, (k, p) in enumerate(MEMORIES.items()):
        yield k, f'{p}, {MEMORY}', 1024, 576, 200 + i
    for i, (k, p) in enumerate(PORTRAITS.items()):
        yield k, f'{p}, {PORTRAIT}', 512, 512, 300 + i


def fetch(prompt, w, h, seed):
    url = 'https://image.pollinations.ai/prompt/' + urllib.parse.quote(prompt) + f'?width={w}&height={h}&seed={seed}&nologo=true&model=flux'
    with urllib.request.urlopen(urllib.request.Request(url, headers={'User-Agent': 'neon-sygnal-art'}), timeout=180) as r:
        return r.read()


def main():
    out = sys.argv[1] if len(sys.argv) > 1 else 'ai-raw'
    only = set(sys.argv[2:])
    os.makedirs(out, exist_ok=True)
    for key, prompt, w, h, seed in jobs():
        path = os.path.join(out, key + '.jpg')
        if (only and key not in only) or (not only and os.path.exists(path)):
            continue
        for attempt in range(12):
            try:
                data = fetch(prompt, w, h, seed + int(os.environ.get('SEED_SHIFT', 0)))
                if data[:2] != b'\xff\xd8' and data[:4] != b'\x89PNG':
                    raise ValueError(data[:200])
                with open(path, 'wb') as f:
                    f.write(data)
                print('ok', key, len(data), flush=True)
                time.sleep(47)
                break
            except Exception as e:
                body = getattr(e, 'read', lambda: b'')()
                m = re.search(rb'after (\d+)s', body or str(e).encode())
                wait = int(m.group(1)) + 3 if m else 30
                print('retry', key, getattr(e, 'code', ''), f'{wait}s', flush=True)
                time.sleep(wait)
        else:
            print('FAILED', key, flush=True)


if __name__ == '__main__':
    main()
