import { useEffect, useRef } from "react";

export function Cursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        cursorRef.current.style.left = `${e.clientX}px`;
        cursorRef.current.style.top  = `${e.clientY}px`;
      }
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  return (
    <>
      <style>{`
        *, *::before, *::after { cursor: none !important; }
        .simple-cursor {
          position: fixed;
          width: 10px;
          height: 10px;
          background: #a78bfa;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          pointer-events: none;
          z-index: 99999;
          transition: transform 0.1s ease;
        }
        .simple-cursor:hover { transform: translate(-50%, -50%) scale(1.5); }
      `}</style>
      <div ref={cursorRef} className="simple-cursor" />
    </>
  );
}