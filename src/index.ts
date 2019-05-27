export * from './opentracing/index';

export { BasicSpan } from './basic/span';
export { BasicTracer } from './basic/tracer';

export { BaseReporter } from './reporters/base';
export { DebugReporter } from './reporters/debug';
export { WinstonReporter } from './reporters/winston';
export { InMemoryReporter } from './reporters/in-memory';
export { SpanFilterProxyReporter } from './reporters/proxy/span-filter';
export { LogFilterProxyReporter } from './reporters/proxy/log-filter';
export { SpanComponentTagFilterProxyReporter } from './reporters/proxy/span-component-tag-filter';
export { LogLevelFilterProxyReporter } from './reporters/proxy/log-level-filter';

import { Trace } from './decorators/trace';
import { ComponentName } from './decorators/component-name';
export const decorators = { Trace, ComponentName };
