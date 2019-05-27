import { BasicSpanContext } from '../basic/span-context';


export const NAME = 'plainObject';
export const OBJECT_TRACE_ID_PROPERTY_KEY = '__TRACE_ID__';
export const OBJECT_SPAN_ID_PROPERTY_KEY = '__SPAN_ID__';


/**
 * Tries to inject span context into plain javascript object with specific property keys.
 * This method should not throw an error.
 */
export function inject(spanContext: BasicSpanContext, carrier: any) {
    if (typeof carrier != 'object') {
        console.error(`Could not inject context to plain object, carrier is not object.`, carrier);
    } else {
        carrier[OBJECT_TRACE_ID_PROPERTY_KEY] = spanContext.toTraceId();
        carrier[OBJECT_SPAN_ID_PROPERTY_KEY] = spanContext.toSpanId();
    }
}


/**
 * Tries to extract `traceId` and `spanId` from plain javascript object.
 * This method should not throw an error. Extract must be done before carrier
 * is used application logic. Because we want to clean-up carrier.
 */
export function extract(carrier: any) {
    let traceId: string;
    let spanId: string;

    if (typeof carrier != 'object') {
        console.error(`Could not extract context from plain object, unexpected carrier`, carrier);
    } else {
        traceId = carrier[OBJECT_TRACE_ID_PROPERTY_KEY];
        spanId = carrier[OBJECT_SPAN_ID_PROPERTY_KEY];
        delete carrier[OBJECT_TRACE_ID_PROPERTY_KEY];
        delete carrier[OBJECT_SPAN_ID_PROPERTY_KEY];
    }

    return { traceId, spanId };
}

