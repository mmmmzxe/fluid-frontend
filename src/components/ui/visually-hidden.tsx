import React from 'react';

// Simple component to visually hide content but keep it accessible to screen readers
const VisuallyHidden: React.FC<React.HTMLAttributes<HTMLSpanElement>> = ({ children, ...props }) => {
  return (
    <span {...props} style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 }}>
      {children}
    </span>
  );
};

export default VisuallyHidden;
