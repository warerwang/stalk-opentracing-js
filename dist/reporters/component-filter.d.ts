import BaseReporter from './base';
import BasicSpan, { ISpanLog } from '../basic/span';
export declare class ComponentFilterReporter extends BaseReporter {
    private _target;
    private _namespaces;
    private _regexes;
    constructor(targetReporter: BaseReporter, namespaces: string);
    updateFilter(namespaces: string): void;
    recieveSpanCreate(span: BasicSpan): false | void;
    recieveSpanLog(span: BasicSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: BasicSpan): false | void;
    /**
     * Stolen from:
     * https://github.com/visionmedia/debug/blob/master/src/common.js
     */
    private setupRegexes;
    /**
     * Stolen from:
     * https://github.com/visionmedia/debug/blob/master/src/common.js
     */
    private test;
    close(): void;
}
export default ComponentFilterReporter;
