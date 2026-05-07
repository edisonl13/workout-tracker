import { useState, useEffect, useRef, useCallback } from 'react';
import { playTimerEndAlarm } from '../utils/audio';

interface UseTimerReturn {
  seconds: number;
  running: boolean;
  start: (totalSeconds: number) => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  skip: () => void;
}

export function useTimer(onComplete?: () => void): UseTimerReturn {
  const [seconds, setSeconds] = useState(0);
  const [running, setRunning] = useState(false);
  const totalRef = useRef(0);
  const elapsedRef = useRef(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const clear = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const start = useCallback((totalSeconds: number) => {
    clear();
    totalRef.current = totalSeconds;
    elapsedRef.current = 0;
    setSeconds(totalSeconds);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const remaining = totalRef.current - elapsedRef.current;
      if (remaining <= 0) {
        clear();
        setSeconds(0);
        setRunning(false);
        playTimerEndAlarm();
        onCompleteRef.current?.();
      } else {
        setSeconds(remaining);
      }
    }, 1000);
  }, []);

  const pause = useCallback(() => {
    clear();
    setRunning(false);
  }, []);

  const resume = useCallback(() => {
    if (seconds <= 0) return;
    setRunning(true);
    intervalRef.current = setInterval(() => {
      elapsedRef.current += 1;
      const remaining = totalRef.current - elapsedRef.current;
      if (remaining <= 0) {
        clear();
        setSeconds(0);
        setRunning(false);
        playTimerEndAlarm();
        onCompleteRef.current?.();
      } else {
        setSeconds(remaining);
      }
    }, 1000);
  }, [seconds]);

  const reset = useCallback(() => {
    clear();
    setSeconds(0);
    setRunning(false);
    totalRef.current = 0;
    elapsedRef.current = 0;
  }, []);

  const skip = useCallback(() => {
    clear();
    setSeconds(0);
    setRunning(false);
    onCompleteRef.current?.();
  }, []);

  useEffect(() => clear, []);

  return { seconds, running, start, pause, resume, reset, skip };
}
