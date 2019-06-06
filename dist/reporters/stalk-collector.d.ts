import { BaseReporter } from './base';
import { Span } from '../stalk/span';
export declare class StalkCollectorHttpReporter extends BaseReporter {
    private _serviceName;
    private _tags;
    private _spans;
    private _stalkCollectorApiRoot;
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
        stalkCollectorApiRoot: string;
        fetch: typeof fetch;
    });
    recieveSpanFinish(span: Span): void;
    report(): Promise<Response>;
}
