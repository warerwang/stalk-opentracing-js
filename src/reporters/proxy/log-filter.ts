import * as opentracing from '../../opentracing/index';
import BaseReporter from '../base';
import BasicSpan, { ISpanLog } from '../../basic/span';


export type LogFilterPredicate = (span: BasicSpan, log: ISpanLog) => boolean;


export class LogFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: LogFilterPredicate = () => true;


    constructor(targetReporter: BaseReporter, predicate?: LogFilterPredicate) {
        super();
        this._target = targetReporter;
        if (typeof predicate == 'function') this._predicate = predicate;

        this.accepts.spanCreate = targetReporter.accepts.spanCreate;
        this.accepts.spanLog = targetReporter.accepts.spanLog;
        this.accepts.spanFinish = targetReporter.accepts.spanFinish;
    }


    recieveSpanCreate(span: BasicSpan) {
        return this._target.recieveSpanCreate(span);
    }


    recieveSpanLog(span: BasicSpan, log: ISpanLog) {
        if (!this.testSpanLog(span, log)) return false;
        return this._target.recieveSpanLog(span, log);
    }


    recieveSpanFinish(span: BasicSpan) {
        return this._target.recieveSpanFinish(span);
    }


    testSpanLog(span: BasicSpan, log: ISpanLog) {
        return this._predicate(span, log);
    }


    close() {
        this._target.close();
        this._target = null;
    }
}


export default LogFilterProxyReporter;
