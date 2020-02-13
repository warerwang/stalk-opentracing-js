import * as opentracing from 'opentracing';
import { SpanContext } from '../stalk/span-context';
export interface IFormat {
    name: string;
    inject(spanContext: SpanContext, carrier: any): void;
    extract(carrier: any): opentracing.SpanContext | null;
}
export default IFormat;
