import WinstonTracer from './tracer';
import BasicSpan from '../basic/span';
export declare class WinstonSpan extends BasicSpan {
    /**
     * Override just for returning tracer's type
     */
    tracer(): WinstonTracer;
    /**
     * Override BaseSpan's internal `_log` method to interfere logs.
     * Not calling `super._log()` method to not store logs, efficiency-stuff
     */
    protected _log(keyValuePairs: {
        [key: string]: any;
    }, timestamp?: number): void;
}
export default WinstonSpan;
