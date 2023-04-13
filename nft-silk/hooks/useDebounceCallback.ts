import { useEffect, useCallback, useRef } from 'react';
import { debounce } from 'lodash-es';

export function useCallbackRef<T extends (...args: any[]) => any>(
  fn: T | undefined,
  deps: React.DependencyList = []
): T {
  const ref = useRef(fn);

  useEffect(() => {
    ref.current = fn;
  });

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(((...args) => ref.current?.(...args)) as T, deps);
}

// callback debounce
function useDebounceCallback(
  callback: Function,
  delay: number = 500,
  opts: { leading: boolean; trailing: boolean } = { leading: false, trailing: true }
) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    debounce((...args) => callbackRef.current(...args), delay, opts),
    []
  );
}

export default useDebounceCallback;
