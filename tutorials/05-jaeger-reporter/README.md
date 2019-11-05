# 05-jaeger-reporter

Stalk can directly send spans to jaeger collectors which only accepts data in [jaeger.thrift](https://github.com/jaegertracing/jaeger-idl/blob/master/thrift/jaeger.thrift) binary format. Stalk has partially-implemented thrift binary protocol by using built-in Javascript APIs: `ArrayBuffer`, `DataView`, `BigInt`. So this reporter works both on node.js and browsers. However your target platform must support these APIs or they must be polyfilled. BigInt is currently supported by `Chrome >=67`, and `Node.js >=10.4.0`.

Another sad thing is jaeger collector does not allow CORS, so this reporter will stuck CORS error on browsers. This is no problem for node.js and electron platforms. A some kind of proxy server can be used as a workaround for this issue.

Let's create a jaeger reporter

```js
const jaegerReporter = new stalk.reporters.JaegerReporter({
    // Jaeger collector base url
    jaegerBaseUrl: 'http://localhost:14268',

    process: {
        serviceName: 'my-awesome-service',
        // Optional process tags
        tags: {
            tag1: 'value1',
            tag2: 'value2'
        }
    },

    // If you're on browsers, pass this: window.fetch.bind(window)
    fetch: require('node-fetch'),

    // Extra http headers, like basic authentication
    // requestHeaders: {},
});

// Add this reporter to stalk.Tracer
stalkTracer.addReporter(jaegerReporter);

// You can remove it anytime you want
// stalkTracer.removeReporter(jaegerReporter);
```

Call the `main()` function and report it

```js
main().then(async () => {
    try {
        await jaegerReporter.report();
        console.log('Reported!');
        process.exit(0);
    } catch (err) {
        console.error(`Could not reported`, err);
        process.exit(1);
    }
}).catch((err) => {
    console.error(err);
    process.exit(1);
});
```

Then go to jaeger ui (http://localhost:16686/) and see the trace we just created.

## Running demo

- Start local jaeger backend
- Go to tutorial folder `cd ./tutorials/05-jaeger-reporter`
- To run node version `npm i && node node.js`
- To run browser version:
    - Quit your chrome
    - Reopen with web security disabled `chrome --disable-web-security --user-data-dir`
    - Open the html `open web.html`

## Next

[Tutorial 06 - Stalk Collector](../06-stalk-collector)
