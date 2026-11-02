// Panel /online de los GM (server/src/gmOnline.ts): la lista de conectados, la ficha de un personaje y los cuadros de
// la vista en vivo. Llegan varias veces por segundo, así que no pasan por el HUD (eso redibujaría todo el juego): se
// guardan acá y solo los lee GmOnlineModal con useSyncExternalStore.

export type GmOnlineUser = {
    id: string;
    name: string;
    level: number;
    clase: string;
    raza: string;
    map: number;
    mapName: string;
    x: number;
    y: number;
    dead: boolean;
    gm: boolean;
    bot: boolean;
    clan: string;
    faction: string;
    criminal: boolean;
    activity: string;
    tags: string[];
    minutes: number;
};

export type GmOnlineDetail = {
    id: string;
    online: boolean;
    name: string;
    level: number;
    exp: number;
    expNextLevel: number;
    clase: string;
    raza: string;
    genero: string;
    activity: string;
    tags: string[];
    minutes: number;
    map: number;
    mapName: string;
    x: number;
    y: number;
    vitals: {
        hp: number;
        maxHp: number;
        mana: number;
        maxMana: number;
        sta: number;
        maxSta: number;
        hambre: number;
        maxHambre: number;
        sed: number;
        maxSed: number;
    };
    gold: number;
    attributes: { fuerza: number; agilidad: number; inteligencia: number; constitucion: number };
    skills: {
        tacticasCombate: number;
        defensa: number;
        armas: number;
        proyectiles: number;
        wrestling: number;
        ocultarse: number;
        apunalar: number;
    };
    kills: { npcs: number; ciudadanos: number; criminales: number };
    faction: string;
    factionScore: { armada: number; caos: number };
    criminal: boolean;
    clan: string;
    clanRole: string;
    elo: number;
    jailMinutes: number;
    equipment: Record<"arma" | "armadura" | "escudo" | "casco" | "anillo" | "municion", string | null>;
    status: {
        paralizado: boolean;
        envenenado: boolean;
        ciego: boolean;
        estupido: boolean;
        navegando: boolean;
        montado: boolean;
        zonaSegura: boolean;
    };
    inventory: Array<{ slot: number; name: string; amount: number; equipped: boolean }>;
    spells: string[];
};

export type GmLiveEntity = {
    id: string;
    name: string;
    npc: boolean;
    x: number;
    y: number;
    heading: number;
    body: number;
    head: number;
    weapon: number;
    shield: number;
    helmet: number;
    hp: number;
    maxHp: number;
    dead: boolean;
    invisible: boolean;
    color: string;
};

export type GmLivePlacement = {
    map: number;
    originX: number;
    originY: number;
    interior: { minX: number; maxX: number; minY: number; maxY: number };
};

export type GmLiveFrame = {
    id: string;
    map: number;
    mapName: string;
    x: number;
    y: number;
    activity: string;
    hp: number;
    maxHp: number;
    mana: number;
    maxMana: number;
    placements: GmLivePlacement[];
    entities: GmLiveEntity[];
    items: Array<{ x: number; y: number; obj: number }>;
    speech: Array<{ id: string; text: string }>;
    receivedAt: number;
};

export type GmFeedLine = { key: number; text: string; color: string };

export type GmOnlineState = {
    open: boolean;
    // El GM acaba de escribir /online: la próxima lista abre el panel. Sin esto, una lista que llega tarde lo
    // volvería a abrir después de cerrarlo.
    requestedAt: number;
    users: GmOnlineUser[];
    pve: number;
    pvp: number;
    listReceivedAt: number;
    selectedId: string | null;
    detail: GmOnlineDetail | null;
    frame: GmLiveFrame | null;
    // El cuadro anterior: la vista interpola las posiciones entre los dos.
    previousFrame: GmLiveFrame | null;
    feed: GmFeedLine[];
    offline: boolean;
};

const MAX_FEED_LINES = 80;
const REQUEST_WINDOW_MS = 10_000;

const INITIAL_STATE: GmOnlineState = {
    open: false,
    requestedAt: 0,
    users: [],
    pve: 0,
    pvp: 0,
    listReceivedAt: 0,
    selectedId: null,
    detail: null,
    frame: null,
    previousFrame: null,
    feed: [],
    offline: false,
};

let state: GmOnlineState = INITIAL_STATE;
let feedKey = 0;
const listeners = new Set<() => void>();
const chunkBuffer = { text: "", expected: 0, total: 0 };

function setState(next: Partial<GmOnlineState>): void {
    state = { ...state, ...next };
    for (const listener of listeners) {
        listener();
    }
}

export function subscribeGmOnline(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

export function getGmOnlineState(): GmOnlineState {
    return state;
}

export function getGmOnlineServerState(): GmOnlineState {
    return INITIAL_STATE;
}

export function requestGmOnline(): void {
    setState({ requestedAt: Date.now() });
}

/** El GM eligió a alguien: se limpia lo del anterior hasta que llegue lo nuevo. */
export function selectGmOnlineUser(id: string | null): void {
    setState({ selectedId: id, detail: null, frame: null, previousFrame: null, feed: [], offline: false });
}

export function closeGmOnline(): void {
    state = INITIAL_STATE;
    chunkBuffer.text = "";
    chunkBuffer.expected = 0;
    chunkBuffer.total = 0;
    for (const listener of listeners) {
        listener();
    }
}

type GmOnlinePayload =
    | { kind: "list"; users: GmOnlineUser[]; pve: number; pvp: number }
    | ({ kind: "detail" } & GmOnlineDetail)
    | ({ kind: "frame"; feed: Array<{ text: string; color: string }> } & Omit<GmLiveFrame, "receivedAt">)
    | { kind: "offline"; id: string };

function applyPayload(payload: GmOnlinePayload): void {
    switch (payload.kind) {
        case "list":
            if (!state.open && Date.now() - state.requestedAt > REQUEST_WINDOW_MS) {
                return;
            }
            setState({
                open: true,
                requestedAt: 0,
                users: payload.users,
                pve: payload.pve,
                pvp: payload.pvp,
                listReceivedAt: Date.now(),
            });
            return;

        case "detail": {
            if (!state.open || payload.id !== state.selectedId) {
                return;
            }
            setState({ detail: payload, offline: false });
            return;
        }

        case "frame": {
            if (!state.open || payload.id !== state.selectedId) {
                return;
            }
            const { feed, ...frame } = payload;
            const lines = feed.map((line) => ({ key: ++feedKey, text: line.text, color: line.color }));
            setState({
                previousFrame: state.frame?.map === frame.map ? state.frame : null,
                frame: { ...frame, receivedAt: performance.now() },
                feed: lines.length ? [...state.feed, ...lines].slice(-MAX_FEED_LINES) : state.feed,
                offline: false,
            });
            return;
        }

        case "offline":
            if (state.open && payload.id === state.selectedId) {
                setState({ offline: true });
            }
            return;
    }
}

export type GmOnlineChunk = { chunkIndex: number; totalChunks: number; chunk: string };

export function receiveGmOnlineChunk({ chunkIndex, totalChunks, chunk }: GmOnlineChunk): void {
    if (chunkIndex === 0 || chunkBuffer.total !== totalChunks || chunkIndex !== chunkBuffer.expected) {
        chunkBuffer.text = "";
        chunkBuffer.expected = 0;
        chunkBuffer.total = totalChunks;
        if (chunkIndex !== 0) {
            return;
        }
    }

    chunkBuffer.text += chunk;
    chunkBuffer.expected += 1;

    if (chunkBuffer.expected < totalChunks) {
        return;
    }

    const text = chunkBuffer.text;
    chunkBuffer.text = "";
    chunkBuffer.expected = 0;
    chunkBuffer.total = 0;

    try {
        applyPayload(JSON.parse(text) as GmOnlinePayload);
    } catch (error) {
        console.error("Error leyendo el panel /online", error);
    }
}
