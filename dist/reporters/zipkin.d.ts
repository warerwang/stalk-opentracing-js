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
export declare class ZipkinReporter extends BaseReporter {
    private _serviceName;
    private _spans;
    private _zipkinBaseUrl;
    private _fetch;
    accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    constructor(options: {
        serviceName: string;
        zipkinBaseUrl: string;
        fetch: typeof fetch;
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
export default ZipkinReporter;
export declare function toZipkinJSON(span: Span): {
    traceId: string;
    id: string;
    name: string;
    timestamp: number;
    duration: number;
    tags: {
        [key: string]: string;
    };
    annotations: {
        timestamp: number;
        value: string;
    }[];
};
