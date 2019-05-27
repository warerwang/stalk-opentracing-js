import BaseReporter from '../base';
import BasicSpan, { ISpanLog } from '../../basic/span';
export declare type LogFilterPredicate = (span: BasicSpan, log: ISpanLog) => boolean;
export declare class LogFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: LogFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: LogFilterPredicate);
    recieveSpanCreate(span: BasicSpan): void;
    recieveSpanLog(span: BasicSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: BasicSpan): void;
    testSpanLog(span: BasicSpan, log: ISpanLog): boolean;
    close(): void;
}
export default LogFilterProxyReporter;
