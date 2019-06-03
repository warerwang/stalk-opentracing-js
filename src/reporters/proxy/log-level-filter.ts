import BaseReporter from '../base';
import Span, { ISpanLog } from '../../stalk/span';
import LogFilterProxyReporter from './log-filter';
import { SpanLoggerLogLevel } from '../../opentracing/span-logger';


const LOG_LEVEL_PRIORITY: { [key: string]: number } = {
    [SpanLoggerLogLevel.ERROR]: 0,
    [SpanLoggerLogLevel.WARN]: 1,
    [SpanLoggerLogLevel.INFO]: 2,
    [SpanLoggerLogLevel.DEBUG]: 3,
    [SpanLoggerLogLevel.SILLY]: 4
};


/**
 * If you're using `span.logger` API, you can use this proxy reporter to
 * filter some logs arriving `.recieveSpanLog()` by their log level.
 */
export class LogLevelFilterProxyReporter extends LogFilterProxyReporter {
    private _logLevel: SpanLoggerLogLevel;


    constructor(targetReporter: BaseReporter, logLevel: SpanLoggerLogLevel) {
        super(targetReporter);
        this._logLevel = logLevel;
    }


    updateLevel(logLevel: SpanLoggerLogLevel) {
        this._logLevel = logLevel;
    }


    testSpanLog(span: Span, log: ISpanLog) {
        return LOG_LEVEL_PRIORITY[log.fields.level] <= LOG_LEVEL_PRIORITY[this._logLevel];
    }
}


export default LogLevelFilterProxyReporter;
