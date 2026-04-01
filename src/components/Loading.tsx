import React from 'react';
import { motion } from 'framer-motion';

const Loading: React.FC = () => {
  return (
    <div
      className="min-h-screen bg-dots-pattern flex items-center justify-center"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="flex items-center gap-1.5" role="status">
        <span className="sr-only">Loading</span>
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="h-2 w-2 rounded-full bg-[var(--accent)]"
            animate={{ y: [0, -8, 0], opacity: [0.45, 1, 0.45] }}
            transition={{
              duration: 0.55,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: i * 0.12,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default Loading;
