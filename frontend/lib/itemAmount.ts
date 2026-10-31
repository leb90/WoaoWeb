// Cantidad de una pila de items. En la Arena nada se gasta (pociones y flechas): se muestra ∞.
export function formatStackAmount(amount: number, infinite = false): string {
    return infinite ? "∞" : String(amount);
}
