// Consola de los personajes que un GM está mirando desde /online (gmOnline.ts). handleProtocol le pasa cada mensaje
// de consola y cada diálogo que le llega al personaje observado; el panel del GM los muestra en vivo. Sin nadie
// mirando no se guarda nada. No depende de otros módulos para que handleProtocol lo pueda importar sin ciclos.
export type SpectateFeedLine = {
    seq: number;
    text: string;
    color: string;
    at: number;
    // Quién habló y qué dijo, cuando la línea es un diálogo: el panel lo dibuja como globo sobre ese personaje.
    speakerId?: string;
    speech?: string;
};

const MAX_LINES = 60;

const feeds = new Map<string, { watchers: number; lines: SpectateFeedLine[] }>();
let lastSeq = 0;

export function watchFeed(targetId: unknown): void {
    const key = String(targetId);
    const feed = feeds.get(key);

    if (feed) {
        feed.watchers += 1;
        return;
    }

    feeds.set(key, { watchers: 1, lines: [] });
}

export function unwatchFeed(targetId: unknown): void {
    const key = String(targetId);
    const feed = feeds.get(key);

    if (!feed) {
        return;
    }

    feed.watchers -= 1;

    if (feed.watchers <= 0) {
        feeds.delete(key);
    }
}

export function isFeedWatched(targetId: unknown): boolean {
    return targetId !== undefined && targetId !== null && feeds.has(String(targetId));
}

export function recordFeedLine(
    targetId: unknown,
    text: unknown,
    color: unknown,
    speaker?: { id: unknown; text: string },
): void {
    if (targetId === undefined || targetId === null) {
        return;
    }

    const feed = feeds.get(String(targetId));
    const line = String(text ?? "").trim();

    if (!feed || !line) {
        return;
    }

    lastSeq += 1;
    feed.lines.push({
        seq: lastSeq,
        text: line,
        color: typeof color === "string" && color ? color : "white",
        at: Date.now(),
        ...(speaker ? { speakerId: String(speaker.id), speech: speaker.text.trim() } : {}),
    });

    if (feed.lines.length > MAX_LINES) {
        feed.lines.splice(0, feed.lines.length - MAX_LINES);
    }
}

export function feedLinesSince(targetId: unknown, seq: number): SpectateFeedLine[] {
    const feed = feeds.get(String(targetId));
    return feed ? feed.lines.filter((line) => line.seq > seq) : [];
}

export function recentSpeech(targetId: unknown, sinceAt: number): SpectateFeedLine[] {
    const feed = feeds.get(String(targetId));
    return feed ? feed.lines.filter((line) => line.speakerId && line.at >= sinceAt) : [];
}

export function lastFeedSeq(targetId: unknown): number {
    const lines = feeds.get(String(targetId))?.lines;
    return lines?.length ? lines[lines.length - 1].seq : lastSeq;
}
