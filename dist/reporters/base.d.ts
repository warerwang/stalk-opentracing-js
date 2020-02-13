import * as opentracing from 'opentracing';
import { ISpanLog } from '../stalk/span';
/**
 * Base reporter class and also behaves like no-op reporter.
 * Child classes should first set `accepts` property to specify
 * what kind of events to recieve from tracer.
 * ```ts
 *  {
 *      spanCreate: boolean, // Tracer will call `reporter.recieveSpanCreate()` when a span is created
 *      spanLog: boolean, // Span will call `reporter.recieveLog()` when a new log is added
 *      spanFinish: boolean // Span will call `reporter.recieveSpanFinish()` when it finishes.
 *  }
 * ```
 *
 * and some of 4 methods:
 *  - `recieveSpanCreate(span)`
 *  - `recieveSpanLog(span, log)`
 *  - `recieveSpanFinish(span)`
 *  - `close()`
 */
export declare class BaseReporter {
    /**
     * Event acceptance map.
     */
    readonly accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    /**
     * When a span is created from `BasicTracer`, tracer instance will
     * call this method of all the reporters. You probably want to store the span
     * in some kind of array to report your collector agent/server later on.
     */
    recieveSpanCreate(span: opentracing.Span): void;
    /**
     * When a new log added to span with `span.log()`, it will call this method of all the binded
     * reporters.
     */
    recieveSpanLog(span: opentracing.Span, log: ISpanLog): void;
    /**
     * When `span.finish()` called, it will call this method of all the binded
     * reporters.
     */
    recieveSpanFinish(span: opentracing.Span): void;
    /**
     * When a reporter is removed from the tracer, this method will be called.
     * You should do some clean-up stuff, closing server connection etc.
     */
    close(): void;
}
export default BaseReporter;
