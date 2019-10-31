import * as opentracing from '../opentracing/index';
import { Span } from '../stalk/span';
import { BaseReporter } from './base';


interface LocalEndpoint {
    serviceName: string,
    ipv4?: string,
    port?: number
}


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
    private _localEndpoint: LocalEndpoint;
    /**
     * Since zipkin does not have process tags or localEndpoint tags,
     * these will be appended to each span.
     */
    private _tags: { [key: string]: string } = {};
    private _spans: any[] = [];
    private _zipkinBaseUrl = 'http://localhost:9411';
    private _fetch: typeof fetch;
    private _requestHeaders: { [key: string]: string } = {};
    /**
     * Zipkin does not have log api, but it supports annotations which is just
     * plain string. Stalk can convert logs into annotations
     * - If stalk's `logger` api is used, the log converted into `[level] message`
     * format. Yes, the other fields are ignored.
     * - If log structure is not familiar, all the log fields will be `JSON.stringify`ed.
     *
     * However, I don't know if it's the right way:
     * https://github.com/apache/incubator-zipkin-api/blob/master/thrift/zipkinCore.thrift#L330
     */
    private _shouldConvertLogsToAnnotations = true;

    accepts = {
        spanCreate: false,
        spanLog: false,
        spanFinish: true
    };


    constructor(options: {
        localEndpoint: LocalEndpoint
        tags: { [key: string]: string },
        zipkinBaseUrl: string,
        fetch: typeof fetch
        requestHeaders?: { [key: string]: string },
        convertLogsToAnnotations?: boolean
    }) {
        super();
        this._localEndpoint = options.localEndpoint;
        if (typeof options.tags == 'object') this._tags = options.tags;
        this._zipkinBaseUrl = options.zipkinBaseUrl;
        this._fetch = options.fetch;
        this._requestHeaders = options.requestHeaders || {};
        this._requestHeaders = options.requestHeaders || {};
        if (typeof options.convertLogsToAnnotations == 'boolean') {
            this._shouldConvertLogsToAnnotations = options.convertLogsToAnnotations;
        }
    }


    recieveSpanFinish(span: Span) {
        const data = toZipkinJSON(span, this._shouldConvertLogsToAnnotations, this._tags) as any;
        data.localEndpoint = this._localEndpoint;
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


export function toZipkinJSON(span: Span, shouldConvertLogsToAnnotations = false, constantTags: { [key: string]: string } = {}) {
    const data = span.toJSON();

    const tags: { [key: string]: string } = {};
    for (let name in constantTags) { tags[name] = data.tags[name] + ''; }
    for (let name in data.tags) { tags[name] = data.tags[name] + ''; }

    const output = {
        traceId: data.context.toTraceId(),
        id: data.context.toSpanId(),
        name: data.operationName,
        timestamp: data.startTime * 1000,
        duration: (data.finishTime - data.startTime) * 1000,
        tags
    };

    if (shouldConvertLogsToAnnotations) {
        (output as any).annotations = data.logs.map((log) => {
            let value = '';

            if (log.fields.level && log.fields.message) {
                value = `[${log.fields.level}] ${log.fields.message}`;
            } else {
                value = JSON.stringify(log.fields);
            }

            return {
                timestamp: (log.timestamp || 0) * 1000,
                value
            };
        });
    }

    // As far as I understand, zipkin does not have `followsFrom` relation
    // So we're setting any referenced span as parent span :/
    const parentId = data.references.length > 0 ? data.references[0].referencedContext.toSpanId() : null;
    if (parentId) (output as any).parentId = parentId;

    const kind = data.tags[opentracing.Tags.SPAN_KIND];
    if (kind) {
        (output as any).kind = kind;
        delete output.tags[opentracing.Tags.SPAN_KIND];
    }

    return output;
}
