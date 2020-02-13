import * as opentracing from 'opentracing';
import BaseReporter from './base';


export class InMemoryReporter extends BaseReporter {
    readonly accepts = {
        spanCreate: true,
        spanLog: false,
        spanFinish: false
    };


    spans: opentracing.Span[] = [];


    recieveSpanCreate(span: opentracing.Span) {
        this.spans.push(span);
    }


    close() {
        this.spans = [];
    }
}


export default InMemoryReporter;
