import * as opentracing from 'opentracing';


/**
 * Property key to be used for storing tags in target's prototype.
 * Symbol() not supported for ES5 :(
 */
const TagPropertyKey = 'X-Stalk-Tags';


/**
 * A class decorator that adds provided tag into class prototype,
 * so that `@Trace()` decorator can extract and use it for span's tags.
 *
 * Sample usage:
 * ```ts
 * @Tag('component', 'Player')
 * class Player {
 *      // ...
 *
 *      @Trace({...someParams})
 *      play(span) {
 *          // ...
 *          // this span's `component` tag is automatically set to `Player`
 *          // ...
 *      }
 * }
 * ```
 */
export function Tag(tag: string, value: string) {
    return (target: Function) => {
        if (!target.prototype[TagPropertyKey]) target.prototype[TagPropertyKey] = {};
        target.prototype[TagPropertyKey][tag] = value;
    };
}


export default Tag;


/**
 * A helper function to extract component name from target instance.
 */
export function getTags(obj: {}) {
    return (obj as any)[TagPropertyKey];
}


/**
 * Syntactic-sugar for common-used `component` tag.
 *
 * Sample usage:
 * ```ts
 * @Component('Player')
 * class Player {
 *      // ...
 *
 *      @Trace({...someParams})
 *      play(span) {
 *          // ...
 *          // this span's `component` tag is automatically set to `Player`
 *          // ...
 *      }
 * }
 * ```
 */
export function Component(name: string) {
    return Tag(opentracing.Tags.COMPONENT, name);
}


/**
 * A helper function to extract component name from target instance.
 */
export function getComponent(obj: {}) {
    return getTags(obj)[opentracing.Tags.COMPONENT];
}
