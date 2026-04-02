export function shuffle<T>(array: T[]): T[] {
    const arr = [...array]; 
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export function isSubset<T>(subset: Set<T>, superset: Set<T>): boolean {
    return [...subset].every(item => superset.has(item));
}