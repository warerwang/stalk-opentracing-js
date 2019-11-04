const { opentracing, stalk } = require('../../');
const fetch = require('node-fetch');
const sleep = (duration) => new Promise(resolve => setTimeout(resolve, duration));

/**
 * Set-up stalk tracer with jaeger reporter.
 */
const stalkTracer = new stalk.Tracer();
opentracing.initGlobalTracer(stalkTracer);
const globalTracer = opentracing.globalTracer();

const jaegerReporter = new stalk.reporters.JaegerReporter({
    jaegerBaseUrl: 'http://localhost:14268',
    process: {
        serviceName: 'my-awesome-client',
        tags: {}
    },
    fetch: fetch,
});

stalkTracer.addReporter(jaegerReporter);
setInterval(() => jaegerReporter.report(), 1000);

/**
 * Main function
 */
async function main() {
    const span = stalkTracer.startSpan('main');
    span.log({ message: 'doing some serious fake calculation' });
    await sleep(250);
    span.log({ message: 'Phew, now lets send request to server' });

    // Inject into empty object to be sent as http headers
    const headers = {};
    stalkTracer.inject(span, opentracing.FORMAT_TEXT_MAP, headers);
    // stalkTracer.inject(span, stalk.formats.JaegerFormatName, headers);
    // stalkTracer.inject(span, stalk.formats.ZipkinB3FormatName, headers);

    try {
        const response = await fetch(`http://localhost:3000/endpoint`, { headers });
        const text = await response.text();
        console.log(`Got response from server: ${text}`);
        span.finish();
    } catch (err) {
        console.error(err);
        span.log({ event: 'error', message: err.message, stack: err.stack, 'error.kind': err.name })
        span.setTag('error', true);
        span.finish();
    }
}

main();
