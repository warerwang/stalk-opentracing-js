import BaseReporter from '../base';
import BasicSpan, { ISpanLog } from '../../basic/span';
export declare type SpanFilterPredicate = (span: BasicSpan) => boolean;
export declare class SpanFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: SpanFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: SpanFilterPredicate);
    recieveSpanCreate(span: BasicSpan): false | void;
    recieveSpanLog(span: BasicSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: BasicSpan): false | void;
    testSpan(span: BasicSpan): boolean;
    close(): void;
}
export default SpanFilterProxyReporter;
