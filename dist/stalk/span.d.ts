import * as opentracing from '../opentracing/index';
import Tracer from './tracer';
import SpanContext from './span-context';
export interface ISpanLog {
    fields: {
        [key: string]: any;
    };
    timestamp?: number;
}
/**
 * StalkSpan inherits opentracing's noop span, with the implementation
 * of following functionalities:
 *  - Keeping data (operation name, start & finish time, tags and logs)
 *  - Keeping references of referenced-spans
 *  - Keeping reference of tracer and context
 */
export declare class Span extends opentracing.Span {
    private _operationName;
    private _startTime;
    private _finishTime;
    private _references;
    private _tags;
    private _logs;
    private __tracer;
    private __context;
    constructor(tracer: Tracer, context: SpanContext);
    /**
     * Override just for returning tracer's type
     */
    tracer(): Tracer;
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
     * Play well with JSON.stringify()
     */
    toJSON(): {
        context: SpanContext;
        operationName: string;
        startTime: number;
        finishTime: number;
        references: {
            type: string;
            referencedContext: opentracing.SpanContext;
        }[];
        tags: {
            [key: string]: any;
        };
        logs: ISpanLog[];
    };
    static fromJSON(raw: any): Span;
    /**
     * Returns the span context.
     */
    protected _context(): SpanContext;
    /**
     * Returns the tracer.
     */
    protected _tracer(): Tracer;
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
    /**
     * Sets a baggage item.
     */
    protected _setBaggageItem(key: string, value: string): void;
    /**
     * Gets a baggage item
     */
    protected _getBaggageItem(key: string): string | undefined;
}
export default Span;
