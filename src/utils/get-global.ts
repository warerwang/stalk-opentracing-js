/**
 * Gets a global object on both browser and node.
 */
export default function getGlobal() {
    return typeof global !== 'undefined' ?  global :
        typeof self !== 'undefined' ? self :
        typeof window !== 'undefined' ? window :
        {};
}
