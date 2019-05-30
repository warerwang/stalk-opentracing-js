import * as opentracing from '../opentracing/index';
import { getTags } from './tag';



/**
 * Some types
 */
type ArgumentTypes<T> = T extends (...args: infer U ) => infer R ? U: never;
type ReplaceReturnType<T, TNewReturn> = (...a: ArgumentTypes<T>) => TNewReturn;
type CustomRelationHandler = (span: opentracing.Span, ...args: any[]) => Partial<opentracing.SpanOptions>;
type PredefinedRelations = 'childOf' | 'followsFrom' | 'newTrace';


/**
 * Main `@Trace()` decorator for class methods to be traced. Due to typescript decorator
 * restrictions, we cannot apply this decorator to normal functions :/
 * So, every traced function must be a class method.
 *
 * THERE IS JUST ONE SIMPLE RULE TO USE `@Trace()` DECORATOR:
 * All the `Trace()`d methods must take an `opentracing.Span` instance as first parameter.
 * Type definition for this rule is already set, so it shouldn't be a problem.
 *
 * Sample usage:
 * ```ts
 * class Calculator {
 *      @Trace({ operationName: 'multiply', relation: 'newTrace', autoFinish: true })
 *      multiply(span, a, b) {
 *          // `span` is automatically created from opentracing's global tracer
 *          // with it's operation name set, you can use standart `opentracing.Span` methods.
 *          span.addTags({ a, b });
 *
 *          let acc = 0;
 *          for (let i = 0; i < b; i++) {
 *              acc = this.sum(span, acc, a); // Call with current span
 *          }
 *
 *          return acc;
 *      }
 *
 *
 *      @Trace({ relation: 'childOf', autoFinish: true }) // operationName can be omitted, method name is used by default
 *      sum(span, a, b) {
 *          span.logger.info(`Sum is called with ${a} and ${b}`);
 *          return a + b;
 *      }
 * }
 *
 * const calculator = new Calculator();
 * calculator.multiply(null, 4, 6); // There is no span passed!
 * // Because `multiply` method's trace relation is set to `newTrace`
 * ```
 *
 * `relation` must be set to a string. It can be one of pre-defined some relations: `childOf`,
 * `followsFrom`, `newTrace`, or it can be `custom`. If `custom` is selected, you should
 * pass another `handler` option which is a function takes the same arguments with the decorated function.
 * It will called before original method and it must be return some part of span options
 * (`opentracing.SpanOptions`) that defines the relation to other spans.
 * If you want to extract span context from some sort of external communication,
 * you should set your custom relation handler.
 *
 * If `autoFinish` is set true, return value of the method will be checked. If it is promise-like
 * object, we will wait until it settles. If it's resolved, current span will be finished normally. If it's
 * rejected, current span's `error` tag will be set true and an error log will be added automatically, then
 * it will finish current span.
 *
 * If it returns not promise, we assume it's a sync method and will finish automatically.
 * So, if your method is async with callback-style control flow, you must set `autoFinish` to `false`,
 * and call `span.finish()` manually.
 *
 * If `autoFinish` is set false, return value of the method is not checked, it will be return immediately.
 * Therefore it's implementor's responsibility to call `span.finish()` to finish current span.
 * Sample usage:
 * ```ts
 * @Trace({ relation: 'childOf', autoFinish: false })
 * getSomethingFromDatabase(span, id) {
 *      // ...
 *      db.get(id, (err, result) => {
 *          if (err) {
 *              span.setTag('error', true);
 *              span.logger.error('Something went wrong', err);
 *          }
 *
 *          span.finish();
 *      });
 * }
 * ```
 */
export function Trace<T extends CustomRelationHandler>(options: {
    operationName?: string,
    relation: PredefinedRelations,
    autoFinish: boolean
} | {
    operationName?: string,
    relation: 'custom',
    handler: T,
    autoFinish: boolean
}) {
    // Handler method should be same signature with original traced method,
    // but it should return partial of opentracing.SpanOptions.
    // As far as I've tried, we can not force handler's signature according to
    // original method. So, we're going from the other way.
    type TracedMethod = ReplaceReturnType<T, any>;

    return (
        target: any,
        propertyName: string,
        propertyDesciptor: TypedPropertyDescriptor<TracedMethod>
    ) => {
        const originalMethod = propertyDesciptor.value;
        options.operationName = options.operationName || propertyName;

        const optionsAs = options as {
            operationName?: string,
            relation: string,
            handler?: CustomRelationHandler,
            autoFinish?: boolean
        };

        // Pre-defined relations
        if (options.relation != 'custom') {
            switch (options.relation) {
                case 'childOf':
                    optionsAs.handler = ChildOfRelationHandler;
                    break;
                case 'followsFrom':
                    optionsAs.handler = FollowFromRelationHandler;
                    break;
                case 'newTrace':
                    optionsAs.handler = NewTraceRelationHandler;
                    break;
                default:
                    throw new Error(`Unexpected relation type "${options.relation}"`);
            }
        }

        // Replace the method
        propertyDesciptor.value = function(...args: any[]) {
            const parentSpan: opentracing.Span = args[0] instanceof opentracing.Span ? args[0] : null;
            const tracer = parentSpan ? parentSpan.tracer() : opentracing.globalTracer();
            let newSpanOptions: opentracing.SpanOptions = {};

            try {
                const handlerResultOptions = optionsAs.handler.apply(this, args);
                newSpanOptions = {
                    ...newSpanOptions,
                    ...handlerResultOptions
                };
            } catch (err) {
                console.error(`Unexpected error in traced method "${options.operationName}"s relation handler`);
                throw err;
            }

            // Inject `@Tag` to tags
            const tags = getTags(this);
            if (tags) {
                newSpanOptions.tags = {
                    ...tags,
                    ...newSpanOptions // The tags that handler set, can override component
                };
            }

            // Start a new span
            const newSpan = tracer.startSpan(options.operationName, newSpanOptions);

            // Replace the first argument with new context
            args.splice(0, 1, newSpan); // TODO: What if args == [] ???

            // Execute original method
            try {
                const rv = originalMethod.apply(this, args);

                // If auto finish is false, return rv immediately
                if (!options.autoFinish) {
                    return rv;
                }

                // Auto finish is on, check return value is promise
                // Instead of `instanceof` check, prefer checking `.then()` method exists on object.
                // User may be using custom promise polyfill (https://stackoverflow.com/a/27746324)
                if (typeof rv == 'object' && rv.then && rv.catch) {
                    return rv.then((val: any) => {
                        // Promise resolved
                        newSpan.finish();
                        return val;
                    }).catch((err: any) => {
                        // Promise is rejected
                        newSpan.logger.error((err && err.message) || 'Unknown error', err);
                        newSpan.setTag(opentracing.Tags.ERROR, true);
                        newSpan.finish();
                        throw err;
                    });
                }

                // If return value is not promise, finish and return
                newSpan.finish();
                return rv;
            } catch (err) {
                // Method throwed an error
                newSpan.logger.error((err && err.message) || 'Unknown error', err);
                newSpan.setTag(opentracing.Tags.ERROR, true);
                newSpan.finish();
                throw err;
            }
        };

        return propertyDesciptor;
    };
}


export default Trace;


/**
 * Syntactic sugar `@TraceAsync` decorator for async functions. You can
 * omit `autoFinish` option, it's enabled by default. Also type checking is set,
 * if method is not returning promise, compiler will give error.
 */
export function TraceAsync<T extends CustomRelationHandler>(options: {
    operationName?: string,
    relation: PredefinedRelations
} | {
    operationName?: string,
    relation: 'custom',
    handler: T
}) {
    // Original method should return a promise
    type AsyncTracedMethod = ReplaceReturnType<T, Promise<any>>;

    return Trace({ ...options, autoFinish: true }) as (
        target: any,
        propertyName: string,
        propertyDesciptor: TypedPropertyDescriptor<AsyncTracedMethod>
    ) => TypedPropertyDescriptor<AsyncTracedMethod>;
}


export function ChildOfRelationHandler(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions> {
    if (!parentSpan) {
        throw new Error(`Traced method's first argument must be a span`);
    }
    return { childOf: parentSpan.context() };
}


export function FollowFromRelationHandler(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions> {
    if (!parentSpan) {
        throw new Error(`Traced method's first argument must be a span`);
    }
    return { references: [ opentracing.followsFrom(parentSpan.context()) ] };
}


export function NewTraceRelationHandler(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions> {
    // Parent span is ignored
    return {};
}
