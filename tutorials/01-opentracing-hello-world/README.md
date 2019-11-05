# 01-opentracing-hello-world

Let's start with standard opentracing samples. Stalk comes with [`opentracing` package](https://www.npmjs.com/package/opentracing) built-in, which is offical Javascript OpenTracing API 1.0.

```js
// If you're on node.js
const { opentracing } = require('stalk-opentracing');

// If you're on browser, include web version of stalk
// <script src="./node_modules/stalk-opentracing/web.js"></script>
// When script is loaded, its exposed under window.StalkOpentracing
const { opentracing } = window.StalkOpentracing;
```

We have 2 simple functions

```js
async function main() {
    await sleep(1000);
    await printHello();
}

async function printHello() {
    await sleep(500);
    console.log('Hello world!');
}
```

We need to get global tracer, by default it's noop tracer.

```js
const globalTracer = opentracing.globalTracer();
```

Let's instrument our first `main()` function

```js
async function main() {
    // Create a span with a operation name `main()`
    const span = globalTracer.startSpan('main()');

    // Set some tags
    span.addTags({
        tag1: 'value1',
        tag2: 'value2'
    });

    // Put some logs
    span.log({ message: 'Will wait 1 second' });
    await sleep(1000);

    await printHello();

    // Mark span as finished
    span.finish();
}
```

And the second `printHello()` function

```js
async function printHello(parentSpan) {
    // Create a child span
    const span = globalTracer.startSpan('printHello()', { childOf: parentSpan });

    span.log({ message: 'Will wait 500ms more, because I can' });
    await sleep(500);
    console.log('Hello world!');

    span.finish();
}
```

And we need to call `printHello` function as

```js
async function main() {
    const span = globalTracer.startSpan('main()');
    // ...
    await printHello(span);
    // ...
}
```

Finally call `main()` function and execute the script you just created.

```js
main().catch((err) => {
    console.error(err);
    process.exit(1);
});
```

You will see `Hello world!` on your console, that's cool but opentracing's
default tracer is noop tracer, so it does nothing. We need to use custom tracers to make it work.

## Running demo

- Go to tutorial folder `cd ./tutorials/01-opentracing-hello-world`
- To run browser version `open web.html`
- To run node version `node node.js`

## Next

[Tutorial 02 - Using Jaeger's offical node client](../02-jaeger-client-node)
