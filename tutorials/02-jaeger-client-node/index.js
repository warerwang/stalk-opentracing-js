// Stalk comes with opentracing built-in
const { opentracing } = require('../../');
const initJaegerTracer = require('jaeger-client').initTracer;
const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));

// Let's create a real tracer with jaeger's official node.js tracer
// and send spans to jeager backend, ssuming `jaegertracing/all-in-one`
// docker image is running on your localhost
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

// Set jaeger tracer as global tracer
opentracing.initGlobalTracer(jaegerTracer);
const globalTracer = opentracing.globalTracer();


async function main() {
    // Create a span
    const span = globalTracer.startSpan('main()');

    // Set some tags
    span.addTags({
        tag1: 'value1',
        tag2: 'value2'
    });

    // Log
    span.log({ message: 'Will wait 1 second' });
    await sleep(1000);

    await printHello(span);

    span.finish();
}


async function printHello(parentSpan) {
    // Create a child span
    const span = globalTracer.startSpan('printHello()', { childOf: parentSpan });

    span.log({ message: 'Will wait 500ms more, because I can' });
    await sleep(500);
    console.log('Hello world!');

    span.finish();
}


main().then(async () => {
    // Sleep 1s to be sure that tracer is reported
    await sleep(1000);
    process.exit();
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
