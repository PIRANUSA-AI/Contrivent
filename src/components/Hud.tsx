import { useEffect, useRef } from 'react';

/** Fixed scroll-progress rail on the right edge. Updates the DOM directly to avoid re-renders. */
export default function Hud() {
  const fillRef = useRef<HTMLSpanElement>(null);
  const numberRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const progress = max > 0 ? Math.min(1, window.scrollY / max) : 0;
      if (fillRef.current) fillRef.current.style.transform = `scaleY(${progress})`;
      if (numberRef.current) numberRef.current.textContent = String(Math.round(progress * 100)).padStart(3, '0');
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, []);

  return (
    <div className="hud" aria-hidden="true">
      <span className="hud__number" ref={numberRef}>
        000
      </span>
      <span className="hud__track">
        <span className="hud__fill" ref={fillRef} />
      </span>
      <span className="hud__label">Scroll</span>
    </div>
  );
}
