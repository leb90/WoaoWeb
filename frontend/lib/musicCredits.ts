// Música de otros autores que usa el juego, con su licencia (la wiki la muestra en Créditos). Las CC BY piden que el
// crédito se vea: al sumar un tema, agregarlo acá y en docs/CREDITOS_SONIDOS.md.

export type MusicCredit = {
    uso: string;
    titulo: string;
    autor: string;
    licencia: "CC0" | "CC BY 3.0" | "CC BY 4.0";
    enlace: string;
};

export const LICENSE_LINKS: Record<MusicCredit["licencia"], string> = {
    CC0: "https://creativecommons.org/publicdomain/zero/1.0/",
    "CC BY 3.0": "https://creativecommons.org/licenses/by/3.0/",
    "CC BY 4.0": "https://creativecommons.org/licenses/by/4.0/",
};

// Ciudades y tipos de lugar (lib/worldMusic.ts).
export const WORLD_MUSIC_CREDITS: MusicCredit[] = [
    { uso: "Ullathorpe", titulo: "Townsong", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-townsong.html" },
    { uso: "Nix", titulo: "Tam Lin", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-tam-lin.html" },
    { uso: "Banderbill", titulo: "Medieval Chateau", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-medieval-chateau.html" },
    { uso: "Lindos", titulo: "The Streets of Prague", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-the-streets-of-prague.html" },
    { uso: "Ciudad Caos", titulo: "Balefire", autor: "Scott Buckley", licencia: "CC BY 4.0", enlace: "https://www.scottbuckley.com.au/library/balefire/" },
    { uso: "Bosques", titulo: "Woods of Imagination", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-woods-of-imagination.html" },
    { uso: "Bosques", titulo: "Spirits of the Greenwood", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-spirits-of-the-greenwood.html" },
    { uso: "Campos", titulo: "Tranquil Fields (Peaceful)", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-tranquil-fields-peaceful.html" },
    { uso: "Campos", titulo: "Pathfinder", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-pathfinder.html" },
    { uso: "Mar e islas", titulo: "The Great Sea", autor: "Scott Buckley", licencia: "CC BY 4.0", enlace: "https://www.scottbuckley.com.au/library/the-great-sea/" },
    { uso: "Mar e islas", titulo: "Seven Seas", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-seven-seas.html" },
    { uso: "Desierto", titulo: "The Desert (The Grand Score)", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-the-desert.html" },
    { uso: "Desierto", titulo: "Tranquil Fields (Eastern)", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-tranquil-fields-eastern.html" },
    { uso: "Nieve", titulo: "Traversing the White Peaks", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-traversing-the-white-peaks.html" },
    { uso: "Nieve", titulo: "Frost", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-frost.html" },
    { uso: "Bosque del terror", titulo: "Headless Horseman", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-headless-horseman.html" },
    { uso: "Bosque del terror", titulo: "Dark Hollows", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-dark-hollows.html" },
    { uso: "Cuevas y minas", titulo: "Mysterious Adventure", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-mysterious-adventure.html" },
    { uso: "Cuevas y minas", titulo: "Odin’s Blessing", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-odins-blessing.html" },
    { uso: "Castillos y fortalezas", titulo: "Song of the Forge", autor: "Scott Buckley", licencia: "CC BY 4.0", enlace: "https://www.scottbuckley.com.au/library/song-of-the-forge/" },
    { uso: "Castillos y fortalezas", titulo: "Might & Magic", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-might-magic.html" },
    { uso: "Aldeas", titulo: "Village Ambiance", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-village-ambiance.html" },
    { uso: "Aldeas", titulo: "Farm", autor: "Alexander Nakarada (CreatorChords)", licencia: "CC BY 4.0", enlace: "https://www.free-stock-music.com/alexander-nakarada-farm.html" },
];

// Las páginas de afuera del juego (components/MenuMusic.tsx).
export const MENU_MUSIC_CREDITS: MusicCredit[] = [
    { uso: "Inicio, cuenta y personajes", titulo: "Shoulders of Giants", autor: "Scott Buckley", licencia: "CC BY 4.0", enlace: "https://www.scottbuckley.com.au/library/shoulders-of-giants/" },
    { uso: "Creación de personaje", titulo: "Shop Theme (Buy Something)", autor: "CleytonKauffman", licencia: "CC0", enlace: "https://opengameart.org/content/shop-theme" },
];

// Las mazmorras de la serie (lib/dungeonMusic.ts).
export const DUNGEON_MUSIC_CREDITS: MusicCredit[] = [
    { uso: "Gruta (mazmorra de prueba), tema 1", titulo: "Underwater Theme", autor: "CleytonKauffman", licencia: "CC0", enlace: "https://opengameart.org/content/underwater-theme" },
    { uso: "Gruta, tema 2", titulo: "Underwater Theme II", autor: "CleytonKauffman", licencia: "CC0", enlace: "https://opengameart.org/content/underwater-theme-ii" },
    { uso: "Gruta, tema 3", titulo: "Nautilus", autor: "poinl", licencia: "CC0", enlace: "https://opengameart.org/content/nautilus" },
    { uso: "Gruta, combate", titulo: "Epic Boss Battle", autor: "Juhani Junkala (SubspaceAudio)", licencia: "CC0", enlace: "https://opengameart.org/content/boss-battle-music" },
    { uso: "Caverna de las Llaves, tema 1", titulo: "Cave Theme", autor: "Brandon75689 (publicado por HaelDB)", licencia: "CC0", enlace: "https://opengameart.org/content/cave-theme" },
    { uso: "Caverna, tema 2", titulo: "Dungeon Ambience", autor: "yd", licencia: "CC0", enlace: "https://opengameart.org/content/dungeon-ambience" },
    { uso: "Caverna, tema 3", titulo: "RPG Exploration - (The Black Temple)", autor: "Hitctrl", licencia: "CC BY 3.0", enlace: "https://opengameart.org/content/rpg-exploration-the-black-temple" },
    { uso: "Caverna, combate", titulo: "Battle Theme A", autor: "cynicmusic (cynicmusic.com, pixelsphere.org)", licencia: "CC0", enlace: "https://opengameart.org/content/battle-theme-a" },
    { uso: "Cueva de la Cola, tema 1", titulo: "8bit Dungeon Level", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200066" },
    { uso: "Cueva, tema 2", titulo: "Video Dungeon Crawl", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1200064" },
    { uso: "Cueva, tema 3", titulo: "Dubious Dungeon", autor: "Bogart VGM", licencia: "CC BY 4.0", enlace: "https://opengameart.org/content/dubious-dungeon" },
    { uso: "Cueva, combate", titulo: "Zelda Style 8-bit Boss Theme", autor: "HydroGene", licencia: "CC0", enlace: "https://opengameart.org/content/zelda-style-8-bit-boss-theme" },
    { uso: "Gruta de la Botella, tema 1", titulo: "Mirage", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100877" },
    { uso: "Gruta de la Botella, tema 2", titulo: "Mystery Bazaar", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700005" },
    { uso: "Gruta de la Botella, tema 3", titulo: "Hidden Wonders", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700006" },
    { uso: "Gruta de la Botella, combate", titulo: "Ibn Al-Noor", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100706" },
    { uso: "Santuario del Rostro, tema 1", titulo: "Temple of the Manes", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100053" },
    { uso: "Santuario del Rostro, tema 2", titulo: "Vulcan", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100525" },
    { uso: "Santuario del Rostro, tema 3", titulo: "Shamanistic", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100353" },
    { uso: "Santuario del Rostro, combate", titulo: "Grim Idol", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700043" },
    { uso: "Fauces del Bagre, tema 1", titulo: "Water Prelude", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100017" },
    { uso: "Fauces del Bagre, tema 2", titulo: "Floating Cities", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600018" },
    { uso: "Fauces del Bagre, tema 3", titulo: "Immersed", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600010" },
    { uso: "Fauces del Bagre, combate", titulo: "Eternal Terminal", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700047" },
    { uso: "Torre del Águila, tema 1", titulo: "Thunderbird", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600017" },
    { uso: "Torre del Águila, tema 2", titulo: "Ascending the Vale", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1600064" },
    { uso: "Torre del Águila, tema 3", titulo: "The Sky of our Ancestors", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700056" },
    { uso: "Torre del Águila, combate", titulo: "Crossing the Chasm", autor: "Kevin MacLeod (incompetech.com)", licencia: "CC BY 4.0", enlace: "https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1700026" },
];
