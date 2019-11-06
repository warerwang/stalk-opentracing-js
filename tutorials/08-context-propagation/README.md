# 08-context-propagation

In this tutorial we will learn how to pass the span context between different processes which is called context propagation.

This tutorial is written in node, there are two processes
- `server.js`: Simple express server on port 3000
- `client.js`: Makes a http request to localhost:3000

For both processes, we set-up a `stalk.Tracer` with `JaegerReporter` reporting to local jaeger reporter.

```js
const stalkTracer = new stalk.Tracer();
opentracing.initGlobalTracer(stalkTracer);
const globalTracer = opentracing.globalTracer();

const jaegerReporter = new stalk.reporters.JaegerReporter({
    jaegerBaseUrl: 'http://localhost:14268',
    process: {
        serviceName: 'my-awesome-server', // or `my-awesome-client`
        tags: {}
    },
    fetch: require('node-fetch'), // or window.fetch.bind(window)
});

stalkTracer.addReporter(jaegerReporter);

// Report spans every second
setInterval(() => jaegerReporter.report(), 1000);
```

In `server.js`, we listen `/endpoint` route and make some fake db request to send `Hello World!` as reponse.

```js
app.get('/endpoint', async (req, res) => {
    // Extract context from http headers
    const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);

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
```

In `client.js`, we have a `main()` function that starts a new trace named `main` and send a request to server with injecting span context into http headers.

```js
async function main() {
    const span = stalkTracer.startSpan('main');
    span.log({ message: 'doing some serious fake calculation' });
    await sleep(250);
    span.log({ message: 'Phew, now lets send request to server' });

    // Inject into empty object to be sent as http headers
    const headers = {};
    stalkTracer.inject(span, opentracing.FORMAT_TEXT_MAP, headers);

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
```

## Zipkin B3

```js
// Injecting
const headers = {};
stalkTracer.inject(span, stalk.formats.ZipkinB3FormatName, headers);

// Extracting
const spanContext = stalkTracer.extract(stalk.formats.ZipkinB3FormatName, headers);
```

Zipkin B3 propagation format is partially implemented:
- Just `X-B3-TraceId`  and `X-B3-SpanId` headers are supported

## Jaeger

```js
// Injecting
const headers = {};
stalkTracer.inject(span, stalk.formats.JaegerFormatName, headers);

// Extracting
const spanContext = stalkTracer.extract(stalk.formats.JaegerFormatName, headers);
```

Jaeger propagation format is partially implemented:
- Always sends 0 as `{parent-span-id}`
- Always sends 1 (sampled) as `flag`
- Baggage items are not supported

## Running demo

- Start the local jaeger collector
- Go into tutorial folder: `cd ./tutorials/08-context-propagation`
- Install dependencies `npm i`
- Start the server part `node server.js`
- Start the client part `node client.js`

## Next

[Tutorial 09 - Context Propagation w/ Typescript Decorators](../09-context-propagation-ts-decorators)
