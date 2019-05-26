import * as opentracing from '../opentracing/index';
import BasicTracer from '../basic/tracer';
import DebugSpan from './span';
import { ISpanLoggerLogFields } from '../opentracing/span-logger';
/**
 * A tracer that proxies span logs to `debug` package.
 * This tracer uses the span's `component` tag as debug package's
 * colorized namespace value. So be sure it's set.
 * Using this tracer is not enough to display log messages,
 * you must set `DEBUG` environment variable or `localStorage.debug`, please refer:
 * https://github.com/visionmedia/debug/
 */
export declare class DebugTracer extends BasicTracer {
    /** Overriding BaseTracer's span class. */
    protected spanClass: typeof DebugSpan;
    /** Reference of winston logger instance */
    private debugFactory;
    /**
     * Keep references of created debug instances to prevent memory leak:
     * https://github.com/visionmedia/debug/issues/678
     */
    private debugInstances;
    constructor(debugFactory: any);
    /**
     * Overridden just for returning span's type
     */
    startSpan(name: string, options?: opentracing.SpanOptions): DebugSpan;
    /**
     * Main method forward logs to `debug` package.
     */
    forward(component: string, logFields: ISpanLoggerLogFields): void;
}
export default DebugTracer;
