import BaseReporter from './base';
import { StalkSpan, ISpanLog } from '../stalk/span';
/**
 * A reporter that forwards span logs to `winston` logger instance. All the winston
 * transporting stuff must be set before using this reporter.
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
export declare class WinstonReporter extends BaseReporter {
    /** Just accept logs */
    readonly accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    /** Reference of winston logger instance */
    private winstonLogger;
    constructor(winstonLogger: any);
    /**
     * Main method to forward logs to `winston` logger.
     * Note to self: `BasicSpan._log()` calls this method.
     */
    recieveSpanLog(span: StalkSpan, log: ISpanLog): void;
    close(): void;
}
export default WinstonReporter;
