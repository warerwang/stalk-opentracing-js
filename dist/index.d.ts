export * from './opentracing/index';
export { BasicSpan } from './basic/span';
export { BasicTracer } from './basic/tracer';
export { BaseReporter } from './reporters/base';
export { DebugReporter } from './reporters/debug';
export { WinstonReporter } from './reporters/winston';
import { Trace } from './decorators/trace';
import { ComponentName } from './decorators/component-name';
export declare const decorators: {
    Trace: typeof Trace;
    ComponentName: typeof ComponentName;
};
