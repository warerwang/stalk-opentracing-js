# 09-context-propagation-ts-decorators

Let's rewrite previous context propagation demo with typescript decorators.

Since we will use decorators, we need to wrap our methods within a class.

**`server.ts`**

```ts
class ServerDemo {
    app = express();

    constructor() {
        // Set-up routes
        this.app.get('/endpoint', (req, res) => this.handleGetEndpoint(req, res));

        // Start the express server
        this.app.listen(port, () => console.log(`Example app listening on port ${port}!`));
    }

    // Handle GET /endpoint
    async handleGetEndpoint(req: express.Request, res: express.Response) {
        await sleep(500);
        await this.fakeDbRequest();
        res.send('Hello World!');
        console.log('GET /endpoint');
    }

    // Fake database request
    async fakeDbRequest() {
        await sleep(500);
    }
}

// Start the server
const demo = new ServerDemo();
```

However the code is not instrumented yet. Let's start with `handleGetEndpoint` method. Remember the only rule of using `@Trace` decorators is that the method should take `opentracing.Span` instance as a first argument:

```ts
@TraceAsync({ /*...*/ })
async handleGetEndpoint(
    span: opentracing.Span, // <---
    req: express.Request,
    res: express.Response
) {
    // ...
}
```

Since we want to extract span context from `req.headers`, we need to set `relation` option to `custom`. When it is set to `custom`, `handler` option is also required, it must be a function that **takes the same arguments with original method** and it must return an object in [`SpanOptions` interface](https://opentracing-javascript.surge.sh/interfaces/spanoptions.html), which is the same object when creating new spans: `tracer.startSpan(operationName, spanOptions)`

```ts
@TraceAsync({
    // Use custom relation
    relation: 'custom',

    // Handler function takes the same arguments with the original method
    handler: (span: opentracing.Span, req: express.Request, res: express.Response) => {
        // Extract context
        const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);

        // If context is not found (http headers are absent)
        // Start a new trace
        if (!spanContext) {
            return {};
        }

        // If context exists, start a new span as the
        // child of incoming span context
        return { childOf: spanContext };
    }
})
async handleGetEndpoint(span: opentracing.Span, req: express.Request, res: express.Response) {
    await sleep(500);
    span.log({ message: 'Making a fake db request' });
    await this.fakeDbRequest(span);

    res.send('Hello World!');
    console.log('GET /endpoint');
}
```

Custom relation handler is called by the decorator **before** the original method is called with the same arguments. The handler should return a [span options object](https://opentracing-javascript.surge.sh/interfaces/spanoptions.html) which will be used when creating a span from global tracer.

Lets also instrument `fakeDbRequest` method as we did it on previous tutorials

```ts
@TraceAsync({ relation: 'childOf' })
async fakeDbRequest(span: opentracing.Span) {
    span.setTag('fake-db-query', 'SELECT * FROM fake_table WHERE is_not_that_fake = true;');
    await sleep(500);
}
```

When you run the demo again, we will see a very similar trace with the trace generated in previous tutorial.

However, it's really ugly and you probably have more than one route you want to trace the same way. We can extract the handler function and re-use it anywhere else.

```ts
const customRelationHandler = (span: opentracing.Span, req: express.Request, res: express.Response) => {
    const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);
    if (!spanContext) return {};
    return { childOf: spanContext };
}

class ServerDemo {
    // ...

    constructor() {
        this.app.get('/endpoint', (req, res) => this.handleGetEndpoint(null, req, res));
        this.app.get('/another-endpoint', (req, res) => this.handleAnotherEndpoint(null, req, res));
        // ...
    }

    @TraceAsync({ relation: 'custom', handler: customRelationHandler })
    async handleGetEndpoint(span: opentracing.Span, req: express.Request, res: express.Response) {
        // ...
    }

    @TraceAsync({ relation: 'custom', handler: customRelationHandler })
    async handleAnotherEndpoint(span: opentracing.Span, req: express.Request, res: express.Response) {
        // ...
    }

    // ...
}
```

## Running demo

- Start the local jaeger collector
- Go into tutorial folder: `cd ./tutorials/09-context-propagation-ts-decorators`
- Install dependencies `npm i`
- Run already built files:
    - Start the server part `node dist/server.js`
    - Start the client part `node dist/client.js`
- Build the demo `npm run build`

## Next

TODO
