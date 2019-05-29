import * as opentracing from '../opentracing/index';
import Span from './span';
import SpanContext from './span-context';
import BaseReporter from '../reporters/base';
import * as shortid from 'shortid';
import * as PlainObjectCarrierFormat from '../carrier-formats/plain-object';


/**
 * StalkTracer inherits opentracing's noop class, with the
 * implementation of data-structure stuff and reporter interface.
 * Please note that this StalkTracer does not record any spans, hoping
 * to be garbage-collected by js engine. The job of recording and reporting
 * spans is left to reporters.
 */
export class Tracer extends opentracing.Tracer {
    /**
     * Reporter instances to report when a span is created.
     */
    protected _reporters: BaseReporter[] = [];
    get reporters() { return this._reporters; }


    /**
     * Adds a reporter.
     */
    addReporter(reporter: BaseReporter) {
        this._reporters.push(reporter);
    }


    /**
     * Removes a reporter.
     */
    removeReporter(reporter: BaseReporter) {
        const index = this._reporters.indexOf(reporter);
        if (index > -1) {
            const reporter = this._reporters[index];
            this._reporters.splice(index, 1);
            reporter.close();
            return true;
        }
        return false;
    }


    /**
     * Overridden just for returning span's type.
     */
    startSpan(name: string, options: opentracing.SpanOptions = {}): Span {
        return super.startSpan(name, options) as Span;
    }


    ///////////////////////////////////////////
    // Override opentracing internal methods //
    ///////////////////////////////////////////


    /**
     * Main span creating method.
     */
    protected _startSpan(name: string, fields: opentracing.SpanOptions) {
        // Extract trace id from first reference.
        // If it doesn't exists, start a new trace
        const firstRef = fields.references ? fields.references[0] : null;
        const firstRefContext = firstRef ? firstRef.referencedContext() as SpanContext: null;
        const traceId = firstRefContext ? firstRefContext.toTraceId() : shortid.generate();
        const spanId = shortid.generate();
        const spanContext = new SpanContext(traceId, spanId);
        if (firstRefContext && firstRefContext.baggageItems) spanContext.addBaggageItems(firstRefContext.baggageItems);

        // Create a span instance from `this.spanClass` class.
        const span = new Span(this, spanContext);
        span.setOperationName(name);
        if (fields.tags) span.addTags(fields.tags);

        if (fields.references) {
            for (const ref of fields.references) {
                span.addReference(ref);
            }
        }

        span.start(fields.startTime);

        // Not cool bro
        this._reporters.forEach((reporter) => {
            if (reporter.accepts.spanCreate) {
                reporter.recieveSpanCreate(span);
            }
        });

        return span;
    }


    /**
     * Tries to inject given span context into carrier. This method should not throw an error.
     */
    protected _inject(spanContext: SpanContext, format: string, carrier: any) {
        switch (format) {
            case PlainObjectCarrierFormat.NAME:
                return PlainObjectCarrierFormat.inject(spanContext, carrier);
            default:
                console.error(`Could not inject context into carrier, unknown format "${format}"`, carrier);
        }
    }


    /**
     * Tries to extract span context from any supported carrier. This method should not
     * throw an error, return nil instead. Creating a new trace is not our responsibility.
     */
    protected _extract(format: string, carrier: any): opentracing.SpanContext | null {
        let traceId: string;
        let spanId: string;

        switch (format) {
            case PlainObjectCarrierFormat.NAME: {
                const plainObject = PlainObjectCarrierFormat.extract(carrier);
                traceId = plainObject.traceId;
                spanId = plainObject.spanId;
                break;
            }
            default: {
                console.error(`Could not extract context from carrier, unknown carrier format "${format}"`, carrier);
            }
        }

        // If traceId or spanId missing, return null
        if (!traceId || !spanId) return;

        return new SpanContext(traceId, spanId);
    }
}

export default Tracer;
