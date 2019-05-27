/**
 * Stolen from:
 * https://github.com/visionmedia/debug/blob/master/src/common.js
 */
export declare class DebugNamespaceMatcher {
    private _matchQuery;
    private _regexes;
    constructor(matchQuery: string);
    updateQuery(matchQuery: string): void;
    private setupRegexes;
    test(name: string): boolean;
}
export default DebugNamespaceMatcher;
