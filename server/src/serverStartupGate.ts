type GameSocket = { readyState: number; OPEN: number; close: (code: number, reason: string) => void };
export function acceptGameMessage(socket: GameSocket, serverReady: boolean): boolean {
    if (socket.readyState !== socket.OPEN) return false;
    if (!serverReady) {
        socket.close(1013, "El mundo está iniciando. Reintenta en unos segundos.");
        return false;
    }
    return true;
}
