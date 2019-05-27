/**
 * Property key to be used for storing component name in target's prototype.
 * Symbol() not supported for ES5 :(
 */
export declare const ComponentNamePropertyKey = "__COMPONENT_NAME__";
/**
 * A class decorator that adds provided name into class prototype,
 * so that `@Trace()` decorator can extract and use it for span's `component` tag.
 *
 * Sample usage:
 * ```ts
 * @ComponentName('Player')
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
export declare function ComponentName(name: string): (target: Function) => void;
export default ComponentName;
/**
 * A helper function to extract component name from target instance.
 */
export declare function getComponentName(obj: {}): any;
