import { Span } from '../stalk/span';
import { BaseReporter } from './base';
interface LocalEndpoint {
    serviceName: string;
    ipv4?: string;
    port?: number;
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
export declare class ZipkinReporter extends BaseReporter {
    private _localEndpoint;
    /**
     * Since zipkin does not have process tags or localEndpoint tags,
     * these will be appended to each span.
     */
    private _tags;
    private _spans;
    private _zipkinBaseUrl;
    private _fetch;
    private _requestHeaders;
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
    private _shouldConvertLogsToAnnotations;
    accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    constructor(options: {
        localEndpoint: LocalEndpoint;
        tags: {
            [key: string]: string;
        };
        zipkinBaseUrl: string;
        fetch: typeof fetch;
        requestHeaders?: {
            [key: string]: string;
        };
        convertLogsToAnnotations?: boolean;
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
export default ZipkinReporter;
export declare function toZipkinJSON(span: Span, shouldConvertLogsToAnnotations?: boolean, constantTags?: {
    [key: string]: string;
}): {
    traceId: string;
    id: string;
    name: string;
    timestamp: number;
    duration: number;
    tags: {
        [key: string]: string;
    };
};
