import * as opentracing from './opentracing/index';


console.log('hello world', opentracing);
(window as any).opentracing = opentracing
