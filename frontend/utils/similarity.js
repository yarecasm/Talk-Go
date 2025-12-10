// utils/similarity.js

// Calcula la distancia de Levenshtein entre dos strings
export function levenshtein(a, b) {
    const matrix = Array.from({ length: a.length + 1 }, () =>
        Array(b.length + 1).fill(0)
    );

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i;
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1] === b[j - 1] ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,      // eliminación
                matrix[i][j - 1] + 1,      // inserción
                matrix[i - 1][j - 1] + cost // sustitución
            );
        }
    }
    return matrix[a.length][b.length];
}

// Devuelve un valor entre 0 y 1 (1 = idéntico)
export function similarity(a, b) {
    if (!a || !b) return 0;
    const distance = levenshtein(a.toLowerCase(), b.toLowerCase());
    return 1 - distance / Math.max(a.length, b.length);
}

// Encuentra el mejor match en una lista con threshold
export function findSimilar(input, list, threshold = 0.7) {
    let best = null;
    let bestScore = 0;

    for (const item of list) {
        const score = similarity(input, item);
        if (score > bestScore) {
            bestScore = score;
            best = item;
        }
    }

    return bestScore >= threshold ? { match: best, score: bestScore } : null;
}