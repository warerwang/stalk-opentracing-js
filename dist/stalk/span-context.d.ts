import * as opentracing from '../opentracing/index';
export declare class StalkSpanContext extends opentracing.SpanContext {
    private _traceId;
    private _spanId;
    constructor(traceId: string, spanId: string);
    toTraceId(): string;
    toSpanId(): string;
    toJSON(): {
        traceId: string;
        spanId: string;
    };
}
export default StalkSpanContext;
