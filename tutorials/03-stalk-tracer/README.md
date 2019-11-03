# 03-stalk-tracer

To the this point, we've seen only `opentracing` and `jaeger-client` packages. Stalk also implements a tracer fully compatible with Opentracing's Javascript 1.0 API.

```js
// If you're on node.js
const { opentracing, stalk } = require('stalk-opentracing');

// If you're on web
const { opentracing, stalk } = StalkOpentracing;
```

Let's create a new `stalk.Tracer` and set it as global tracer

```js
const stalkTracer = new stalk.Tracer();
opentracing.initGlobalTracer(stalkTracer);
const globalTracer = opentracing.globalTracer();
```

Creating spans

```js
const rootSpan = stalkTracer.startSpan('main()');
const span = stalkTracer.startSpan('printHello()', { childOf: rootSpan });
```

Adding tags. All the tags will be added to each started span automatically.

```js
stalkTracer.addTags({
    tag1: 'value1',
    tag2: 'value2'
});
// stalkTracer.deleteTag('tag2');
// stalkTracer.clearTags();
```

All the remaning code is same with the previous tutorial:

```js
async function main() {
    const span = globalTracer.startSpan('main()');
    span.addTags({
        tag1: 'value1-override', // Can be overridden
        tag3: 'value3'
    });
    span.log({ message: 'Will wait 1 second' });
    await sleep(1000);
    await printHello(span);
    span.finish();
}


async function printHello(parentSpan) {
    const span = globalTracer.startSpan('printHello()', { childOf: parentSpan });
    span.log({ message: 'Will wait 500ms more, because I can' });
    await sleep(500);
    console.log('Hello world!');
    span.finish();
}
```

However running this script is does not do anything, because we haven't added any reporters.

**[Tutorial 04 - ZipkinReporter: Sending spans to Zipkin Backend](../04-zipkin-reporter/README.md)**



