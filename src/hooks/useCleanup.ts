import { useEffect, useRef } from 'react';

export const useCleanup = () => {
  const cleanupRef = useRef<(() => void)[]>([]);

  const addCleanup = (cleanup: () => void) => {
    cleanupRef.current.push(cleanup);
  };

  useEffect(() => {
    return () => {
      cleanupRef.current.forEach(cleanup => cleanup());
      cleanupRef.current = [];
    };
  }, []);

  return { addCleanup };
}; 