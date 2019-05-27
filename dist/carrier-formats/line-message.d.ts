import { BasicSpanContext } from '../basic/span-context';
interface ILineMessage {
    payload: any;
    id: string;
    name: string;
    setId(id: string): void;
    resolve(payload?: any): void;
    reject(payload?: any): void;
}
export declare const NAME = "lineMessage";
export declare const PAYLOAD_TRACE_ID_PROPERTY_KEY = "__traceId__";
export declare const PAYLOAD_SPAN_ID_PROPERTY_KEY = "__spanId__";
export declare function inject(spanContext: BasicSpanContext, carrier: ILineMessage): void;
export declare function extract(carrier: ILineMessage): {
    traceId: string;
    spanId: string;
};
export {};
