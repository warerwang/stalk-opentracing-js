import BaseReporter from './base';
import BasicSpan, { ISpanLog } from '../basic/span';
import { SpanLoggerLogLevel } from '../opentracing/span-logger';
export declare class LogLevelFilterReporter extends BaseReporter {
    private _target;
    private _logLevel;
    constructor(targetReporter: BaseReporter, logLevel: SpanLoggerLogLevel);
    updateFilter(logLevel: SpanLoggerLogLevel): void;
    recieveSpanCreate(span: BasicSpan): void;
    recieveSpanLog(span: BasicSpan, log: ISpanLog): false | void;
    recieveSpanFinish(span: BasicSpan): void;
    close(): void;
}
export default LogLevelFilterReporter;
