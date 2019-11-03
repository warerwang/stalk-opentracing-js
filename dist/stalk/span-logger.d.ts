import Span from '../opentracing/span';
export declare enum SpanLoggerLogLevel {
    ERROR = "error",
    WARN = "warn",
    INFO = "info",
    VERBOSE = "verbose",
    DEBUG = "debug",
    SILLY = "silly"
}
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
    private _span;
    constructor(span: Span);
    error(message: string, ...payload: any[]): void;
    warn(message: string, ...payload: any[]): void;
    info(message: string, ...payload: any[]): void;
    debug(message: string, ...payload: any[]): void;
    silly(message: string, ...payload: any[]): void;
}
