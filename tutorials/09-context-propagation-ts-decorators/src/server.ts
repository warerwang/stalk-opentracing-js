import { opentracing, stalk } from '../../../';
import fetch from 'node-fetch';
import * as express from 'express';

const port = 3000;
const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

// Let's require our decorators
const { Tag, Component } = stalk.decorators.Tag;
const { Trace, TraceAsync } = stalk.decorators.Trace;

/**
 * Set-up stalk tracer with jaeger reporter.
 */
const stalkTracer = new stalk.Tracer();
const noopTracer = new opentracing.Tracer();
opentracing.initGlobalTracer(stalkTracer);
const globalTracer = opentracing.globalTracer();

const jaegerReporter = new stalk.reporters.JaegerReporter({
    jaegerBaseUrl: 'http://localhost:14268',
    process: {
        serviceName: 'my-awesome-server',
        tags: { port: `${port}` }
    },
    fetch: fetch as any,
});

stalkTracer.addReporter(jaegerReporter);
setInterval(() => jaegerReporter.report(), 1000);


/**
 * Our custom relation handler. Save a reference for reusability.
 */
const customRelationHandler = (span: opentracing.Span, req: express.Request, res: express.Response) => {
    // Extract context
    const spanContext = stalkTracer.extract(opentracing.FORMAT_TEXT_MAP, req.headers);
    // const spanContext = stalkTracer.extract(stalk.formats.JaegerFormatName, req.headers);
    // const spanContext = stalkTracer.extract(stalk.formats.ZipkinB3FormatName, req.headers);

    if (!spanContext) {
        // If context is not found (http headers are absent)
        // Start a new trace
        return stalkTracer.startSpan('', {});

        // Or, you may want not to trace at all,
        // In that case, you can use noop tracer
        return noopTracer.startSpan('');
    }

    return stalkTracer.startSpan('', { childOf: spanContext });
}


/**
 * Since we will use typescript decorators, we need to wrap
 * our methods with a class.
 */
class ServerDemo {
    app = express();

    constructor() {
        // Set-up routes
        this.app.get('/endpoint', (req, res) => this.handleGetEndpoint(null, req, res));
        this.app.get('/endpoint2', (req, res) => this.handleGetEndpoint2(null, req, res));

        // Start the express server
        this.app.listen(port, () => console.log(`Example app listening on port ${port}!`));
    }

    @TraceAsync({ handler: customRelationHandler })
    async handleGetEndpoint(span: opentracing.Span, req: express.Request, res: express.Response) {
        await sleep(500);
        span.log({ message: 'Making a fake db request' });
        await this.fakeDbRequest(span);

        res.send('Hello World!');
        console.log('GET /endpoint');
    }

    @TraceAsync({ handler: customRelationHandler })
    async handleGetEndpoint2(span: opentracing.Span, req: express.Request, res: express.Response) {
        await sleep(100);
        res.send('This is endpoint 2');
        console.log('GET /endpoint2');
    }

    @TraceAsync({ relation: 'childOf' })
    async fakeDbRequest(span: opentracing.Span) {
        span.setTag('fake-db-query', 'SELECT * FROM fake_table WHERE is_not_that_fake = true;');
        await sleep(500);
    }
}

// Start the server
const demo = new ServerDemo();
