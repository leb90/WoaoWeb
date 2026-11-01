"use client";

import { useEffect } from "react";
import { warmGameCursors } from "@/lib/gameCursors";

// Deja los cursores del juego decodificados en memoria desde la primera página (lib/gameCursors.ts).
export default function CursorWarmup() {
    useEffect(() => {
        void warmGameCursors();
    }, []);

    return null;
}
