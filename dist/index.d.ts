export * from './opentracing/index';
export { BasicSpan } from './basic/span';
export { BasicTracer } from './basic/tracer';
export { DebugTracer } from './debug/tracer';
export { DebugSpan } from './debug/span';
export { WinstonTracer } from './winston/tracer';
export { WinstonSpan } from './winston/span';
import { Trace } from './decorators/trace';
import { ComponentName } from './decorators/component-name';
export declare const decorators: {
    Trace: typeof Trace;
    ComponentName: typeof ComponentName;
};
