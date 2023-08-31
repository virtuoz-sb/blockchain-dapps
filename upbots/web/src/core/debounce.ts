/** Default debounce duration (in ms) */
export const DEFAULT_DEBOUNCE_DURATION = 500;

/** Decorates a class method so that it is debounced by the specified duration */
export default function outerDecorator(duration: number) {
  return function innerDecorator(target: any, key: any, descriptor: any) {
    return {
      configurable: true,
      enumerable: descriptor.enumerable,
      get: function getter(): any {
        // Attach this function to the instance (not the class)
        Object.defineProperty(this, key, {
          configurable: true,
          enumerable: descriptor.enumerable,
          value: debounce(descriptor.value, this, duration),
        });

        return (this as any)[key];
      },
    };
  };
}

/** Debounces the specified function and returns a wrapper function */
export function debounce(method: any, that: any, duration = DEFAULT_DEBOUNCE_DURATION) {
  let timeoutId: any;

  function debounceWrapper(...args: any) {
    debounceWrapper.clear();

    timeoutId = setTimeout(() => {
      timeoutId = null;
      method.apply(that, args);
    }, duration);
  }

  debounceWrapper.clear = function () {
    if (timeoutId) {
      clearTimeout(timeoutId);
      timeoutId = null;
    }
  };

  return debounceWrapper;
}
