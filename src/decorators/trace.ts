import * as opentracing from '../opentracing/index';
import { getComponentName } from './component-name';



/**
 * `@Trace()` decorator's supported relation types.
 */
export type TraceRelationType = 'newTrace' | 'childOf' | 'followsFrom';


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
 *      @Trace({ operationName: 'multiply', relationType: 'newTrace', autoFinish: true })
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
 *      @Trace({ relationType: 'childOf', autoFinish: true }) // operationName can be omitted, method name is used by default
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
 * @Trace({ relationType: 'childOf', autoFinish: false })
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
export function Trace(options: {
    operationName?: string,
    relationType: TraceRelationType | ((...args: any[]) => TraceRelationType),
    autoFinish: boolean
}) {
    return (
        target: Object,
        propertyName: string,
        propertyDesciptor: TypedPropertyDescriptor<(span: opentracing.Span, ...args: any[]) => any>
    ) => {
        const originalMethod = propertyDesciptor.value;
        options.operationName = options.operationName || propertyName;

        // Replace the method
        propertyDesciptor.value = function(...args: any[]) {
            const parentSpan: opentracing.Span = args[0] instanceof opentracing.Span ? args[0] : null;
            const tracer = parentSpan ? parentSpan.tracer() : opentracing.globalTracer();
            const newSpanOptions: opentracing.SpanOptions = {};

            // If relation type is a function, execute it
            if (typeof options.relationType == 'function') {
                try {
                    const relationType = options.relationType.apply(this, args);
                    options.relationType = relationType;
                } catch (err) {
                    console.error(`Unexpected error in traces method "${options.operationName}"s relation type handler`);
                    throw err;
                }
            }

            // Inject `@ComponentName` to tags
            const componentName = getComponentName(this);
            if (componentName) {
                newSpanOptions.tags = { [opentracing.Tags.COMPONENT]: componentName };
            }

            // If relation type `childOf` or `followsFrom`, set-up span options
            if (options.relationType == 'childOf' || options.relationType == 'followsFrom') {
                if (!parentSpan) {
                    throw new Error(`Traced method "${options.operationName}"s first argument must be a span`);
                }

                if (options.relationType == 'childOf') {
                    newSpanOptions.childOf = parentSpan;
                } else if (options.relationType == 'followsFrom') {
                    newSpanOptions.references = [ opentracing.followsFrom(parentSpan) ];
                }
            }

            // Start a new span
            const newSpan = tracer.startSpan(options.operationName, newSpanOptions);

            // Replace the first argument with new context
            args.splice(0, 1, newSpan);

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
