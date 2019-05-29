import BaseReporter from '../base';
import StalkSpan, { ISpanLog } from '../../stalk/span';
export declare type SpanFilterPredicate = (span: StalkSpan) => boolean;
export declare class SpanFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: SpanFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: SpanFilterPredicate);
    recieveSpanCreate(span: StalkSpan): false | void;
    recieveSpanLog(span: StalkSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: StalkSpan): false | void;
    testSpan(span: StalkSpan): boolean;
    close(): void;
}
export default SpanFilterProxyReporter;
