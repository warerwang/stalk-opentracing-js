import BaseReporter from '../base';
import Span from '../../stalk/span';
import SpanFilterProxyReporter from './span-filter';
export declare class SpanComponentTagFilterProxyReporter extends SpanFilterProxyReporter {
    private matcher;
    constructor(targetReporter: BaseReporter, matchQuery: string);
    updateQuery(matchQuery: string): void;
    /**
     * Overriding
     */
    testSpan(span: Span): boolean;
}
export default SpanComponentTagFilterProxyReporter;
