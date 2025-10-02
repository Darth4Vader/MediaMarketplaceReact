

/**
 * Compare two arrays of strings or numbers for equality.
 * Handles duplicates, type differences, and optional order enforcement.
 *
 * @param {string[] | number[]} arr1
 * @param {string[] | number[]} arr2
 * @param {Object} [opts]
 * @param {boolean} [opts.enforceOrder=false]
 * @returns {boolean}
 */
export function compareArrays(arr1, arr2, opts = {}) {
    const enforceOrder = opts.enforceOrder ?? false;

    if (arr1.length !== arr2.length) return false;

    if (enforceOrder) {
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }

    const toFreqMap = (arr) => {
        const map = new Map();
        for (const val of arr) {
            const key = `${typeof val}-${val}`;
            map.set(key, (map.get(key) || 0) + 1);
        }
        return map;
    };

    const map1 = toFreqMap(arr1);
    const map2 = toFreqMap(arr2);

    if (map1.size !== map2.size) return false;

    for (const [key, count] of map1.entries()) {
        if (map2.get(key) !== count) return false;
    }

    return true;
}

export function hasStringChanged(prevString, newString) {
    const normalize = (s) => (s == null || s.trim() === '' ? '' : s.trim());
    return normalize(prevString) !== normalize(newString);
}

/**
 * Parse a comma-separated string into an array of numbers.
 * Returns an empty array if input is null, empty or invalid.
 * Filters out non-numeric values.
 *
 * @param {string|null|undefined} str
 * @returns {number[]}
 */
export function parseStringAsNumberArray(str) {
    if (!str) return [];
    return str
        .split(',')
        .map(s => Number(s.trim()))
        .filter(n => !isNaN(n));
}