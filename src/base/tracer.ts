import * as opentracing from '../opentracing/index';
import * as Noop from '../opentracing/noop';
import BaseSpan from './span';
import BaseSpanContext from './span-context';
import * as shortid from 'shortid';


/**
 * BaseTracer inherits opentracing's noop class, with the
 * implementation of data-structure stuff. Please note that this BaseTracer
 * does not record any spans, hoping to be garbage-collected by js engine.
 * The job of recording and reporting spans is left to implementor.
 */
export class BaseTracer extends opentracing.Tracer {
    /**
     * Tracer will be create instances of this class. This is for
     * making easier to inherit BaseTracer class. (inheritence sucks)
     */
    protected spanClass = BaseSpan;


    /**
     * Overridden just for returning span's type.
     */
    startSpan(name: string, options: opentracing.SpanOptions = {}): BaseSpan {
        return super.startSpan(name, options) as BaseSpan;
    }


    ///////////////////////////////////////////
    // Override opentracing internal methods //
    ///////////////////////////////////////////


    /**
     * Main span creating method.
     */
    protected _startSpan(name: string, fields: opentracing.SpanOptions) {
        // Extract trace id from first reference.
        // If it doesn't exists, start a new trace
        const firstRef = fields.references ? fields.references[0] : null;
        const traceId = firstRef ? firstRef.referencedContext().toTraceId() : shortid.generate();
        const spanId = shortid.generate();
        const spanContext = new BaseSpanContext(traceId, spanId);

        // Create a span instance from `this.spanClass` class.
        const span = new this.spanClass(this, spanContext);
        span.setOperationName(name);
        if (fields.tags) span.addTags(fields.tags);

        if (fields.references) {
            for (const ref of fields.references) {
                span.addReference(ref);
            }
        }

        span.start(fields.startTime);
        return span;
    }


    protected _inject(spanContext: BaseSpanContext, format: string, carrier: any) {
        // TODO
    }


    protected _extract(format: string, carrier: any): opentracing.SpanContext | null {
        // TODO
        return Noop.spanContext!;
    }
}

export default BaseTracer;
