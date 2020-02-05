# 07-typescript-decorators

Stalk is written in typescript, so it comes with type definitions, along with some class and method decorators that deal with span creation, relation handling and finishing them.

At first, you need to enable `experimentalDecorators` flag in your `tsconfig.json` file.

```json
{
    "compilerOptions": {
        "experimentalDecorators": true
    }
}
```

Let's require our decorators:

```ts
import { opentracing, stalk } from 'stalk-opentracing';

const { Tag, Component } = stalk.decorators.Tag;
const { Trace, TraceAsync } = stalk.decorators.Trace;
```

Since decorators has to be used on class & method definitions, we need to
wrap our functions within a class. (You are not forced to use inheritance or any
other OOP-paradigm though.)

```ts
class Demo {
    main() {
        // ...
    }

    printHello() {
        // ...
    }
}
```

## `@Tag(key, value)`

It's a class decorator that adds a tag to every created span under this class and set it `value`.


```ts
@Tag('component', 'Demo')
@Tag('component-version', '0.1.0')
class Demo {
    // ...
}
```

## `@Component(name)`

Since `component` tag is commonly used, it's a syntantic-sugar over `@Tag` decorator.

```ts
@Component('Demo')
class Demo {
    // ...
}
```

## `@Trace({ operationName, relation?, handler?, autoFinish })`

This is method decorator that wraps the original method and deals with span creation, setting relations and finishing it.

**There is only one single rule about using `@Trace` decorators:**

> Every `@Trace`d method should take a `opentracing.Span` instance as **its first parameter**. If it does not, typescript will give you compiler error about your method's signature.

```ts
class Demo {
    @Trace({operationName: 'main', relation: 'newTrace', autoFinish: true})
    async main(span: opentracing.Span) {
        // <--- `span` is automatically generated which starts a new trace
        span.log({ message: 'Will wait 1 second' });
        await sleep(1000);
        await this.printHello(span);
    }

    // ...
}
```

Here, `@Trace` decorator wraps the original `main` method. When the decorated method is called:
- Since it's relation type is set to `newTrace`, a root span is automatically created & started from global tracer `opentracing.globalTracer()`
- Set it's operation name as `main`
- Checks its class whether decorated by `@Tag`, if so adds them to span tags
- Original method is called by passing the just-created span as `span` argument
- Since `autoFinish` is set to `true`, return value of the original method is checked
    - If it's promise-like object, wait until it settles, automatically finishes the span
    - If it's not promise-like, immidiately finish the span as it returns something
- If `autoFinish` is set `false`, it's your responsibility to finish your span by calling `span.finish()`. If you're working with callbacks, you probably want to set `autoFinish: false`
- If original method throws an error, or returning promise is failed, decorator will catch this error, logs it to current span and set its `error` tag to true

`@Trace` decorator takes 3 options:

| option | description |
| - | - |
| `operationName` | A string that specifies span's operation name. It can be omitted, function's name will be used by default. |
| `relation` | Can be one of: `newTrace`, `childOf` and `followsFrom`. Of omitted, `handler` options must be set to a function that takes the same parameters as original method, and it must create & start and return a `opentracing.Span` instance. |
| **`autoFinish`** | A boolean that enables auto finishing span feature. If this is set to `false`, it's your responsibility to call `span.finish()`. It's required. |

Our `main` function now takes a span instance as first argument as the only rule dictates. However it's relation type is set to `newTrace`, so it (decorated method) does not need to be called by passing a parent span. A new span is automatically generated and it will be automatically passed to method by the decorator. To indicate that, you need to explicitly pass `null` as it's span argument when calling the decorated method.

```ts
const demo = new Demo();

demo
    .main(null) // <--- Pass `null` as the first argument
    .then(() => { /*...*/ })
    .catch((err: Error) => { /*...*/ });
```

If method's relation type is `childOf` or `followFrom`, you need to pass the span of the caller, like we did when calling `printHello` method:

```ts
class Demo {
    @Trace({ /*...*/ })
    async main(span: opentracing.Span) {
        // ...
        await this.printHello(span); // <--- Calling with current `span`
        // ...
    }

    @Trace({ relation: 'childOf', autoFinish: true })
    async printHello(span: opentracing.Span) {
        // <--- Here `span` is automatically created as a child of
        //      `main` method's span. Their trace id is the same.
        // ...
    }
}
```

## `@TraceAsync({ operationName, relation })`

`@TraceAsync` decorator is a syntactic-sugar for `async` methods. Therefore you can also omit `autoFinish` option. So we can re-write our methods like:

```ts
@Component('Demo')
class Demo {
    @TraceAsync({ relation: 'newTrace' })
    async main(span: opentracing.Span) {
        span.log({ message: 'Will wait 1 second' });
        await sleep(1000);
        await this.printHello(span);
    }

    @TraceAsync({ relation: 'childOf' })
    async printHello(span: opentracing.Span) {
        span.log({ message: 'Will wait 500ms more, because I can' });
        await sleep(500);
        console.log('Hello world!');
    }
}
```

## Running demo

- Start `stalk-collector` along with `jaeger-collector`
- Go to tutorial folder `cd ./tutorials/07-typescript-decorators`
- Open already build version in the browser `open dist/index.html`
- To build this typescript demo `npm i && npm run build`

## Next

[Tutorial 08 - Context Propagation](../08-context-propagation)
