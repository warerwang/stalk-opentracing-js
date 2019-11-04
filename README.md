# stalk-opentracing-js

OpenTracing for javascript/typescript ecosystem
- Built on top of [Javascript OpenTracing API 1.0](https://github.com/opentracing/opentracing-javascript/)
- Runs on both node.js and browsers
- Comes with a tracer that can report to:
    - Zipkin HTTP API in JSON format
    - Jaeger Collector HTTP API in jaeger.thrift format over binary thrift protocol (requires modern APIs)
    - [Stalk Collector](https://github.com/dgurkaynak/stalk-collector), a dead-simple CORS-friendly server that proxies incoming spans to Jaeger, or Zipkin, or both.
- No dependencies
- Written in typescript, comes with type definitions built-in
- Typescript `@Trace` decorators offering more smooth instrumentation, which can be independently used from tracer. Because it uses `opentracing.globalTracer()`, you can use any OpenTracing-compatible tracer you want.

## Installation

`npm i stalk-opentracing --save`

## Tutorials

- [01 - Hello world to OpenTracing](./tutorials/01-opentracing-hello-world/README.md)
- [02 - Using `jaeger-client-node`](./tutorials/02-jaeger-client-node/README.md)
- [03 - Stalk Tracer](./tutorials/03-stalk-tracer/README.md)
- [04 - Sending spans to Zipkin Backend](./tutorials/04-zipkin-reporter/README.md)
- [05 - Sending spans to Jaeger Backend](./tutorials/05-jaeger-reporter/README.md)
- [06 - Stalk Collector](./tutorials/06-stalk-collector/README.md)
- [07 - Typescript Decorators](./tutorials/07-typescript-decorators/README.md)
- [08 - Context Propagation](./tutorials/08-context-propagation/README.md)

## Building

- Clone the repo
- Install dependencies `npm i`
- Build `npm run build`
- Run tests `npm t`

