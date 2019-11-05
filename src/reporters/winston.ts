import BaseReporter from './base';
import { Span, ISpanLog } from '../stalk/span';



/**
 * A demo reporter that forwards span logs to `winston` logger instance. All the winston
 * transporting stuff must be set before using this reporter.
 *
 * How it works:
 * Passed logger's `.log(data)` method will be called (winston uses this syntax
 * for a long time, but any other object has this method signature will work),
 * where `data` is:
 *  - `level` => Log level: silly, debug, info, warn, error
 *  - `message` => Log message
 */
export class WinstonReporter extends BaseReporter {
    /** Just accept logs */
    readonly accepts = {
        spanCreate: false,
        spanLog: true,
        spanFinish: false
    };

    /** Reference of winston logger instance */
    private winstonLogger: any;


    constructor(winstonLogger: any) {
        super();
        this.winstonLogger = winstonLogger;
    }


    /**
     * Main method to forward logs to `winston` logger.
     * Note to self: `BasicSpan._log()` calls this method.
     */
    recieveSpanLog(span: Span, log: ISpanLog) {
        /**
         * Winston only requires `level` and `message` fields in log object
         * https://github.com/winstonjs/winston#streams-objectmode-and-info-objects
         */
        this.winstonLogger.log({
            level: log.fields.level || 'info',
            message: log.fields.message || '',
            ...log.fields
        });
    }


    close() {
        // No-op
    }
}


export default WinstonReporter;
