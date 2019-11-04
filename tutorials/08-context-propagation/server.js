const { opentracing, stalk } = require('../../');
const express = require('express');
const app = express();
const port = 3000;
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
        serviceName: 'my-awesome-server',
        tags: { port }
    },
    fetch: require('node-fetch'),
});

stalkTracer.addReporter(jaegerReporter);
setInterval(() => jaegerReporter.report(), 1000);

/**
 * Listen for `/endpoint`
 */
app.get('/endpoint', async (req, res) => {
    // Extract context
    const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);
    // const spanContext = stalkTracer.extract(stalk.formats.JaegerFormatName, req.headers);
    // const spanContext = stalkTracer.extract(stalk.formats.ZipkinB3FormatName, req.headers);

    // Create a children of extracted context, if it does not exists, create a new trace
    const span = stalkTracer.startSpan('GET /endpoint', spanContext ? { childOf: spanContext } : {});
    await sleep(500);
    span.log({ message: 'Making a fake db request' });
    await fakeDbRequest(span);

    res.send('Hello World!');
    console.log('GET /endpoint');

    span.finish();
});

// Fake db request
async function fakeDbRequest(parentSpan) {
    const span = stalkTracer.startSpan('fakeDbRequest', { childOf: parentSpan });
    span.setTag('fake-db-query', 'SELECT * FROM fake_table WHERE is_not_that_fake = true;');
    await sleep(500);
    span.finish();
}

// Start the server
app.listen(port, () => console.log(`Example app listening on port ${port}!`));
