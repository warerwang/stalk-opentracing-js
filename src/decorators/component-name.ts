/**
 * Property key to be used for storing component name in target's prototype.
 * Symbol() not supported for ES5 :(
 */
export const ComponentNamePropertyKey = '__COMPONENT_NAME__';


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
export function ComponentName(name: string) {
    return (target: Function) => {
        target.prototype[ComponentNamePropertyKey] = name;
    };
}


/**
 * A helper function to extract component name from target instance.
 */
export function getComponentName(obj: {}) {
    return (obj as any)[ComponentNamePropertyKey];
}
