import * as opentracing from '../opentracing/index';
import BasicTracer from './tracer';
import BasicSpanContext from './span-context';
export interface ISpanLog {
    fields: {
        [key: string]: any;
    };
    timestamp?: number;
}
/**
 * BasicSpan inherits opentracing's noop span, with the implementation
 * of following functionalities:
 *  - Keeping data (operation name, start & finish time, tags and logs)
 *  - Keeping references of referenced-spans
 *  - Keeping reference of tracer and context
 */
export declare class BasicSpan extends opentracing.Span {
    private _operationName;
    private _startTime;
    private _finishTime;
    private _references;
    private _tags;
    private _logs;
    private __tracer;
    private __context;
    constructor(tracer: BasicTracer, context: BasicSpanContext);
    /**
     * Override just for returning tracer's type
     */
    tracer(): BasicTracer;
    /**
     * Sets the start time of span. Defaults to `Date.now()`.
     */
    start(startTime?: number): void;
    /**
     * Adds a reference to another span.
     */
    addReference(ref: opentracing.Reference): void;
    /**
     * Gets specified tag.
     */
    getTag(key: string): any;
    /**
     * Returns the span context.
     */
    protected _context(): BasicSpanContext;
    /**
     * Returns the tracer.
     */
    protected _tracer(): BasicTracer;
    /**
     * Sets the operation name of span.
     */
    protected _setOperationName(name: string): void;
    /**
     * Add tags to the span.
     * Will be merged into current tags with object assigning.
     */
    protected _addTags(keyValuePairs: {
        [key: string]: any;
    }): void;
    /**
     * Adds a log.
     */
    protected _log(keyValuePairs: {
        [key: string]: any;
    }, timestamp?: number): void;
    /**
     * Finishes span. Defaults to `Date.now()`.
     */
    protected _finish(finishTime?: number): void;
}
export default BasicSpan;
