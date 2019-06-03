import BaseReporter from '../base';
import Span, { ISpanLog } from '../../stalk/span';
import LogFilterProxyReporter from './log-filter';
import { SpanLoggerLogLevel } from '../../opentracing/span-logger';
/**
 * If you're using `span.logger` API, you can use this proxy reporter to
 * filter some logs arriving `.recieveSpanLog()` by their log level.
 */
export declare class LogLevelFilterProxyReporter extends LogFilterProxyReporter {
    private _logLevel;
    constructor(targetReporter: BaseReporter, logLevel: SpanLoggerLogLevel);
    updateLevel(logLevel: SpanLoggerLogLevel): void;
    testSpanLog(span: Span, log: ISpanLog): boolean;
}
export default LogLevelFilterProxyReporter;
