import assert from "node:assert/strict";
import { describe, test } from "vitest";
import {
    hasWorldAccess,
    parseWorldAccessAllowlist,
} from "../lib/worldAccess";

const ALLOWLIST = parseWorldAccessAllowlist("lebnov,wind@example.com");

describe("parseWorldAccessAllowlist", () => {
    test("sin variable o vacía no hay restricción", () => {
        assert.equal(parseWorldAccessAllowlist(undefined), null);
        assert.equal(parseWorldAccessAllowlist(""), null);
        assert.equal(parseWorldAccessAllowlist(" , "), null);
    });

    test("separa por coma e ignora espacios y entradas vacías", () => {
        assert.deepEqual(parseWorldAccessAllowlist(" lebnov , a@b.com ,, "), [
            "lebnov",
            "a@b.com",
        ]);
    });
});

describe("hasWorldAccess", () => {
    const account = (name: string, email: string) => ({ name, email });

    test("sin lista entran todas las cuentas", () => {
        assert.equal(hasWorldAccess(account("Pepe", "pepe@x.com"), null), true);
    });

    test("entra la cuenta lebnov, sin importar mayúsculas ni su email", () => {
        for (const name of ["lebnov", "Lebnov", " LEBNOV "]) {
            assert.equal(
                hasWorldAccess(account(name, "otro@x.com"), ALLOWLIST),
                true,
            );
        }
    });

    test("entra la cuenta de ese email, sin importar mayúsculas ni su nombre", () => {
        assert.equal(
            hasWorldAccess(
                account("Wind", "Wind@Example.com"),
                ALLOWLIST,
            ),
            true,
        );
    });

    test("no entra ninguna otra cuenta", () => {
        assert.equal(
            hasWorldAccess(account("Pepe", "pepe@x.com"), ALLOWLIST),
            false,
        );
    });

    test("un email solo vale como email y un nombre solo como nombre", () => {
        assert.equal(
            hasWorldAccess(
                account("wind@example.com", "pepe@x.com"),
                ALLOWLIST,
            ),
            false,
        );
        assert.equal(
            hasWorldAccess(account("Pepe", "lebnov"), ALLOWLIST),
            false,
        );
    });

    test("un parecido no alcanza", () => {
        assert.equal(
            hasWorldAccess(
                account("lebnov2", "wind@example.com.ar"),
                ALLOWLIST,
            ),
            false,
        );
    });
});
