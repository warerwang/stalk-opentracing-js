import * as opentracing from '../opentracing/index';
import { SpanContext } from '../stalk/span-context'
import { IFormat } from './interface';


// Make http header compatible
export const JaegerFormatPropertyKeys = {
    IDENTITY: 'uber-trace-id',
    BAGGAGE_ITEM_PREFIX: 'uberctx-' // TODO
};


export const JaegerFormatName = 'jaeger_format';


export const JaegerFormat: IFormat = {
    name: JaegerFormatName,


    inject(spanContext: SpanContext, carrier: any) {
        if (!carrier || typeof carrier != 'object') {
            console.error(`Could not inject context to plain object, carrier is not object.`, carrier);
            return;
        }

        // According to: https://www.jaegertracing.io/docs/1.7/client-libraries/
        // The format is: `{trace-id}:{span-id}:{parent-span-id}:{flags}`
        // However, we don't know parentId, and it's kind of deprecated, always send 0
        carrier[JaegerFormatPropertyKeys.IDENTITY] = `${spanContext.toTraceId()}:${spanContext.toSpanId()}:0:1`;

        // TODO: Baggage?
    },


    extract(carrier: any): opentracing.SpanContext | null {
        if (!carrier || typeof carrier != 'object') {
            console.error('Could not extract context from carrier', carrier);
            return null;
        }

        let traceId: string;
        let spanId: string;

        for (let key in carrier) {
            if (key == JaegerFormatPropertyKeys.IDENTITY) {
                const parts = carrier[key].split(':');
                if (parts.length != 4) continue; // Ignore
                traceId = parts[0];
                spanId = parts[1];
            }
        }

        // TODO: Baggage items?

        if (!traceId || !spanId) return null;

        const context = new SpanContext(traceId, spanId);
        return context;
    }
}
