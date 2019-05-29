import * as opentracing from '../opentracing/index';


export class StalkSpanContext extends opentracing.SpanContext {
    private _traceId: string;
    private _spanId: string;


    constructor(traceId: string, spanId: string) {
        super();

        this._traceId = traceId;
        this._spanId = spanId;
    }


    toTraceId() {
        return this._traceId;
    }


    toSpanId() {
        return this._spanId;
    }


    toJSON() {
        return {
            traceId: this._traceId,
            spanId: this._spanId
        }
    }
}

export default StalkSpanContext;
