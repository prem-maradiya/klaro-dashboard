import { useEffect, useRef, useState } from "react";

// Animated number count-up. `format` receives the current numeric value.
export default function CountUp({ value, duration = 900, format = (v) => Math.round(v) }) {
  const [display, setDisplay] = useState(0);
  const raf = useRef(null);
  const startVal = useRef(0);

  useEffect(() => {
    const from = startVal.current;
    const to = Number(value) || 0;
    const start = performance.now();

    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      // easeOutCubic
      const eased = 1 - Math.pow(1 - t, 3);
      const current = from + (to - from) * eased;
      setDisplay(current);
      if (t < 1) {
        raf.current = requestAnimationFrame(tick);
      } else {
        startVal.current = to;
      }
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [value, duration]);

  return <>{format(display)}</>;
}
