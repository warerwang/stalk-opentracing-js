# 06-stalk-collector

Since jaeger collector does not allow cors, stalk has a simple collector project that proxies incoming spans to a jaeger collector, or a zipkin backend, or both by allowing CORS.

**Requires minumum node.js v10.4.0**

To install & set-up stalk-collector

```bash
git clone git@github.com:dgurkaynak/stalk-collector.git
cd stalk-collector
npm i
```

To start stalk-collector that proxies to local jaeger-collector

```bash
JAEGER_BASE_URL="http://localhost:14268" npm start
```

You can Visit [stalk-collector](https://github.com/dgurkaynak/stalk-collector) for more options.

After stalk-collector agent is up & running, let's configure our reporter:

```js
const stalkCollectorReporter = new stalk.reporters.StalkCollectorReporter({
    stalkCollectorApiRoot: 'http://localhost:7855',
    serviceName: 'my-awesome-service',

    // Optional process tags
    tags: {
        tag1: 'value1',
        tag2: 'value2'
    },

    // If you're on node.js use `node-fetch` package
    fetch: window.fetch.bind(window),

    // Extra http headers
    // requestHeaders: {},
});
```

Add the reporter to `stalk.Tracer`

```js
stalkTracer.addReporter(stalkCollectorReporter);

// You can remove it anytime you want
// stalkTracer.removeReporter(stalkCollectorReporter);
```

Call the `main()` function and report it

```js
main().then(async () => {
    try {
        await stalkCollectorReporter.report();
        console.log('Reported!');
    } catch (err) {
        console.error(`Could not reported`, err);
    }
}).catch((err) => {
    console.error(err);
});
```

Then go to jaeger ui (http://localhost:16686/) and see the trace we just created.

**[Tutorial 07 - Typescript Decorators](../07-typescript-decorators/README.md)**
