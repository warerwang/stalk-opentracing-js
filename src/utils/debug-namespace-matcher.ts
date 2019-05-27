

/**
 * Stolen from:
 * https://github.com/visionmedia/debug/blob/master/src/common.js
 */
export class DebugNamespaceMatcher {
    private _matchQuery: string;
    private _regexes: {
        names: RegExp[],
        skips: RegExp[]
    };


    constructor(matchQuery: string) {
        this.updateQuery(matchQuery);
    }


    updateQuery(matchQuery: string) {
        this._matchQuery = matchQuery;
        this.setupRegexes();
    }


    private setupRegexes() {
        this._regexes = { names: [], skips: [] };

        let i;
        const split = (typeof this._matchQuery === 'string' ? this._matchQuery : '').split(/[\s,]+/);
        const len = split.length;

        for (i = 0; i < len; i++) {
            if (!split[i]) {
                // ignore empty strings
                continue;
            }

            const namespaces = split[i].replace(/\*/g, '.*?');

            if (namespaces[0] === '-') {
                this._regexes.skips.push(new RegExp('^' + namespaces.substr(1) + '$'));
            } else {
                this._regexes.names.push(new RegExp('^' + namespaces + '$'));
            }
        }
    }


    test(name: string) {
        if (name[name.length - 1] === '*') {
            return true;
        }

        let i;
        let len;

        for (i = 0, len = this._regexes.skips.length; i < len; i++) {
            if (this._regexes.skips[i].test(name)) {
                return false;
            }
        }

        for (i = 0, len = this._regexes.names.length; i < len; i++) {
            if (this._regexes.names[i].test(name)) {
                return true;
            }
        }

        return false;
    }
}


export default DebugNamespaceMatcher;
