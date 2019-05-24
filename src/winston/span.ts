import * as opentracing from '../opentracing/index';
import WinstonTracer from './tracer';
import BaseSpan from '../base/span';


export default class WinstonSpan extends BaseSpan {
    /**
     * Override just for returning tracer's type
     */
    tracer(): WinstonTracer {
        return super.tracer() as WinstonTracer;
    }


    /**
     * Override BaseSpan's internal `_log` method to interfere logs.
     * Not calling `super._log()` method to not store logs, efficiency-stuff
     */
    protected _log(keyValuePairs: { [key: string]: any }, timestamp?: number) {
        const tracer = this.tracer();
        const component = this.getTag(opentracing.Tags.COMPONENT);
        tracer.forward(component, keyValuePairs as any);
    }
}
