const expect = require('chai').expect;
const { opentracing, stalk } = require('../');


describe('StalkSpan behaviour tests', function() {
    let tracer = new stalk.Tracer();
    let spanContext = new stalk.SpanContext('xxxTraceIdxxx', 'xxxSpanIdxxx');
    let span;


    beforeEach(function() {
        span = new stalk.Span(tracer, spanContext);
    });


    it('should return tracer instance when `.tracer()` called', function() {
        expect(span.tracer()).to.equal(tracer);
    });


    it('should return context instance when `.context()` called', function() {
        expect(span.context()).to.equal(spanContext);
    });

    it('should set current time when `.start()` called without any parameters', function() {
        const now = Date.now();
        span.start();
        // Start time can be equal to now, or above. We're extracting 1 ms to cover both.
        expect(toJSON(span).startTime).to.be.above(now - 1);
    });

    it('should set specific time when `.start(specificTime)` called', function() {
        const specificTime = Date.now() - 1000;
        span.start(specificTime);
        expect(toJSON(span).startTime).to.equal(specificTime);
    });

    it('should add reference when `.addReference(ref)` called', function() {
        let parentContext = new stalk.SpanContext('xxxTraceIdxxx', 'xxxParentSpanIdxxx');
        const ref = new opentracing.Reference(stalk.REFERENCE_CHILD_OF, parentContext);
        span.addReference(ref);
        const resultRefs = toJSON(span).references;
        expect(resultRefs).to.have.lengthOf(1);
        expect(resultRefs[0].type).to.equal(stalk.REFERENCE_CHILD_OF);
        expect(resultRefs[0].referencedContext.traceId).to.equal('xxxTraceIdxxx');
        expect(resultRefs[0].referencedContext.spanId).to.equal('xxxParentSpanIdxxx');
    });

    it('should set operation name when `.setOperationName(name)` called', function() {
        span.setOperationName('Working hard, you know');
        expect(toJSON(span).operationName).to.equal('Working hard, you know');
    });

    it('should add tags over the current ones when `.addTags(tags)` called', function() {
        span.setTag('tag1', 'value1');
        span.addTags({ tag2: 'value2', tag3: 'value3' });
        span.addTags({ tag3: 'value3-override' });
        const resultTags = toJSON(span).tags;
        expect(Object.keys(resultTags)).to.have.lengthOf(3);
        expect(resultTags).to.have.property('tag1', 'value1');
        expect(resultTags).to.have.property('tag2', 'value2');
        expect(resultTags).to.have.property('tag3', 'value3-override');
    });

    it('should get specific tag when `.getTag(tag)` called', function() {
        span.addTags({ tag1: 'value1', tag2: 'value2' });
        expect(span.getTag('tag1')).to.equal('value1');
        expect(span.getTag('tag2')).to.equal('value2');
        expect(span.getTag('non-existing-tag')).to.equal(undefined);
    });

    it('should set current time when `.finish()` called without any parameters', function() {
        const now = Date.now();
        span.finish();
        // Finish time can be equal to now, or above. We're extracting 1 ms to cover both.
        expect(toJSON(span).finishTime).to.be.above(now - 1);
    });

    it('should set specific time when `.finish(specificTime)` called', function() {
        const specificTime = Date.now() - 1000;
        span.finish(specificTime);
        expect(toJSON(span).finishTime).to.equal(specificTime);
    });
});


function toJSON(object) {
    return JSON.parse(JSON.stringify(object));
}
