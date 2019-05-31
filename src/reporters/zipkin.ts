import * as opentracing from '../opentracing/index';
import { Span } from '../stalk/span';
import { BaseReporter } from './base';


export class ZipkinReporter extends BaseReporter {
    private _serviceName: string;
    private _spans: any[] = [];
    private _zipkinBaseUrl = 'http://localhost:9411';
    private _fetch: typeof fetch;

    accepts = {
        spanCreate: false,
        spanLog: false,
        spanFinish: true
    };


    constructor(options: {
        serviceName: string,
        zipkinBaseUrl: string,
        fetch: typeof fetch
    }) {
        super();
        this._serviceName = options.serviceName;
        this._zipkinBaseUrl = options.zipkinBaseUrl;
        this._fetch = options.fetch;
    }


    recieveSpanFinish(span: Span) {
        const data = toZipkinJSON(span) as any;
        if (!data.localEndpoint) data.localEndpoint = {};
        data.localEndpoint.serviceName = this._serviceName;
        this._spans.push(data);
    }


    report() {
        const spansToReport = this._spans.slice();
        return this._fetch(`${this._zipkinBaseUrl}/api/v2/spans`, {
            method: 'post',
            headers: { 'Content-Type': 'application/json' },
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


export function toZipkinJSON(span: Span) {
    const data = span.toJSON();

    // TODO: localEndpoint

    const tags: { [key: string]: string } = {};
    for (let name in data.tags) {
        tags[name] = data.tags[name] + '';
    }

    const output = {
        traceId: data.context.toTraceId(),
        id: data.context.toSpanId(),
        name: data.operationName,
        timestamp: data.startTime * 1000,
        duration: (data.finishTime - data.startTime) * 1000,
        tags,
        annotations: data.logs.map((log) => {
            let value = '';

            if (log.fields.level && log.fields.message) {
                value = `[${log.fields.level}] ${log.fields.message}`;
            } else {
                value = JSON.stringify(log.fields)
            }

            return {
                timestamp: (log.timestamp || 0) * 1000,
                value
            };
        })
    };

    const parentId = data.references.length > 0 ? data.references[0].referencedContext.toSpanId() : null;
    if (parentId) (output as any).parentId = parentId;

    const kind = data.tags[opentracing.Tags.SPAN_KIND];
    if (kind) {
        (output as any).kind = kind;
        delete output.tags[opentracing.Tags.SPAN_KIND];
    }

    return output;
}
