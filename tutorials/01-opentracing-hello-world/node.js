// Stalk comes with opentracing built-in
const { opentracing } = require('../../');
const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));

// Get global tracer, by default it's noop tracer
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

main().catch((err) => {
    console.error(err);
    process.exit(1);
});
