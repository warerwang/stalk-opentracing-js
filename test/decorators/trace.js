const chai = require('chai');
const expect = chai.expect;
const { opentracing, stalk } = require('../../');
const { Trace, TraceAsync } = stalk.decorators.Trace;
const { Component } = stalk.decorators.Tag;



describe('Trace Decorator', function() {
    let globalTracerBackup;
    let tracer;


    before(function() {
        globalTracerBackup = opentracing.globalTracer();
        tracer = new stalk.Tracer();
        opentracing.initGlobalTracer(tracer);
    });


    after(function() {
        opentracing.initGlobalTracer(globalTracerBackup);
    });


    it('should use global tracer and create a span with operation name and set tags from @Component() decorator', function() {
        const DummyClass = class {
            method(span) {
                return span;
            }
        };
        Component('DummyClass')(DummyClass);
        decorateTrace(DummyClass.prototype, 'method', {
            operationName: 'some operation',
            relation: 'newTrace',
            autoFinish: true
        });
        const ins = new DummyClass();
        const span = ins.method();
        const resultSpan = toJSON(span);
        expect(span.tracer()).to.equal(tracer);
        expect(resultSpan.operationName).to.equal('some operation');
        expect(Object.keys(resultSpan.tags)).to.have.lengthOf(1);
        expect(resultSpan.tags[opentracing.Tags.COMPONENT]).to.equal('DummyClass');
    });


    it('should create spans with correct relations', function() {
        let spanParent, spanChild, spanFollows;
        const DummyClass = class {
            methodParent(span) {
                spanParent = span;
                this.methodChild(span);
            }
            methodChild(span) {
                spanChild = span;
                this.methodFollows(span);
            }
            methodFollows(span) {
                spanFollows = span;
            }
        };
        decorateTrace(DummyClass.prototype, 'methodParent', { relation: 'newTrace', autoFinish: true });
        decorateTrace(DummyClass.prototype, 'methodChild', { relation: 'childOf', autoFinish: true });
        decorateTrace(DummyClass.prototype, 'methodFollows', { relation: 'followsFrom', autoFinish: true });
        const ins = new DummyClass();
        ins.methodParent();

        const resultSpanParent = toJSON(spanParent);
        const resultSpanChild = toJSON(spanChild);
        const resultSpanFollows = toJSON(spanFollows);

        expect(resultSpanParent.references).to.have.lengthOf(0);
        expect(resultSpanChild.references).to.have.lengthOf(1);
        expect(resultSpanChild.references[0].type).to.equal(opentracing.REFERENCE_CHILD_OF);
        expect(resultSpanChild.references[0].referencedContext.traceId).to.equal(resultSpanParent.context.traceId);
        expect(resultSpanChild.references[0].referencedContext.spanId).to.equal(resultSpanParent.context.spanId);
        expect(resultSpanFollows.references).to.have.lengthOf(1);
        expect(resultSpanFollows.references[0].type).to.equal(opentracing.REFERENCE_FOLLOWS_FROM);
        expect(resultSpanFollows.references[0].referencedContext.traceId).to.equal(resultSpanChild.context.traceId);
        expect(resultSpanFollows.references[0].referencedContext.spanId).to.equal(resultSpanChild.context.spanId);
    });


    it('should autoFinish when method is sync', function() {
        const DummyClass = class {
            method(span) {
                for (let i = 0; i < 10000; i++) { Math.random(); }
                return span;
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();
        const span = ins.method();
        const now = Date.now();
        expect(toJSON(span).finishTime).to.be.below(now + 1);
    });


    it('should autoFinish when method returns promise', async function() {
        const DummyClass = class {
            method(span) {
                return sleep(200).then(() => span);
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();
        const span = await ins.method();
        const now = Date.now();
        expect(toJSON(span).finishTime).to.be.below(now + 1);
    });


    it('should autoFinish when method is async', async function() {
        const DummyClass = class {
            async method(span) {
                await sleep(200);
                return span;
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();
        const span = await ins.method();
        const now = Date.now();
        expect(toJSON(span).finishTime).to.be.below(now + 1);
    });


    it('should not finish the span when autoFinish is false', async function() {
        const DummyClass = class {
            async method(span) {
                await sleep(200);
                return span;
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: false });
        const ins = new DummyClass();
        const span = await ins.method();
        expect(toJSON(span).finishTime).to.equal(undefined);
    });


    it('should autoFinish when method throws an error', function() {
        let span;
        const DummyClass = class {
            method(span_) {
                span = span_;
                for (let i = 0; i < 10000; i++) {
                    Math.random();
                    if (i == 500) throw new Error('Ooops');
                }
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();
        expect(ins.method.bind(ins)).to.throw(Error);
        const now = Date.now();
        const resultSpan = toJSON(span);
        expect(Object.keys(resultSpan.tags)).to.have.lengthOf(1);
        expect(resultSpan.tags.error).to.equal(true);
        expect(resultSpan.logs).to.have.lengthOf(1);
        expect(resultSpan.logs[0].fields.level).to.equal('error');
        expect(resultSpan.finishTime).to.be.below(now + 1);
    });


    it('should autoFinish when method\'s returned Promise is rejected', async function() {
        let span;
        const DummyClass = class {
            method(span_) {
                span = span_;
                return sleep(200).then(() => {
                    throw new Error('Ooops');
                });
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();

        try {
            await ins.method();
            throw new Error('Method is resolved!')
        } catch (err) {
            // expect().eventually.to.throw(Error);
            const now = Date.now();
            const resultSpan = toJSON(span);
            expect(err.message).to.equal('Ooops');
            expect(Object.keys(resultSpan.tags)).to.have.lengthOf(1);
            expect(resultSpan.tags.error).to.equal(true);
            expect(resultSpan.logs).to.have.lengthOf(1);
            expect(resultSpan.logs[0].fields.level).to.equal('error');
            expect(resultSpan.logs[0].fields.message).to.equal('Ooops');
            expect(resultSpan.finishTime).to.be.below(now + 1);
        }
    });


    it('should autoFinish when ASYNC method throws an error', async function() {
        let span;
        const DummyClass = class {
            async method(span_) {
                span = span_;
                await sleep(200);
                throw new Error('Ooops');
            }
        };
        decorateTrace(DummyClass.prototype, 'method', { relation: 'newTrace', autoFinish: true });
        const ins = new DummyClass();

        try {
            await ins.method();
            throw new Error('Method is resolved!')
        } catch (err) {
            // expect().eventually.to.throw(Error);
            const now = Date.now();
            const resultSpan = toJSON(span);
            expect(err.message).to.equal('Ooops');
            expect(Object.keys(resultSpan.tags)).to.have.lengthOf(1);
            expect(resultSpan.tags.error).to.equal(true);
            expect(resultSpan.logs).to.have.lengthOf(1);
            expect(resultSpan.logs[0].fields.level).to.equal('error');
            expect(resultSpan.logs[0].fields.message).to.equal('Ooops');
            expect(resultSpan.finishTime).to.be.below(now + 1);
        }
    });
});


function decorateTrace(prototypeObject, methodName, traceOptions) {
    const descriptor = Object.getOwnPropertyDescriptor(prototypeObject, methodName);
    const newDescriptor = Trace(traceOptions)(prototypeObject, methodName, descriptor);
    Object.defineProperty(prototypeObject, methodName, newDescriptor);
}


function toJSON(object) {
    return JSON.parse(JSON.stringify(object));
}


async function sleep(duration) {
    return new Promise(resolve => setTimeout(resolve, duration));
}

