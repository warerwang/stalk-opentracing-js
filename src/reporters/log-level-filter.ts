import * as opentracing from '../opentracing/index';
import BaseReporter from './base';
import BasicSpan, { ISpanLog } from '../basic/span';
import { SpanLoggerLogLevel } from '../opentracing/span-logger';


const LOG_LEVEL_PRIORITY: { [key: string]: number } = {
    [SpanLoggerLogLevel.ERROR]: 0,
    [SpanLoggerLogLevel.WARN]: 1,
    [SpanLoggerLogLevel.INFO]: 2,
    [SpanLoggerLogLevel.DEBUG]: 3,
    [SpanLoggerLogLevel.SILLY]: 4
};


export class LogLevelFilterReporter extends BaseReporter {
    private _target: BaseReporter;
    private _logLevel: SpanLoggerLogLevel;


    constructor(targetReporter: BaseReporter, logLevel: SpanLoggerLogLevel) {
        super();
        this._target = targetReporter;
        this._logLevel = logLevel;
        this.accepts.spanCreate = targetReporter.accepts.spanCreate;
        this.accepts.spanLog = targetReporter.accepts.spanLog;
        this.accepts.spanFinish = targetReporter.accepts.spanFinish;
    }


    updateFilter(logLevel: SpanLoggerLogLevel) {
        this._logLevel = logLevel;
    }


    recieveSpanCreate(span: BasicSpan) {
        return this._target.recieveSpanCreate(span);
    }


    recieveSpanLog(span: BasicSpan, log: ISpanLog) {
        if (LOG_LEVEL_PRIORITY[log.fields.level] > LOG_LEVEL_PRIORITY[this._logLevel]) return false;
        return this._target.recieveSpanLog(span, log);
    }


    recieveSpanFinish(span: BasicSpan) {
        return this._target.recieveSpanFinish(span);
    }


    close() {
        this._target.close();
        this._target = null;
    }
}


export default LogLevelFilterReporter;
