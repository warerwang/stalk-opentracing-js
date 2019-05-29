import BaseReporter from '../base';
import Span, { ISpanLog } from '../../stalk/span';
declare type SpanFilterPredicate = (span: Span) => boolean;
export declare class SpanFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: SpanFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: SpanFilterPredicate);
    recieveSpanCreate(span: Span): false | void;
    recieveSpanLog(span: Span, log: ISpanLog): false | void;
    recieveSpanFinish(span: Span): false | void;
    testSpan(span: Span): boolean;
    close(): void;
}
export default SpanFilterProxyReporter;
