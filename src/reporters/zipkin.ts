import * as opentracing from '../opentracing/index';
import { Span } from '../stalk/span';
import { BaseReporter } from './base';


/**
 * Converts spans into zipkin-compatible json format and reports to
 * Zipkin's json-v2 http endpoints. Please refer:
 * https://zipkin.apache.org/zipkin-api/#/default/post_spans
 *
 * Also works with Jaeger collector's partial implementation of Zipkin’s
 * HTTP POST endpoint when `COLLECTOR_ZIPKIN_HTTP_PORT=9411` is set.
 *
 * Since Zipkin API allows CORS, this reporter works on both browser and node.
 * Jaeger's partial Zipkin implementation also has CORS settings, I guess:
 * https://github.com/jaegertracing/jaeger/pull/1463
 *
 * For http communication `fetch()` API is used. In you're in browser, no worries,
 * just pass built-in `window.fetch.bind(window)`. You need to bind call context to window object
 * to prevent `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` error.
 * If you're in node.js, you need to bring your own fetch, check `node-fetch` package.
 */
export class ZipkinReporter extends BaseReporter {
    private _serviceName: string;
    private _spans: any[] = [];
    private _zipkinBaseUrl = 'http://localhost:9411';
    private _fetch: typeof fetch;
    private _requestHeaders: { [key: string]: string } = {};

    accepts = {
        spanCreate: false,
        spanLog: false,
        spanFinish: true
    };


    constructor(options: {
        serviceName: string,
        zipkinBaseUrl: string,
        fetch: typeof fetch
        requestHeaders?: { [key: string]: string }
    }) {
        super();
        this._serviceName = options.serviceName;
        this._zipkinBaseUrl = options.zipkinBaseUrl;
        this._fetch = options.fetch;
        this._requestHeaders = options.requestHeaders || {};
    }


    recieveSpanFinish(span: Span) {
        const data = toZipkinJSON(span) as any;
        if (!data.localEndpoint) data.localEndpoint = {};
        data.localEndpoint.serviceName = this._serviceName;
        this._spans.push(data);
    }


    report() {
        const spansToReport = this._spans.slice();
        return this._fetch(`${this._zipkinBaseUrl}/api/v2/spans`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
                ...this._requestHeaders
            },
            body: JSON.stringify(spansToReport)
        }).then((res) => {
            if (res.ok) {
                spansToReport.forEach((s) => {
                    const index = this._spans.indexOf(s);
                    index > -1 && this._spans.splice(index, 1);
                });
            }
            return res;
        });
    }
}


export default ZipkinReporter;


export function toZipkinJSON(span: Span) {
    const data = span.toJSON();

    // TODO: localEndpoint

    const tags: { [key: string]: string } = {};
    for (let name in data.tags) {
        tags[name] = data.tags[name] + '';
    }

    const output = {
        traceId: data.context.toTraceId(),
        id: data.context.toSpanId(),
        name: data.operationName,
        timestamp: data.startTime * 1000,
        duration: (data.finishTime - data.startTime) * 1000,
        tags,
        annotations: data.logs.map((log) => {
            let value = '';

            if (log.fields.level && log.fields.message) {
                value = `[${log.fields.level}] ${log.fields.message}`;
            } else {
                value = JSON.stringify(log.fields)
            }

            return {
                timestamp: (log.timestamp || 0) * 1000,
                value
            };
        })
    };

    const parentId = data.references.length > 0 ? data.references[0].referencedContext.toSpanId() : null;
    if (parentId) (output as any).parentId = parentId;

    const kind = data.tags[opentracing.Tags.SPAN_KIND];
    if (kind) {
        (output as any).kind = kind;
        delete output.tags[opentracing.Tags.SPAN_KIND];
    }

    return output;
}
