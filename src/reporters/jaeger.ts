import * as opentracing from '../opentracing/index';
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
export class JaegerReporter extends BaseReporter {
    private _process: {
        serviceName: string,
        tags: { [key: string]: string }
    };
    private _spans: any[] = [];
    private _jaegerBaseUrl = 'http://localhost:14268';
    private _fetch: typeof fetch;
    private _requestHeaders: { [key: string]: string } = {};


    accepts = {
        spanCreate: false,
        spanLog: false,
        spanFinish: true
    };


    constructor(options: {
        process: {
            serviceName: string,
            tags: { [key: string]: string }
        },
        jaegerBaseUrl: string,
        fetch: typeof fetch,
        requestHeaders?: { [key: string]: string }
    }) {
        super();
        this._process = options.process;
        this._jaegerBaseUrl = options.jaegerBaseUrl;
        this._fetch = options.fetch;
        this._requestHeaders = options.requestHeaders || {};
    }


    recieveSpanFinish(span: Span) {
        const data = toJaegerThriftStructure(span) as any;
        this._spans.push(data);
    }


    report() {
        const spansToReport = this._spans.slice();

        // Build process struct
        const processTagsList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
        for (let name in this._process.tags) {
            const tagStruct = new Thrift.Struct([
                {
                    id: 1, name: 'key', type: Thrift.StructFieldType.STRING,
                    value: new Thrift.String(name)
                },
                {
                    id: 2, name: 'vType', type: Thrift.StructFieldType.I32,
                    value: new Thrift.I32(0) // 0 refers STRING
                },
                {
                    id: 3, name: 'vStr', type: Thrift.StructFieldType.STRING,
                    value: new Thrift.String(this._process.tags[name] + '') // cast string
                }
            ]);

            processTagsList.elements.push(tagStruct);
        }

        const processStruct = new Thrift.Struct([
            {
                id: 1, name: 'serviceName', type: Thrift.StructFieldType.STRING,
                value: new Thrift.String(this._process.serviceName)
            },
            {
                id: 2, name: 'tags', type: Thrift.StructFieldType.LIST,
                value: processTagsList
            }
        ]);

        // Build spans list
        const spansList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
        spansList.elements = this._spans;

        // Build batch struct
        const batchStruct = new Thrift.Struct([
            {
                id: 1, name: 'process', type: Thrift.StructFieldType.STRUCT,
                value: processStruct
            },
            {
                id: 2, name: 'spans', type: Thrift.StructFieldType.LIST,
                value: spansList
            }
        ]);

        const calculatedByteLength = batchStruct.calculateByteLength();
        const buffer = new ArrayBuffer(calculatedByteLength);
        batchStruct.writeToBuffer(buffer, 0);

        return this._fetch(`${this._jaegerBaseUrl}/api/traces`, {
            method: 'post',
            headers: {
                'Content-Type': 'application/x-thrift',
                'Connection': 'keep-alive',
                ...this._requestHeaders
            },
            body: buffer
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


export default JaegerReporter;


const emptyBuffer = new Uint8Array([0, 0, 0, 0, 0, 0, 0, 0]);


export function toJaegerThriftStructure(span: Span) {
    const data = span.toJSON();

    // Must obey:
    // https://github.com/jaegertracing/jaeger-idl/blob/master/thrift/jaeger.thrift

    let parentSpanId: string;

    const referencesList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
    data.references.forEach((ref) => {
        if (ref.type == opentracing.REFERENCE_CHILD_OF || ref.type == opentracing.REFERENCE_FOLLOWS_FROM) {
            let refTypeEnumValue: number;

            if (ref.type == opentracing.REFERENCE_CHILD_OF) {
                parentSpanId = ref.referencedContext.toSpanId();
                refTypeEnumValue = 0; // 0 means CHILD_OF
            } else if (ref.type == opentracing.REFERENCE_FOLLOWS_FROM) {
                refTypeEnumValue = 1; // 1 means FOLLOWS_FROM
            }

            const spanRefStruct = new Thrift.Struct([
                {
                    id: 1, name: 'refType', type: Thrift.StructFieldType.I32,
                    value: new Thrift.I32(refTypeEnumValue)
                },
                {
                    id: 2, name: 'traceIdLow', type: Thrift.StructFieldType.I64,
                    value: new Thrift.I64(ref.referencedContext.toTraceId())
                },
                {
                    id: 3, name: 'traceIdHigh', type: Thrift.StructFieldType.I64,
                    value: emptyBuffer as any
                },
                {
                    id: 4, name: 'spanId', type: Thrift.StructFieldType.I64,
                    value: new Thrift.I64(ref.referencedContext.toSpanId())
                },
            ]);

            referencesList.elements.push(spanRefStruct);
        } else {
            throw new Error(`Unsupported reference type "${ref.type}"`);
        }
    });


    const tagsList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
    for (let name in data.tags) {
        const tagStruct = new Thrift.Struct([
            {
                id: 1, name: 'key', type: Thrift.StructFieldType.STRING,
                value: new Thrift.String(name)
            },
            {
                id: 2, name: 'vType', type: Thrift.StructFieldType.I32,
                value: new Thrift.I32(0) // 0 refers STRING
            },
            {
                id: 3, name: 'vStr', type: Thrift.StructFieldType.STRING,
                value: new Thrift.String(data.tags[name] + '') // cast string
            }
        ]);

        tagsList.elements.push(tagStruct);
    }


    const logsList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
    data.logs.forEach((log) => {
        const fieldsList = new Thrift.List([], Thrift.StructFieldType.STRUCT);
        for (let name in log.fields) {
            const tagStruct = new Thrift.Struct([
                {
                    id: 1, name: 'key', type: Thrift.StructFieldType.STRING,
                    value: new Thrift.String(name)
                },
                {
                    id: 2, name: 'vType', type: Thrift.StructFieldType.I32,
                    value: new Thrift.I32(0) // 0 refers STRING
                },
                {
                    id: 3, name: 'vStr', type: Thrift.StructFieldType.STRING,
                    value: new Thrift.String(log.fields[name] + '') // cast string
                }
            ]);

            fieldsList.elements.push(tagStruct);
        }

        const logStruct = new Thrift.Struct([
            {
                id: 1, name: 'timestamp', type: Thrift.StructFieldType.I64,
                value: new Thrift.I64(BigInt(log.timestamp * 1000))
            },
            {
                id: 2, name: 'fields', type: Thrift.StructFieldType.LIST,
                value: fieldsList
            }
        ]);

        logsList.elements.push(logStruct);
    });


    const spanStruct = new Thrift.Struct([
        {
            id: 1, name: 'traceIdLow', type: Thrift.StructFieldType.I64,
            value: new Thrift.I64(data.context.toTraceId())
        },
        {
            id: 2, name: 'traceIdHigh', type: Thrift.StructFieldType.I64,
            value: emptyBuffer as any
        },
        {
            id: 3, name: 'spanId', type: Thrift.StructFieldType.I64,
            value: new Thrift.I64(data.context.toSpanId())
        },
        {
            id: 4, name: 'parentSpanId', type: Thrift.StructFieldType.I64,
            value: (emptyBuffer as any)
        },
        {
            id: 5, name: 'operationName', type: Thrift.StructFieldType.STRING,
            value: new Thrift.String(data.operationName)
        },
        {
            id: 6, name: 'references', type: Thrift.StructFieldType.LIST,
            value: referencesList
        },
        {
            id: 7, name: 'flags', type: Thrift.StructFieldType.I32,
            value: new Thrift.I32(0) // TODO: No flags for now
        },
        {
            id: 8, name: 'startTime', type: Thrift.StructFieldType.I64,
            value: new Thrift.I64(BigInt(data.startTime * 1000))
        },
        {
            id: 9, name: 'duration', type: Thrift.StructFieldType.I64,
            value: new Thrift.I64((data.finishTime - data.startTime) * 1000)
        },
        {
            id: 10, name: 'tags', type: Thrift.StructFieldType.LIST,
            value: tagsList
        },
        {
            id: 11, name: 'logs', type: Thrift.StructFieldType.LIST,
            value: logsList
        }
    ]);

    return spanStruct;
}
