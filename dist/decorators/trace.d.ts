import * as opentracing from '../opentracing/index';
/**
 * Some types
 */
export declare type TracedMethod = (span: opentracing.Span, ...args: any[]) => any;
export declare type AsyncTracedMethod = (span: opentracing.Span, ...args: any[]) => Promise<any>;
export declare type RelationHandler = (span: opentracing.Span, ...args: any[]) => Partial<opentracing.SpanOptions>;
export declare type RelationParameterType = 'childOf' | 'followsFrom' | 'newTrace' | RelationHandler;
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
 * `relation` must be set a function as takes the same arguments with the decorated function.
 * It will called before original method and it must be return some part of
 * span options (`opentracing.SpanOptions`) that defines the relation to other spans.
 * There are pre-defined some relations: `childOf`, `followsFrom`, `newTrace`.
 * If you want to extract span context from external communication, you should set your custom relation handler.
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
export declare function Trace(options: {
    operationName?: string;
    relation: RelationParameterType;
    autoFinish: boolean;
}): (target: Object, propertyName: string, propertyDesciptor: TypedPropertyDescriptor<TracedMethod>) => TypedPropertyDescriptor<TracedMethod>;
export default Trace;
/**
 * Syntactic sugar `@TraceAsync` decorator for async functions. You can
 * omit `autoFinish` option, it's enabled by default. Also type checking is set,
 * if method is not returning promise, compiler will give error.
 */
export declare function TraceAsync(options: {
    operationName?: string;
    relation: RelationParameterType;
}): (target: Object, propertyName: string, propertyDesciptor: TypedPropertyDescriptor<AsyncTracedMethod>) => TypedPropertyDescriptor<AsyncTracedMethod>;
export declare function ChildOfRelation(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions>;
export declare function FollowFromRelation(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions>;
export declare function NewTraceRelation(parentSpan: opentracing.Span, ...args: any[]): Partial<opentracing.SpanOptions>;
