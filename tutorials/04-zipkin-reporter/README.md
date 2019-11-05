# 04-zipkin-reporter

Stalk has a ZipkinReporter that can send spans to zipkin backend. Since zipkin api allows CORS, this reporter works both on node.js and browsers.

```js
const zipkinReporter = new stalk.reporters.ZipkinReporter({
    // Zipkin backend url
    zipkinBaseUrl: 'http://localhost:9411',

    localEndpoint: {
        serviceName: 'my-awesome-service',
        // Some optionals
        // ipv4: '0.0.0.0',
        // port: 8080
    },

    // Optional tags to be added all the spans
    tags: {
        tag1: 'value1',
        tag2: 'value2'
    },

    // If you're on node.js use `node-fetch` package
    // fetch: require('node-fetch')
    fetch: window.fetch.bind(window),

    // Extra http headers, like basic authentication
    // requestHeaders: {},

    // Should convert logs to annotations (true by default)
    // convertLogsToAnnotations: false
});
```

Add this reporter to `stalk.Tracer`

```js
stalkTracer.addReporter(zipkinReporter);

// You can remove it anytime you want
// stalkTracer.removeReporter(zipkinReporter);
```

Call `main()` function and let ZipkinReporter report

```js
main().then(async () => {
    try {
        await zipkinReporter.report();
        console.log('Reported!');
    } catch (err) {
        console.error(`Could not reported`, err);
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
```

Then go to zipkin ui (http://localhost:9411/zipkin/) and see the trace we just created.

## Running demo

- Start local zipkin backend
- Go to tutorial folder `cd ./tutorials/04-zipkin-reporter`
- To run browser version `open web.html`
- To run node version `npm i && node node.js`

## Next

[Tutorial 05 - JaegerReporter: Sending spans to Jaeger Backend](../05-jaeger-reporter/README.md)
