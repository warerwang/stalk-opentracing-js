import * as opentracing from '../opentracing/index';
import BaseReporter from './base';
import { Span, ISpanLog } from '../stalk/span';



/**
 * A reporter that proxies span logs to `debug` package.
 * Span's `component` tag is used for debug package's
 * colorized namespace value. So be sure it's set.
 * Using this reporter is not enough to display log messages,
 * you must set `DEBUG` environment variable or `localStorage.debug`, please refer:
 * https://github.com/visionmedia/debug/
 */
export class DebugReporter extends BaseReporter {
    /** Just accept logs */
    readonly accepts = {
        spanCreate: false,
        spanLog: true,
        spanFinish: false
    };

    /** Reference of debug logger instance */
    private debugFactory: any;

    /**
     * Keep references of created debug instances to prevent memory leak:
     * https://github.com/visionmedia/debug/issues/678
     */
    private debugInstances: { [key: string]: debug.Debugger } = {};


    constructor(debugFactory: any) {
        super();
        this.debugFactory = debugFactory;
    }


    /**
     * Main method forward logs to `debug` package.
     * Note to self: `BasicSpan._log()` calls this method.
     */
    recieveSpanLog(span: Span, log: ISpanLog) {
        // Must be string, or debug throws an error
        const component = span.getTag(opentracing.Tags.COMPONENT) || 'NO-COMPONENT';

        let debugInstance = this.debugInstances[component];
        if (!debugInstance) {
            debugInstance = this.debugInstances[component] = this.debugFactory(component);
        }

        const level = log.fields.level || 'NO-LEVEL';
        const message = log.fields.message || 'NO-MESSAGE';

        // Prevent printing null/undefined
        if (log.fields.payload) {
            debugInstance(`[${level}] ${message}`, ...log.fields.payload);
        } else {
            debugInstance(`[${level}] ${message}`);
        }
    }


    close() {
        // TODO: Are you sure to want to destroy?
        for (let component in this.debugInstances) {
            const debugInstance = this.debugInstances[component];
            debugInstance.destroy();
        }
        this.debugInstances = {};
    }
}


export default DebugReporter;
