import fs from "node:fs";
import path from "node:path";

/** Journal local: se escribe antes del envío y el receptor confirma por ID idempotente. */
export class DurableOutbox {
    private pending: Record<string, any> = {};
    private running: Promise<void> | undefined;
    constructor(
        private file: string,
        private deliver: (id: string, payload: any) => Promise<void>,
    ) {
        if (fs.existsSync(file)) this.pending = JSON.parse(fs.readFileSync(file, "utf8"));
    }
    get size() {
        return Object.keys(this.pending).length;
    }
    hasPending(predicate: (payload: any) => boolean) {
        return Object.values(this.pending).some(predicate);
    }
    private persist() {
        fs.mkdirSync(path.dirname(this.file), { recursive: true });
        fs.writeFileSync(this.file + ".tmp", JSON.stringify(this.pending));
        fs.renameSync(this.file + ".tmp", this.file);
    }
    enqueue(id: string, payload: any) {
        if (this.pending[id] && JSON.stringify(this.pending[id]) !== JSON.stringify(payload))
            throw new Error("Premio pendiente con datos distintos");
        this.pending[id] = payload;
        this.persist();
    }
    flush(): Promise<void> {
        if (this.running) return this.running;
        this.running = this.process().finally(() => {
            this.running = undefined;
        });
        return this.running;
    }
    private async process() {
        for (const [id, payload] of Object.entries(this.pending)) {
            try {
                await this.deliver(id, payload);
            } catch {
                continue;
            }
            delete this.pending[id];
            this.persist();
        }
    }
}
