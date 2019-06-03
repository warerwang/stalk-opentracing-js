import { Span } from '../stalk/span';
import { BaseReporter } from './base';
import * as Thrift from '../utils/thrift/index';
/**
 * This reporter converts the data to jaeger.thrift binary format and sends them
 * to the directly Jaeger collector's http endpoint. Since Jaeger API does not allow CORS,
 * this reporter does not work on browsers. To skip this issue, a proxy server can be used.
 *
 * This reporter uses ArrayBuffer, DataView, BigInt APIs for thrift binary encoding. So your
 * targetting platform must support these APIs or they must be polyfilled. BigInt is currently
 * supported by just `Chrome >=67` in browswers, and node.js got its BigInt support on `v10.4.0`.
 *
 * For jaeger.thrift format, please refer:
 * https://github.com/jaegertracing/jaeger-idl/blob/master/thrift/jaeger.thrift
 *
 * For http communication `fetch()` API is used. In you're in browser, no worries,
 * just pass built-in `window.fetch.bind(window)`. You need to bind call context to window object
 * to prevent `TypeError: Failed to execute 'fetch' on 'Window': Illegal invocation` error.
 * If you're in node.js, you need to bring your own fetch, check `node-fetch` package.
 */
export declare class JaegerReporter extends BaseReporter {
    private _process;
    private _spans;
    private _jaegerBaseUrl;
    private _fetch;
    private _requestHeaders;
    accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    constructor(options: {
        process: {
            serviceName: string;
            tags: {
                [key: string]: string;
            };
        };
        jaegerBaseUrl: string;
        fetch: typeof fetch;
        requestHeaders?: {
            [key: string]: string;
        };
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
export default JaegerReporter;
export declare function toJaegerThriftStructure(span: Span): Thrift.Struct;
