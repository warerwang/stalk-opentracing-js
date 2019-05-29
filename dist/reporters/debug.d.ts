import BaseReporter from './base';
import { StalkSpan, ISpanLog } from '../stalk/span';
/**
 * A reporter that proxies span logs to `debug` package.
 * Span's `component` tag is used for debug package's
 * colorized namespace value. So be sure it's set.
 * Using this reporter is not enough to display log messages,
 * you must set `DEBUG` environment variable or `localStorage.debug`, please refer:
 * https://github.com/visionmedia/debug/
 */
export declare class DebugReporter extends BaseReporter {
    /** Just accept logs */
    readonly accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    /** Reference of debug logger instance */
    private debugFactory;
    /**
     * Keep references of created debug instances to prevent memory leak:
     * https://github.com/visionmedia/debug/issues/678
     */
    private debugInstances;
    constructor(debugFactory: any);
    /**
     * Main method forward logs to `debug` package.
     * Note to self: `BasicSpan._log()` calls this method.
     */
    recieveSpanLog(span: StalkSpan, log: ISpanLog): void;
    close(): void;
}
export default DebugReporter;
