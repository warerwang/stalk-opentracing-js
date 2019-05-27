import BaseReporter from '../base';
import BasicSpan from '../../basic/span';
import SpanFilterProxyReporter from './span-filter';
export declare class SpanComponentTagFilterProxyReporter extends SpanFilterProxyReporter {
    private matcher;
    constructor(targetReporter: BaseReporter, matchQuery: string);
    updateQuery(matchQuery: string): void;
    /**
     * Overriding
     */
    testSpan(span: BasicSpan): boolean;
}
export default SpanComponentTagFilterProxyReporter;
