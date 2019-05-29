const expect = require('chai').expect;
const stalk = require('../');


describe('StalkTracer behaviour tests', function() {
    describe('Span Creation & ID Generation', function() {
        let tracer;


        beforeEach(function() {
            tracer = new stalk.StalkTracer();
        });


        it('should generate new trace id when no references provided', function() {
            const spanContext1 = tracer.startSpan('operation1').context();
            const spanContext2 = tracer.startSpan('operation2').context();
            expect(spanContext1.toTraceId()).to.not.equal(spanContext2.toTraceId());
            expect(spanContext1.toSpanId()).to.not.equal(spanContext2.toSpanId());
        });


        it('should use related trace id when a reference provided', function() {
            const span1 = tracer.startSpan('operation1');
            const span2 = tracer.startSpan('operation2', { childOf: span1 });
            const spanContext1 = span1.context();
            const spanContext2 = span2.context();
            expect(spanContext1.toTraceId()).to.equal(spanContext2.toTraceId());
            expect(spanContext1.toSpanId()).to.not.equal(spanContext2.toSpanId());
        });


        it('should create span with operation name and span options', function() {
            const now = Date.now();
            const parentSpan = tracer.startSpan('parentOperation');
            const span = tracer.startSpan('operationName', {
                childOf: parentSpan,
                tags: {
                    tag1: 'value1',
                    tag2: 'value2'
                },
                startTime: now
            });
            const resultSpan = toJSON(span);
            expect(resultSpan.startTime).to.equal(now);
            expect(resultSpan.operationName).to.equal('operationName');
            expect(resultSpan.references).to.have.lengthOf(1);
            expect(resultSpan.references[0].type).to.equal(stalk.REFERENCE_CHILD_OF);
            expect(resultSpan.references[0].referencedContext.traceId).to.equal(parentSpan.context().toTraceId());
            expect(resultSpan.references[0].referencedContext.spanId).to.equal(parentSpan.context().toSpanId());
            expect(Object.keys(resultSpan.tags)).to.have.lengthOf(2);
            expect(resultSpan.tags).to.have.property('tag1', 'value1');
            expect(resultSpan.tags).to.have.property('tag2', 'value2');
        });
    });


    describe('Reporter API', function() {
        let tracer;
        let reporter;


        beforeEach(function() {
            tracer = new stalk.StalkTracer();
            reporter = new stalk.BaseReporter();
        });


        it('should not call anything when reporter accepts nothing', function() {
            let isCalled = false;
            reporter.recieveSpanCreate = () => { isCalled = true };
            reporter.recieveSpanLog = () => { isCalled = true };
            reporter.recieveSpanFinish = () => { isCalled = true };
            tracer.addReporter(reporter);
            tracer.startSpan('some operation');
            expect(isCalled).to.be.false;
        });


        it('should call `reporter.recieveSpanCreate(span)` when reporter accepts `spanCreate`', function() {
            let isCalled = false;
            reporter.accepts.spanCreate = true;
            reporter.recieveSpanCreate = () => { isCalled = true };
            tracer.addReporter(reporter);
            tracer.startSpan('some operation');
            expect(isCalled).to.be.true;
        });


        it('should call `reporter.recieveSpanLog(span)` when reporter accepts `spanLog`', function() {
            let isCalled = false;
            reporter.accepts.spanLog = true;
            reporter.recieveSpanLog = () => { isCalled = true };
            tracer.addReporter(reporter);
            const span = tracer.startSpan('some operation');
            span.logger.info('some log message');
            expect(isCalled).to.be.true;
        });


        it('should call `reporter.recieveSpanFinish(span)` when reporter accepts `spanFinish`', function() {
            let isCalled = false;
            reporter.accepts.spanFinish = true;
            reporter.recieveSpanFinish = () => { isCalled = true };
            tracer.addReporter(reporter);
            const span = tracer.startSpan('some operation');
            span.finish();
            expect(isCalled).to.be.true;
        });
    });
});


function toJSON(object) {
    return JSON.parse(JSON.stringify(object));
}
