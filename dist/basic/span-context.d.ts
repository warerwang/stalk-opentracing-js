import * as opentracing from '../opentracing/index';
export declare class BasicSpanContext extends opentracing.SpanContext {
    private _traceId;
    private _spanId;
    constructor(traceId: string, spanId: string);
    toTraceId(): string;
    toSpanId(): string;
}
export default BasicSpanContext;
