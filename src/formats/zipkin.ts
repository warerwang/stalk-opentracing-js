import * as opentracing from 'opentracing';
import { SpanContext } from '../stalk/span-context'
import { IFormat } from './interface';


// https://github.com/openzipkin/b3-propagation
export const ZipkinB3FormatPropertyKeys = {
    TRACE_ID: 'X-B3-TraceId',
    SPAN_ID: 'X-B3-SpanId',
};


export const ZipkinB3FormatName = 'zipkin_b3_format';


export const ZipkinB3Format: IFormat = {
    name: ZipkinB3FormatName,


    inject(spanContext: SpanContext, carrier: any) {
        if (!carrier || typeof carrier != 'object') {
            console.error(`Could not inject context to plain object, carrier is not object.`, carrier);
            return;
        }

        carrier[ZipkinB3FormatPropertyKeys.TRACE_ID] = spanContext.toTraceId();
        carrier[ZipkinB3FormatPropertyKeys.SPAN_ID] = spanContext.toSpanId();
    },


    extract(carrier: any): opentracing.SpanContext | null {
        if (!carrier || typeof carrier != 'object') {
            console.error('Could not extract context from carrier', carrier);
            return null;
        }

        let traceId: string;
        let spanId: string;

        for (let key in carrier) {
            const keyLowercase = key.toLowerCase();
            if (keyLowercase == ZipkinB3FormatPropertyKeys.TRACE_ID.toLowerCase()) {
                traceId = carrier[key];
            } else if (keyLowercase == ZipkinB3FormatPropertyKeys.SPAN_ID.toLowerCase()) {
                spanId = carrier[key];
            }
        }

        if (!traceId || !spanId) return null;

        const context = new SpanContext(traceId, spanId);
        return context;
    }
}
