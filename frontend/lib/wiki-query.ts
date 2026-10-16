import { normalizeWikiQuery } from "@/lib/wiki-data";

export type WikiSearchParams = Record<
    string,
    string | string[] | undefined
>;

export function getSearchParam(
    params: WikiSearchParams,
    key: string,
): string {
    const value = params[key];
    return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function getPositiveInteger(value: string, fallback = 1): number {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

export function getEntityId(value: string): number {
    return getPositiveInteger(value.split("-")[0] ?? "", 0);
}

function editDistance(left: string, right: string): number {
    if (left === right) return 0;
    if (!left.length) return right.length;
    if (!right.length) return left.length;

    const previous = Array.from({ length: right.length + 1 }, (_, index) => index);

    for (let leftIndex = 1; leftIndex <= left.length; leftIndex += 1) {
        let diagonal = previous[0];
        previous[0] = leftIndex;

        for (let rightIndex = 1; rightIndex <= right.length; rightIndex += 1) {
            const upper = previous[rightIndex];
            const cost = left[leftIndex - 1] === right[rightIndex - 1] ? 0 : 1;
            previous[rightIndex] = Math.min(
                previous[rightIndex] + 1,
                previous[rightIndex - 1] + 1,
                diagonal + cost,
            );
            diagonal = upper;
        }
    }

    return previous[right.length];
}

function isAdjacentTransposition(left: string, right: string): boolean {
    if (left.length !== right.length) return false;

    const differences: number[] = [];
    for (let index = 0; index < left.length; index += 1) {
        if (left[index] !== right[index]) differences.push(index);
        if (differences.length > 2) return false;
    }

    if (differences.length !== 2) return false;
    const [first, second] = differences;
    return (
        second === first + 1 &&
        left[first] === right[second] &&
        left[second] === right[first]
    );
}

function tokenMatches(token: string, words: string[], haystack: string): boolean {
    if (haystack.includes(token)) return true;
    if (token.length < 4) return false;

    const tolerance = token.length >= 8 ? 2 : 1;
    return words.some((word) => {
        if (word.startsWith(token) || token.startsWith(word)) return true;
        if (Math.abs(word.length - token.length) > tolerance) return false;
        if (isAdjacentTransposition(token, word)) return true;
        return editDistance(token, word) <= tolerance;
    });
}

export function matchesWikiQuery(searchIndex: string, query: string): boolean {
    const normalizedQuery = normalizeWikiQuery(query);
    if (!normalizedQuery) return true;

    const haystack = normalizeWikiQuery(searchIndex);
    const words = haystack.split(/\s+/).filter(Boolean);
    return normalizedQuery
        .split(/\s+/)
        .filter(Boolean)
        .every((token) => tokenMatches(token, words, haystack));
}

export function paginate<T>(items: T[], requestedPage: number, pageSize: number) {
    const pageCount = Math.max(1, Math.ceil(items.length / pageSize));
    const page = Math.min(Math.max(1, requestedPage), pageCount);
    const start = (page - 1) * pageSize;

    return {
        items: items.slice(start, start + pageSize),
        page,
        pageCount,
        total: items.length,
        from: items.length ? start + 1 : 0,
        to: Math.min(start + pageSize, items.length),
    };
}

export function withQuery(
    pathname: string,
    params: Record<string, string | number | undefined>,
): string {
    const search = new URLSearchParams();
    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== "") search.set(key, String(value));
    }
    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
}

export function formatWikiNumber(value: number): string {
    return new Intl.NumberFormat("es-AR").format(value);
}

export function formatPercent(value: number | undefined): string {
    return typeof value === "number"
        ? `${new Intl.NumberFormat("es-AR", { maximumFractionDigits: 2 }).format(value)}%`
        : "No informada";
}
