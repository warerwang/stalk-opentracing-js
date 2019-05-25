import * as opentracing from '../opentracing/index';
import BasicTracer from '../basic/tracer';
import WinstonSpan from './span';
import { ISpanLoggerLogFields } from '../opentracing/span-logger';



/**
 * A tracer that forwards span logs to `winston` logger instance. All the winston
 * transporting stuff must be set before using this tracer.
 *
 * How it works:
 * Passed logger's `.log(data)` method will be called (winston uses this syntax
 * for a long time, but any other object has this method signature will work),
 * where `data` is:
 *  - `component` => Span's `component` tag
 *  - `level` => Log level: silly, debug, info, warn, error
 *  - `message` => Log message
 *  - `payload` => any payload if specified
 */
export default class DebugTracer extends BasicTracer {
    /** Overriding BaseTracer's span class. */
    protected spanClass = WinstonSpan;

    /** Reference of winston logger instance */
    private winstonLogger: any;


    constructor(winstonLogger: any) {
        super();
        this.winstonLogger = winstonLogger;
    }


    /**
     * Overridden just for returning span's type
     */
    startSpan(name: string, options: opentracing.SpanOptions = {}): WinstonSpan {
        return super.startSpan(name, options) as WinstonSpan;
    }


    /**
     * Main method to forward logs to `winston` logger.
     */
    forward(component: string, logFields: ISpanLoggerLogFields) {
        component = component || 'NO-COMPONENT';
        const level = logFields.level || 'NO-LEVEL';
        const message = logFields.message || 'NO-MESSAGE';

        this.winstonLogger.log({
            component,
            level,
            message,
            payload: logFields.payload
        });
    }
}
