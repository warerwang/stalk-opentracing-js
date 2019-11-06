import { opentracing, stalk } from '../../../node.js';
import fetch from 'node-fetch';

const sleep = (duration: number) => new Promise(resolve => setTimeout(resolve, duration));

// Let's require our decorators
const { Tag, Component } = stalk.decorators.Tag;
const { Trace, TraceAsync } = stalk.decorators.Trace;

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
        tags: { }
    },
    fetch: fetch,
});

stalkTracer.addReporter(jaegerReporter);
setInterval(() => jaegerReporter.report(), 1000);


/**
 * Main function, wrapped with a class
 */
class ClientDemo {
    @TraceAsync({ relation: 'newTrace' })
    async main(span: opentracing.Span) {
        span.log({ message: 'doing some serious fake calculation' });
        await sleep(250);

        span.log({ message: 'Phew, now lets send request to server' });

        // Injection is still the same way
        const headers = {};
        stalkTracer.inject(span, opentracing.FORMAT_TEXT_MAP, headers);
        // stalkTracer.inject(span, stalk.formats.JaegerFormatName, headers);
        // stalkTracer.inject(span, stalk.formats.ZipkinB3FormatName, headers);

        try {
            const response = await fetch(`http://localhost:3000/endpoint`, { headers });
            const text = await response.text();
            console.log(`Got response from server: ${text}`);
        } catch (err) {
            console.error(err);
            span.log({ event: 'error', message: err.message, stack: err.stack, 'error.kind': err.name })
            span.setTag('error', true);
        }
    }
}


const demo = new ClientDemo();
demo.main(null);
