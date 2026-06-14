import { useEffect, useRef, useState } from "react";

function parseStat(value: string) {
  const number = Number(value.replace(/[^0-9.]/g, ""));
  const prefix = value.match(/^[^0-9]*/)?.[0] ?? "";
  const suffix = value.match(/[^0-9.]*$/)?.[0] ?? "";

  return {
    number: Number.isFinite(number) ? number : 0,
    prefix,
    suffix,
  };
}

export function CountUpStat({
  value,
  className = "",
  immediate = false,
  delay = 0,
}: {
  value: string;
  className?: string;
  immediate?: boolean;
  delay?: number;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const [display, setDisplay] = useState("0");

  useEffect(() => {
    const { number, prefix, suffix } = parseStat(value);
    const node = ref.current;
    if (!node || number === 0) {
      setDisplay(value);
      return;
    }

    const duration = 1100;
    let frame = 0;
    let start = 0;
    let hasRun = false;

    const run = (timestamp: number) => {
      if (!start) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(number * eased);
      setDisplay(`${prefix}${current.toLocaleString()}${suffix}`);

      if (progress < 1) {
        frame = requestAnimationFrame(run);
      }
    };

    const startAnimation = () => {
      if (hasRun) return;
      hasRun = true;
      frame = requestAnimationFrame(run);
    };

    if (immediate) {
      const timer = window.setTimeout(startAnimation, delay);
      return () => {
        window.clearTimeout(timer);
        if (frame) cancelAnimationFrame(frame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) startAnimation();
      },
      { threshold: 0.35 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value, immediate, delay]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
