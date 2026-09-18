import { useEffect, useState } from "react";

export function useCounter(
  target: number,
  active: boolean,
  duration = 2000,
) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!active) return;
    let start = 0;
    const step = target / (duration / 16);
    const id = setInterval(() => {
      start += step;
      if (start >= target) {
        setCount(target);
        clearInterval(id);
      } else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(id);
  }, [target, active, duration]);
  return count;
}