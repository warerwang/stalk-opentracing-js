import * as opentracing from 'opentracing';
export declare class SpanContext extends opentracing.SpanContext {
    private _traceId;
    private _spanId;
    private _baggageItems;
    constructor(traceId: string, spanId: string);
    toTraceId(): string;
    toSpanId(): string;
    toJSON(): {
        traceId: string;
        spanId: string;
        baggageItems: {
            [key: string]: string;
        };
    };
    addBaggageItems(items: {
        [key: string]: string;
    }): void;
    get baggageItems(): {
        [key: string]: string;
    };
}
export default SpanContext;
