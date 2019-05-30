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
export declare function Tag(tag: string, value: string): (target: Function) => void;
export default Tag;
/**
 * A helper function to extract component name from target instance.
 */
export declare function getTags(obj: {}): any;
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
export declare function Component(name: string): (target: Function) => void;
/**
 * A helper function to extract component name from target instance.
 */
export declare function getComponent(obj: {}): any;
