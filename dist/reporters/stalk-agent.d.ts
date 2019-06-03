import { BaseReporter } from './base';
import { Span } from '../stalk/span';
export declare class StalkAgentHttpReporter extends BaseReporter {
    private _serviceName;
    private _tags;
    private _spans;
    private _stalkAgentApiRoot;
    private _fetch;
    accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    constructor(options: {
        serviceName: string;
        tags?: {
            [key: string]: string;
        };
        stalkAgentApiRoot: string;
        fetch: typeof fetch;
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
