import BaseReporter from '../base';
import Span, { ISpanLog } from '../../stalk/span';


type SpanFilterPredicate = (span: Span) => boolean;


export class SpanFilterProxyReporter extends BaseReporter {
    protected _target: BaseReporter;
    protected _predicate: SpanFilterPredicate = () => true;


    constructor(targetReporter: BaseReporter, predicate?: SpanFilterPredicate) {
        super();
        this._target = targetReporter;
        if (typeof predicate == 'function') this._predicate = predicate;

        this.accepts.spanCreate = targetReporter.accepts.spanCreate;
        this.accepts.spanLog = targetReporter.accepts.spanLog;
        this.accepts.spanFinish = targetReporter.accepts.spanFinish;
    }


    recieveSpanCreate(span: Span) {
        if (!this.testSpan(span)) return false;
        return this._target.recieveSpanCreate(span);
    }


    recieveSpanLog(span: Span, log: ISpanLog) {
        if (!this.testSpan(span)) return false;
        return this._target.recieveSpanLog(span, log);
    }


    recieveSpanFinish(span: Span) {
        if (!this.testSpan(span)) return false;
        return this._target.recieveSpanFinish(span);
    }


    testSpan(span: Span) {
        return this._predicate(span);
    }


    close() {
        this._target.close();
        this._target = null;
    }
}


export default SpanFilterProxyReporter;
