export * from './opentracing/index';
export { StalkSpan } from './stalk/span';
export { StalkTracer } from './stalk/tracer';
export { BaseReporter } from './reporters/base';
export { DebugReporter } from './reporters/debug';
export { WinstonReporter } from './reporters/winston';
export { InMemoryReporter } from './reporters/in-memory';
export { SpanFilterProxyReporter } from './reporters/proxy/span-filter';
export { LogFilterProxyReporter } from './reporters/proxy/log-filter';
export { SpanComponentTagFilterProxyReporter } from './reporters/proxy/span-component-tag-filter';
export { LogLevelFilterProxyReporter } from './reporters/proxy/log-level-filter';
import * as Trace from './decorators/trace';
import * as ComponentName from './decorators/component-name';
export declare const decorators: {
    Trace: typeof Trace;
    ComponentName: typeof ComponentName;
};
