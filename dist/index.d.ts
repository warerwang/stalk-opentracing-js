export * from './opentracing/index';
export { BasicSpan } from './basic/span';
export { BasicTracer } from './basic/tracer';
export { BaseReporter } from './reporters/base';
export { DebugReporter } from './reporters/debug';
export { WinstonReporter } from './reporters/winston';
export { InMemoryReporter } from './reporters/in-memory';
export { ComponentFilterReporter } from './reporters/component-filter';
import { Trace } from './decorators/trace';
import { ComponentName } from './decorators/component-name';
export declare const decorators: {
    Trace: typeof Trace;
    ComponentName: typeof ComponentName;
};
