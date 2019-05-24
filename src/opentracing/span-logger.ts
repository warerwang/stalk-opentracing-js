import Span from './span';


export enum SpanLoggerLogLevel {
    ERROR = 'error',
    WARN = ' warn',
    INFO = 'info',
    VERBOSE = 'verbose',
    DEBUG = 'debug',
    SILLY =  'silly'
};


export interface ISpanLoggerLogFields {
    level: SpanLoggerLogLevel;
    message: string;
    payload: any;
    event: string;
}


/**
 * A winston-like logger class,
 * as syntactic-sugar to opentracing's logs specification.
 */
export default class SpanLogger {
    private _span: Span;


    constructor(span: Span) {
        this._span = span;
    }


    error(message: string, payload?: any) {
        this._span.log({
            level: SpanLoggerLogLevel.ERROR, message, payload,
            // Conform opentracing conventions:
            // https://github.com/opentracing/specification/blob/master/semantic_conventions.md
            event: 'error'
        });
    }


    warn(message: string, payload?: any) {
        this._span.log({ level: SpanLoggerLogLevel.WARN, message, payload });
    }


    info(message: string, payload?: any) {
        this._span.log({ level: SpanLoggerLogLevel.INFO, message, payload });
    }


    debug(message: string, payload?: any) {
        this._span.log({ level: SpanLoggerLogLevel.DEBUG, message, payload });
    }


    silly(message: string, payload?: any) {
        this._span.log({ level: SpanLoggerLogLevel.SILLY, message, payload });
    }
}
