import { useRef } from 'react';

// prevent rerenders of children from parent updates - when passing callbacks as props
// https://github.com/samanmohamadi/use-memoized-callback
export function useMemoizedCallback(cb: Function): any {
  const data = useRef({ callback: null, handler: null });
  data.current.callback = cb;
  if (!data.current.handler) {
    data.current.handler = (...args) => data.current.callback(...args);
  }
  return data.current.handler;
}
