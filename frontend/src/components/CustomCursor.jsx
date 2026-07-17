import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CustomCursor.css';

export default function CustomCursor() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [state, setState] = useState('default'); // 'default' | 'hover' | 'view'

  useEffect(() => {
    const onMove = (e) => setPos({ x: e.clientX, y: e.clientY });

    const onOver = (e) => {
      const el = e.target.closest('[data-cursor]') || e.target;
      const cursorAttr = el.getAttribute?.('data-cursor')
        || el.closest?.('[data-cursor]')?.getAttribute('data-cursor');

      if (cursorAttr === 'view') {
        setState('view');
      } else if (
        e.target.tagName === 'A' ||
        e.target.tagName === 'BUTTON' ||
        e.target.closest('a') ||
        e.target.closest('button')
      ) {
        setState('hover');
      } else {
        setState('default');
      }
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseover', onOver);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseover', onOver);
    };
  }, []);

  const isHover = state === 'hover';
  const isView = state === 'view';

  return (
    <>
      {/* Trailing dot */}
      <motion.div
        className="cursor-dot"
        animate={{
          x: pos.x - 4,
          y: pos.y - 4,
          opacity: isView ? 0 : 1,
          scale: isHover ? 0 : 1,
        }}
        transition={{ type: 'tween', ease: 'backOut', duration: 0.08 }}
      />

      {/* Morphing ring */}
      <motion.div
        className="cursor-ring"
        animate={{
          x: pos.x - (isView ? 48 : 18),
          y: pos.y - (isView ? 48 : 18),
          width: isView ? 96 : isHover ? 50 : 36,
          height: isView ? 96 : isHover ? 50 : 36,
          backgroundColor: isView
            ? 'rgba(28, 25, 23, 0.85)'
            : isHover
              ? 'rgba(180, 134, 0, 0.12)'
              : 'transparent',
          borderColor: isView
            ? 'transparent'
            : isHover
              ? 'rgba(180, 134, 0, 0.5)'
              : 'rgba(28, 25, 23, 0.25)',
        }}
        transition={{ type: 'spring', stiffness: 200, damping: 18, mass: 0.5 }}
      >
        <motion.span
          className="cursor-label"
          animate={{
            opacity: isView ? 1 : 0,
            color: isView ? '#fff' : 'var(--text-main)',
          }}
          transition={{ duration: 0.2 }}
        >
          VIEW
        </motion.span>
      </motion.div>
    </>
  );
}

