import BaseReporter from '../base';
import Span, { ISpanLog } from '../../stalk/span';
declare type LogFilterPredicate = (span: Span, log: ISpanLog) => boolean;
export declare class LogFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: LogFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: LogFilterPredicate);
    recieveSpanCreate(span: Span): void;
    recieveSpanLog(span: Span, log: ISpanLog): false | void;
    recieveSpanFinish(span: Span): void;
    testSpanLog(span: Span, log: ISpanLog): boolean;
    close(): void;
}
export default LogFilterProxyReporter;
