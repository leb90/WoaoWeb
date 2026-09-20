export const CLASSIC_FRAME_WIDTH = 1280;
export const CLASSIC_FRAME_HEIGHT = 720;
export const CLASSIC_BG_SRC = "/ui/classic/frmMain_bg.jpg";

export const CLASSIC_SLOTS = {
    chat: { left: 216, top: 16, width: 680, height: 79 },
    chatTabs: { left: 1048, top: 16, width: 112, height: 79 },
    view: { left: 208, top: 123, width: 801, height: 515 },
    canvas: { left: 208, top: 123, width: 800, height: 512 },
    name: { left: 1088, top: 38, width: 168, height: 22 },
    level: { left: 1048, top: 56, width: 40, height: 22 },
    gold: { left: 1188, top: 92, width: 80, height: 16 },
    inventoryTab: { left: 1040, top: 160, width: 105, height: 41 },
    spellsTab: { left: 1144, top: 160, width: 105, height: 41 },
    inv: { left: 1048, top: 208, width: 192, height: 192 },
    lanzar: { left: 1040, top: 377, width: 108, height: 33 },
    info: { left: 1168, top: 377, width: 78, height: 33 },
    sta: { left: 1041, top: 436, width: 198, height: 28 },
    hp: { left: 1041, top: 482, width: 198, height: 28 },
    mana: { left: 1041, top: 527, width: 198, height: 28 },
    food: { left: 1040, top: 572, width: 198, height: 28 },
    water: { left: 1040, top: 618, width: 198, height: 28 },
    exp: { left: 452, top: 642, width: 376, height: 39 },
    expLabel: { left: 464, top: 652, width: 351, height: 18 },
    minimap: { left: 1166, top: 668, width: 92, height: 36 },
    events: { left: 18, top: 72, width: 176, height: 268 },
    quests: { left: 18, top: 352, width: 176, height: 248 },
    mount: { left: 16, top: 638, width: 88, height: 28 },
    ranked: { left: 108, top: 638, width: 88, height: 28 },
    macros: { left: 248, top: 588, width: 240, height: 44 },
} as const;

export const CLASSIC_BAR_SRC = {
    hp: "/ui/classic/Hpshp.jpg",
    mana: "/ui/classic/MANShp.jpg",
    sta: "/ui/classic/STAShp.jpg",
    food: "/ui/classic/COMIDAsp.jpg",
    water: "/ui/classic/AGUAsp.jpg",
    exp: "/ui/classic/ExpSP.jpg",
    lanzar: "/ui/classic/LanzarX.jpg",
    info: "/ui/classic/InfoX.jpg",
    inventory: "/ui/classic/FondoInventario.png",
} as const;
