import * as opentracing from '../../opentracing/index';
import BaseReporter from '../base';
import StalkSpan from '../../stalk/span';
import SpanFilterProxyReporter from './span-filter';
import DebugNamespaceMatcher from '../../utils/debug-namespace-matcher';


export class SpanComponentTagFilterProxyReporter extends SpanFilterProxyReporter {
    private matcher: DebugNamespaceMatcher;


    constructor(targetReporter: BaseReporter, matchQuery: string) {
        super(targetReporter);
        this.matcher = new DebugNamespaceMatcher(matchQuery);
    }


    updateQuery(matchQuery: string) {
        this.matcher.updateQuery(matchQuery);
    }


    /**
     * Overriding
     */
    testSpan(span: StalkSpan) {
        return this.matcher.test(span.getTag(opentracing.Tags.COMPONENT));
    }
}


export default SpanComponentTagFilterProxyReporter;
