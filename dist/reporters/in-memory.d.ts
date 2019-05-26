import * as opentracing from '../opentracing/index';
import BaseReporter from './base';
export declare class InMemoryReporter extends BaseReporter {
    readonly accepts: {
        spanCreate: boolean;
        spanLog: boolean;
        spanFinish: boolean;
    };
    spans: opentracing.Span[];
    recieveSpanCreate(span: opentracing.Span): void;
    close(): void;
}
export default InMemoryReporter;
