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

Since we want to extract span context from `req.headers`, we need to handle span creation manually. For that case, we will omit `relation` and use `handler` option, it must be a function that **takes the same arguments with original method** and it must return [an `opentracing.Span` instance](https://opentracing-javascript.surge.sh/classes/span.html).

```ts
@TraceAsync({
    // Handler function takes the same arguments with the original method
    handler: (span: opentracing.Span, req: express.Request, res: express.Response) => {
        // Extract context
        const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);

        // Get the global tracer
        const tracer = opentracing.globalTracer();

        // If context is not found (http headers are absent)
        // Start a new trace
        if (!spanContext) {
            return tracer.startSpan('', {});

            // Alternatively, you may want not to trace at all
            // In that case, use opentracing's default noop tracer
            // const noopTracer = new opentracing.Tracer();
            // return noopTracer.startSpan('');
        }

        // If context exists, start a new span as the
        // child of incoming span context
        return tracer.startSpan('', { childOf: spanContext });
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

Handler function is called by the decorator **before** the original method is called, and with the same arguments. The handler must return [an `opentracing.Span` instance](https://opentracing-javascript.surge.sh/classes/span.html).

After the handler function returns the span, decorator will:
- Set its operation name as specified with `operationName` option (or the method name by default). So if you set a operation name while starting span in your handler, it **will be overriden**.
- Add the tags if the class is decorated with `@Tag` or `@Component`.

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
// Tracers
const globalTracer = opentracing.globalTracer();
const noopTracer = new opentracing.Tracer();

// Handler function
const handler = (span: opentracing.Span, req: express.Request, res: express.Response) => {
    const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);
    if (!spanContext) return noopTracer.startSpan('');
    return globalTracer.startSpan('', { childOf: spanContext });
}

class ServerDemo {
    // ...

    constructor() {
        this.app.get('/endpoint', (req, res) => this.handleGetEndpoint(null, req, res));
        this.app.get('/another-endpoint', (req, res) => this.handleAnotherEndpoint(null, req, res));
        // ...
    }

    @TraceAsync({ handler })
    async handleGetEndpoint(span: opentracing.Span, req: express.Request, res: express.Response) {
        // ...
    }

    @TraceAsync({ handler })
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
