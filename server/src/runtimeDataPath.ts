import path from "node:path";
export function runtimeDataPath(file: string, legacyRelative?: string): string {
    if (process.env.WOAO_DATA_DIR) return path.join(process.env.WOAO_DATA_DIR, file);
    return legacyRelative ? path.resolve(__dirname, legacyRelative) : path.resolve(__dirname, "../data", file);
}
