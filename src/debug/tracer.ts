import * as opentracing from '../opentracing/index';
import BasicTracer from '../basic/tracer';
import DebugSpan from './span';
import { ISpanLoggerLogFields } from '../opentracing/span-logger';
import debug from 'debug';


/**
 * A tracer that proxies span logs to `debug` package.
 * This tracer uses the span's `component` tag as debug package's
 * colorized namespace value. So be sure it's set.
 * Using this tracer is not enough to display log messages,
 * you must set `DEBUG` environment variable or `localStorage.debug`, please refer:
 * https://github.com/visionmedia/debug/
 */
export default class DebugTracer extends BasicTracer {
    /** Overriding BaseTracer's span class. */
    protected spanClass = DebugSpan;

    /**
     * Keep references of created debug instances to prevent memory leak:
     * https://github.com/visionmedia/debug/issues/678
     */
    private debugInstances: { [key: string]: debug.Debugger } = {};


    /**
     * Overridden just for returning span's type
     */
    startSpan(name: string, options: opentracing.SpanOptions = {}): DebugSpan {
        return super.startSpan(name, options) as DebugSpan;
    }


    /**
     * Main method forward logs to `debug` package.
     */
    forward(component: string, logFields: ISpanLoggerLogFields) {
        // Must be string, or debug throws an error
        component = component || 'NO-COMPONENT';

        let debugInstance = this.debugInstances[component];
        if (!debugInstance) {
            debugInstance = this.debugInstances[component] = debug(component);
        }

        const level = logFields.level || 'NO-LEVEL';
        const message = logFields.message || 'NO-MESSAGE';

        // Prevent printing null/undefined
        if (logFields.payload) {
            debugInstance(`[${level}] ${message}`, logFields.payload);
        } else {
            debugInstance(`[${level}] ${message}`);
        }
    }
}
