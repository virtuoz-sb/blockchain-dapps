import { useCallback, useEffect, useRef, useState, useMemo } from 'react';

export type UseTimeoutFnReturn = [() => boolean | null, () => void, () => void];

export default function useTimeoutFn(fn: Function, ms: number = 0): UseTimeoutFnReturn {
  const ready = useRef<boolean | null>(false);
  const timeout = useRef<ReturnType<typeof setTimeout>>();
  const callback = useRef(fn);

  const isReady = useCallback(() => ready.current, []);

  const set = useCallback(() => {
    ready.current = false;
    timeout.current && clearTimeout(timeout.current);

    timeout.current = setTimeout(() => {
      ready.current = true;
      callback.current();
    }, ms);
  }, [ms]);

  const clear = useCallback(() => {
    ready.current = null;
    timeout.current && clearTimeout(timeout.current);
  }, []);

  // update ref when function changes
  useEffect(() => {
    callback.current = fn;
  }, [fn]);

  // set on mount, clear on unmount
  useEffect(() => {
    set();

    return clear;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ms]);

  return [isReady, clear, set];
}

//adapted from https://github.com/alexkhismatulin/react-use-count-down
//<h1 id="time-left">{(timeLeft / 1000).toFixed(2)}</h1>
export const useCountDown = (
  callback?: () => any,
  timeToCount: number = 5 * 1000,
  interval: number = 1000
): readonly [number, { start: (ttc?: any) => void; pause: () => void; resume: () => void; reset: () => void }] => {
  const [timeLeft, setTimeLeft] = useState(0);
  const timer = useRef<any>({});
  const savedCallback = useRef<() => any>();

  const run = useCallback(
    ts => {
      if (!timer.current.started) {
        timer.current.started = ts;
        timer.current.lastInterval = ts;
      }

      const localInterval = Math.min(interval, timer.current.timeLeft || Infinity);
      if (ts - timer.current.lastInterval >= localInterval) {
        timer.current.lastInterval += localInterval;
        setTimeLeft(timeLeft => {
          timer.current.timeLeft = timeLeft - localInterval;
          return timer.current.timeLeft;
        });
      }

      if (ts - timer.current.started < timer.current.timeToCount) {
        timer.current.requestId = window.requestAnimationFrame(run);
      } else {
        timer.current = {};
        setTimeLeft(0);
        if (savedCallback.current) {
          savedCallback.current();
        }
        //console.log('DONE');
      }
    },
    [interval]
  );

  const start = useCallback(
    (ttc?: any) => {
      window.cancelAnimationFrame(timer.current.requestId);

      const newTimeToCount = ttc !== undefined ? ttc : timeToCount;
      timer.current.started = null;
      timer.current.lastInterval = null;
      timer.current.timeToCount = newTimeToCount;
      timer.current.requestId = window.requestAnimationFrame(run);

      setTimeLeft(newTimeToCount);
    },
    [run, timeToCount]
  );

  const pause = useCallback(() => {
    window.cancelAnimationFrame(timer.current.requestId);
    timer.current.started = null;
    timer.current.lastInterval = null;
    timer.current.timeToCount = timer.current.timeLeft;
  }, []);

  const resume = useCallback(() => {
    if (!timer.current.started && timer.current.timeLeft > 0) {
      window.cancelAnimationFrame(timer.current.requestId);
      timer.current.requestId = window.requestAnimationFrame(run);
    }
  }, [run]);

  const reset = useCallback(() => {
    if (timer.current.timeLeft) {
      window.cancelAnimationFrame(timer.current.requestId);
      timer.current = {};
      setTimeLeft(0);
    }
  }, []);
  useEffect(() => {
    savedCallback.current = callback;
  });

  const actions = useMemo(() => ({ start, pause, resume, reset }), [pause, reset, resume, start]);

  useEffect(() => {
    return () => window.cancelAnimationFrame(timer.current.requestId);
  }, []);

  return [timeLeft, actions] as const;
};
