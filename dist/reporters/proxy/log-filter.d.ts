import BaseReporter from '../base';
import StalkSpan, { ISpanLog } from '../../stalk/span';
export declare type LogFilterPredicate = (span: StalkSpan, log: ISpanLog) => boolean;
export declare class LogFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: LogFilterPredicate;
    constructor(targetReporter: BaseReporter, predicate?: LogFilterPredicate);
    recieveSpanCreate(span: StalkSpan): void;
    recieveSpanLog(span: StalkSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: StalkSpan): void;
    testSpanLog(span: StalkSpan, log: ISpanLog): boolean;
    close(): void;
}
export default LogFilterProxyReporter;
