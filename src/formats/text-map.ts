import * as opentracing from '../opentracing/index';
import { SpanContext } from '../stalk/span-context'
import { IFormat } from './interface';


export const TextMapFormatPropertyKeys = {
    TRACE_ID: 'stalk:traceId',
    SPAN_ID: 'stalk:spanId',
    BAGGAGE_ITEM_PREFIX: 'stalk:baggage:'
};


export const TextMapFormat: IFormat = {
    name: opentracing.FORMAT_TEXT_MAP,


    inject(spanContext: SpanContext, carrier: any) {
        if (!carrier || typeof carrier != 'object') {
            console.error(`Could not inject context to plain object, carrier is not object.`, carrier);
            return;
        }

        carrier[TextMapFormatPropertyKeys.TRACE_ID] = spanContext.toTraceId();
        carrier[TextMapFormatPropertyKeys.SPAN_ID] = spanContext.toSpanId();
        for (let key in spanContext.baggageItems) {
            const value = spanContext.baggageItems[key];
            carrier[TextMapFormatPropertyKeys.BAGGAGE_ITEM_PREFIX + key] = value;
        }
    },


    extract(carrier: any): opentracing.SpanContext | null {
        if (!carrier || typeof carrier != 'object') {
            console.error('Could not extract context from carrier', carrier);
            return null;
        }

        let traceId: string;
        let spanId: string;
        let baggageItems: { [key: string]: string } = {};

        for (let key in carrier) {
            if (key.indexOf(TextMapFormatPropertyKeys.BAGGAGE_ITEM_PREFIX) == 0) {
                const realKey = key.replace(TextMapFormatPropertyKeys.BAGGAGE_ITEM_PREFIX, '');
                baggageItems[realKey] = carrier[key];
            } else if (key == TextMapFormatPropertyKeys.TRACE_ID) {
                traceId = carrier[key];
            } else if (key == TextMapFormatPropertyKeys.SPAN_ID) {
                spanId = carrier[key];
            }
        }

        if (!traceId || !spanId) return null;

        const context = new SpanContext(traceId, spanId);
        context.addBaggageItems(baggageItems);
        return context;
    }
}
