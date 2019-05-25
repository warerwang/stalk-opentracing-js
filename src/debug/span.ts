import * as opentracing from '../opentracing/index';
import DebugTracer from './tracer';
import BasicSpan from '../basic/span';


export default class DebugSpan extends BasicSpan {
    /**
     * Override just for returning tracer's type
     */
    tracer(): DebugTracer {
        return super.tracer() as DebugTracer;
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
