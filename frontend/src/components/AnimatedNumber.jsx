import React, { useState, useEffect, useRef } from "react";

export default function AnimatedNumber({ value, prefix = "", suffix = "", duration = 800 }) {
  const [display, setDisplay] = useState(0);
  const prevValRef = useRef(0);
  const elementRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Trigger animation when component enters the viewport
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.1 }
    );
    if (elementRef.current) {
      observer.observe(elementRef.current);
    }
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;

    let start = prevValRef.current;
    const end = parseFloat(value) || 0;
    if (start === end) {
      setDisplay(end);
      return;
    }

    const startTime = performance.now();

    const animate = (currentTime) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing function (easeOutQuad)
      const easeProgress = progress * (2 - progress);
      const current = start + (end - start) * easeProgress;
      
      setDisplay(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplay(end);
        prevValRef.current = end;
      }
    };

    requestAnimationFrame(animate);
  }, [value, duration, visible]);

  const formatted = display.toLocaleString('en-IN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: display % 1 === 0 ? 0 : 2,
  });

  return (
    <span ref={elementRef} className="font-mono-num">
      {prefix}{formatted}{suffix}
    </span>
  );
}
