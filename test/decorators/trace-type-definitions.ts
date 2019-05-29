import * as stalk from '../../dist/index.node';
const { Trace, TraceAsync } = stalk.decorators.Trace;


/**
 * Just open this file in vs code, check the compiler errors.
 */
class DummyClass {
    /**
     * This should fail. Options object is expected.
     */
    @Trace()
    method1() {

    }


    /**
     * This should fail. Options object does not contain `relation` and `autoFinish` property
     */
    @Trace({})
    method2() {

    }


    /**
     * This should fail. Method should take `span` argument
     */
    @Trace({ relation: 'newTrace', autoFinish: true })
    method3() {

    }


    /**
     * This should pass.
     */
    @Trace({ relation: 'newTrace', autoFinish: true })
    method4(span: stalk.Span) {

    }


    /**
     * This should pass.
     */
    @Trace({ relation: 'childOf', autoFinish: true })
    method5(span: stalk.Span) {

    }


    /**
     * This should pass.
     */
    @Trace({ relation: 'followsFrom', autoFinish: true })
    method6(span: stalk.Span) {

    }


    /**
     * This should fail. Relation is must one of `newTrace`, `childOf`, `followsFrom` or `custom`
     */
    @Trace({ relation: 'asdasdasd', autoFinish: true })
    method7(span: stalk.Span) {

    }


    /**
     * This should fail. When relation is set to `custom`, you need to set a `handler`
     */
    @Trace({ relation: 'custom', autoFinish: true })
    method8(span: stalk.Span) {

    }


    /**
     * This should fail. `handler` function's parameter signature must be the same with original method.
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: () => {} })
    method9(span: stalk.Span) {

    }


    /**
     * This should fail. `handler` function must return partial of `opentracing.SpanOptions`
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span) => {} })
    method10(span: stalk.Span) {

    }


    /**
     * This should fail. `hello` key is not a part of `opentracing.SpanOptions`
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span) => ({ hello: 'world' }) })
    method11(span: stalk.Span) {

    }


    /**
     * This should pass.
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span) => ({ tags: {} }) })
    method12(span: stalk.Span) {

    }


    /**
     * This should fail. Handler function's argument's are different
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span) => ({}) })
    method13(span: stalk.Span, otherParam: string) {

    }


    /**
     * This should fail. Handler function's argument's are different
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span, otherParam: boolean) => ({}) })
    method14(span: stalk.Span, otherParam: string) {

    }


    /**
     * This should pass.
     */
    @Trace({ relation: 'custom', autoFinish: true, handler: (span: stalk.Span, otherParam: string) => ({}) })
    method15(span: stalk.Span, otherParamRenamed: string) {

    }
}
