import BaseReporter from '../base';
import StalkSpan from '../../stalk/span';
import SpanFilterProxyReporter from './span-filter';
export declare class SpanComponentTagFilterProxyReporter extends SpanFilterProxyReporter {
    private matcher;
    constructor(targetReporter: BaseReporter, matchQuery: string);
    updateQuery(matchQuery: string): void;
    /**
     * Overriding
     */
    testSpan(span: StalkSpan): boolean;
}
export default SpanComponentTagFilterProxyReporter;
