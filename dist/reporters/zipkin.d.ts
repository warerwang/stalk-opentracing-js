import { Span } from '../stalk/span';
import { BaseReporter } from './base';
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
        [x: string]: any;
    };
};
