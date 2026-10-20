// Decodifica y valida una imagen mandada como data URL
// ("data:image/png;base64,..."). Se chequea el mime declarado, el tamaño ya
// decodificado y la firma de los primeros bytes, para no guardar (y despues
// servir con Content-Type de imagen) algo que no es la imagen que dice ser.

export type AllowedImageMime = "image/png" | "image/jpeg" | "image/webp";

export type DecodedImage = {
    mime: AllowedImageMime;
    data: Buffer;
};

export type DecodeImageResult =
    | { ok: true; image: DecodedImage }
    | { ok: false; error: string };

const DATA_URL_PATTERN = /^data:(image\/(?:png|jpeg|webp));base64,([A-Za-z0-9+/\s]+={0,2})$/;

function matchesSignature(mime: AllowedImageMime, data: Buffer): boolean {
    switch (mime) {
        case "image/png":
            return (
                data.length >= 8 &&
                data.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))
            );
        case "image/jpeg":
            return data.length >= 3 && data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff;
        case "image/webp":
            return (
                data.length >= 12 &&
                data.toString("ascii", 0, 4) === "RIFF" &&
                data.toString("ascii", 8, 12) === "WEBP"
            );
    }
}

export function decodeImageDataUrl(value: string, maxBytes: number): DecodeImageResult {
    const invalidFormat = {
        ok: false as const,
        error: "La imagen tiene que ser PNG, JPG o WEBP.",
    };
    // base64 ocupa ~4/3 del binario: se corta antes de decodificar strings
    // claramente demasiado grandes.
    const maxEncodedLength = Math.ceil((maxBytes * 4) / 3) + 1024;
    const maxLabel =
        maxBytes >= 1024 * 1024
            ? `${Math.floor((maxBytes / (1024 * 1024)) * 10) / 10} MB`
            : `${Math.floor(maxBytes / 1024)} KB`;
    const tooBig = {
        ok: false as const,
        error: `La imagen no puede pesar más de ${maxLabel}.`,
    };

    if (value.length > maxEncodedLength + 64) {
        return tooBig;
    }

    const match = DATA_URL_PATTERN.exec(value.trim());

    if (!match) {
        return invalidFormat;
    }

    const mime = match[1] as AllowedImageMime;
    const data = Buffer.from(match[2]!.replace(/\s+/g, ""), "base64");

    if (data.length === 0) {
        return invalidFormat;
    }

    if (data.length > maxBytes) {
        return tooBig;
    }

    if (!matchesSignature(mime, data)) {
        return invalidFormat;
    }

    return { ok: true, image: { mime, data } };
}
