import * as opentracing from '../opentracing/index';
import BasicSpan from './span';
import BasicSpanContext from './span-context';
import BaseReporter from '../reporters/base';
/**
 * BasicTracer inherits opentracing's noop class, with the
 * implementation of data-structure stuff and reporter interface.
 * Please note that this BasicTracer does not record any spans, hoping
 * to be garbage-collected by js engine. The job of recording and reporting
 * spans is left to reporters.
 */
export declare class BasicTracer extends opentracing.Tracer {
    /**
     * Reporter instances to report when a span is created.
     */
    protected _reporters: BaseReporter[];
    readonly reporters: BaseReporter[];
    /**
     * Adds a reporter.
     */
    addReporter(reporter: BaseReporter): void;
    /**
     * Removes a reporter.
     */
    removeReporter(reporter: BaseReporter): boolean;
    /**
     * Overridden just for returning span's type.
     */
    startSpan(name: string, options?: opentracing.SpanOptions): BasicSpan;
    /**
     * Main span creating method.
     */
    protected _startSpan(name: string, fields: opentracing.SpanOptions): BasicSpan;
    /**
     * Tries to inject given span context into carrier. This method should not throw an error.
     */
    protected _inject(spanContext: BasicSpanContext, format: string, carrier: any): void;
    /**
     * Tries to extract span context from any supported carrier. This method should not
     * throw an error, return nil instead. Creating a new trace is not our responsibility.
     */
    protected _extract(format: string, carrier: any): opentracing.SpanContext | null;
}
export default BasicTracer;
