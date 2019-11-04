import { opentracing, stalk } from '../../../web.js';
const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

// Let's require our decorators
const { Tag, Component } = stalk.decorators.Tag;
const { Trace, TraceAsync } = stalk.decorators.Trace;

const stalkTracer = new stalk.Tracer();
opentracing.initGlobalTracer(stalkTracer);
const globalTracer = opentracing.globalTracer();

const stalkCollectorReporter = new stalk.reporters.StalkCollectorReporter({
    stalkCollectorApiRoot: 'http://localhost:7855',
    serviceName: 'my-awesome-service',
    tags: {
        'process-tag1': 'value1',
        'process-tag2': 'value2'
    },
    fetch: window.fetch.bind(window),
});

stalkTracer.addReporter(stalkCollectorReporter);


/**
 * Add a tag `component` and set it `Demo` for every created span
 * Alternatively you can use `@Tag()` decorator:
 *
 * ```ts
 * @Tag('component', 'Demo')
 * class Demo {}
 * ```
 */
@Component('Demo')
class Demo {
    /**
     * `@Trace()` decorator to trace methods. The only rule to keep in mind is:
     * **Every `@Trace()`d method should take a `opentracing.Span`**
     * **instance as its first argument**. If it does not typescript will give
     * you compiler error about your method's signature.
     *
     * `@Trace()` decorator takes an options object that can have 3 properties:
     *   - `operationName`: A string that specifies span's operation name.
     *                      It can be omitted, function's name will be used by default.
     *   - **`relation`**: Can be one of: `newTrace`, `childOf` and `followsFrom` or `custom`.
     *                     It's required.
     *   - **`autoFinish`**: A boolean that if `true`, return value of the decorating function
     *                       If it's promise-like object, stalk will wait until it settles and
     *                       then marks span automatically as finished. If it's not promise-like
     *                       it will mark it as finished immediately. If this value is set to `false`,
     *                       it's your responsibility to call `span.finish()`.
     *                       It's required.
     */
    @Trace({
        operationName: 'main',
        relation: 'newTrace',
        autoFinish: true
    })
    async main(span: opentracing.Span) {
        span.log({ message: 'Will wait 1 second' });
        await sleep(1000);
        await this.printHello(span);
    }

    /**
     * `@TraceAsync()` decorator is a syntactic-sugar for `async` functions.
     * Therefore you can also omit `autoFinish` property.
     */
    @TraceAsync({ relation: 'childOf' })
    async printHello(span: opentracing.Span) {
        span.log({ message: 'Will wait 500ms more, because I can' });
        await sleep(500);
        console.log('Hello world!');
    }
}

const demo = new Demo();

/**
 * `main()` function takes a span instance as first argument, however
 * it's relation is `newTrace` so a span is automatically generated.
 * To indicate that you need to specifically pass `null` as it's span argument
 * when calling it.
 */
demo.main(null).then(async () => {
    try {
        await stalkCollectorReporter.report();
        console.log('Reported!');
    } catch (err) {
        console.error(`Could not reported`, err);
    }
}).catch((err: Error) => {
    console.error(err);
});
