import * as opentracing from '../opentracing/index';
import BasicSpan from './span';
import BasicSpanContext from './span-context';
/**
 * BasicTracer inherits opentracing's noop class, with the
 * implementation of data-structure stuff. Please note that this BasicTracer
 * does not record any spans, hoping to be garbage-collected by js engine.
 * The job of recording and reporting spans is left to implementor.
 */
export declare class BasicTracer extends opentracing.Tracer {
    /**
     * Tracer will be create instances of this class. This is for
     * making easier to inherit BasicTracer class. (inheritence sucks)
     */
    protected spanClass: typeof BasicSpan;
    /**
     * Overridden just for returning span's type.
     */
    startSpan(name: string, options?: opentracing.SpanOptions): BasicSpan;
    /**
     * Main span creating method.
     */
    protected _startSpan(name: string, fields: opentracing.SpanOptions): BasicSpan;
    protected _inject(spanContext: BasicSpanContext, format: string, carrier: any): void;
    protected _extract(format: string, carrier: any): opentracing.SpanContext | null;
}
export default BasicTracer;
