import { Span } from '../stalk/span';
import { BaseReporter } from './base';
import * as Thrift from '../utils/thrift/index';
export declare class JaegerReporter extends BaseReporter {
    private _process;
    private _spans;
    private _jaegerBaseUrl;
    private _fetch;
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
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
export default JaegerReporter;
export declare function toJaegerThriftStructure(span: Span): Thrift.Struct;
