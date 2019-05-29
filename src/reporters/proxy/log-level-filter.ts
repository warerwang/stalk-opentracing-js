import BaseReporter from '../base';
import StalkSpan, { ISpanLog } from '../../stalk/span';
import LogFilterProxyReporter from './log-filter';
import { SpanLoggerLogLevel } from '../../opentracing/span-logger';


const LOG_LEVEL_PRIORITY: { [key: string]: number } = {
    [SpanLoggerLogLevel.ERROR]: 0,
    [SpanLoggerLogLevel.WARN]: 1,
    [SpanLoggerLogLevel.INFO]: 2,
    [SpanLoggerLogLevel.DEBUG]: 3,
    [SpanLoggerLogLevel.SILLY]: 4
};


export class LogLevelFilterProxyReporter extends LogFilterProxyReporter {
    private _logLevel: SpanLoggerLogLevel;


    constructor(targetReporter: BaseReporter, logLevel: SpanLoggerLogLevel) {
        super(targetReporter);
        this._logLevel = logLevel;
    }


    updateLevel(logLevel: SpanLoggerLogLevel) {
        this._logLevel = logLevel;
    }


    testSpanLog(span: StalkSpan, log: ISpanLog) {
        return LOG_LEVEL_PRIORITY[log.fields.level] <= LOG_LEVEL_PRIORITY[this._logLevel];
    }
}


export default LogLevelFilterProxyReporter;
