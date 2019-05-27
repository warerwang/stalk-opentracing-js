import { BasicSpanContext } from '../basic/span-context';
export declare const NAME = "plainObject";
export declare const OBJECT_TRACE_ID_PROPERTY_KEY = "__traceId__";
export declare const OBJECT_SPAN_ID_PROPERTY_KEY = "__spanId__";
/**
 * Triest to inject span context into plain javascript object with specific property keys.
 * This method should not throw an error.
 */
export declare function inject(spanContext: BasicSpanContext, carrier: any): void;
/**
 * Tries to extract `traceId` and `spanId` from plain javascript object.
 * This method should not throw an error. Extract must be done before carrier
 * is used application logic. Because we want to clean-up carrier.
 */
export declare function extract(carrier: any): {
    traceId: string;
    spanId: string;
};
