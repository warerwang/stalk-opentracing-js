# 02-jaeger-client-node

In this tutorial we will use [Jaeger's official node client](https://github.com/jaegertracing/jaeger-client-node) which also implements Opentracing's Javascript 1.0 API.

Install the package

```
npm i jaeger-client
```

Let's create a real tracer with jaeger's official node.js tracer
and send spans to jeager backend, ssuming `jaegertracing/all-in-one`
docker image is running on your localhost.

```js
const initJaegerTracer = require('jaeger-client').initTracer;

const jaegerTracer = initJaegerTracer({
    serviceName: 'my-awesome-service',
    sampler: {
        type: 'const',
        param: 1,
    },
    reporter: {
        logSpans: true,
        collectorEndpoint: 'http://localhost:14268/api/traces',
        flushIntervalMs: 500,
    }
}, {
    tags: {
        'my-awesome-service.version': '1.1.2',
    },
});
```

Set jaeger tracer as global tracer

```js
opentracing.initGlobalTracer(jaegerTracer);
const globalTracer = opentracing.globalTracer();
```

All the remaining code is the same with previous tutorial

```js
async function main() {
    const span = globalTracer.startSpan('main()');
    span.addTags({
        tag1: 'value1',
        tag2: 'value2'
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

After calling `main()` function, wait 1 second to be sure the tracer successfully reports.

```js
main().then(async () => {
    // Sleep 1s to be sure that tracer is reported
    await sleep(1000);
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
```

After running this script, you can go to Jaeger's web ui (http://localhost:16686/) can see the trace that we just created.

However `jaeger-client` package currently supports just node.js platform.

## Running demo

- Start local `jaeger-collector`
- Go to tutorial folder `cd ./tutorials/02-jaeger-client-node`
- Install dependencies `npm i`
- Start demo `node index.js`

## Next

[Tutorial 03 - Stalk Tracer](../03-stalk-tracer)
