import { motion } from 'framer-motion';

/*
 * CauseWay Geometric Pattern Component
 * Design: Neo-Islamic Geometric Minimalism
 * Creates animated geometric decorative elements
 */

interface GeometricPatternProps {
  variant?: 'corner' | 'side' | 'full';
  className?: string;
  animated?: boolean;
}

export function GeometricPattern({ variant = 'corner', className = '', animated = true }: GeometricPatternProps) {
  const baseDelay = 0.2;
  
  if (variant === 'corner') {
    return (
      <svg 
        className={`absolute ${className}`} 
        width="200" 
        height="200" 
        viewBox="0 0 200 200" 
        fill="none"
      >
        {/* Corner frame lines */}
        <motion.path
          d="M0 60 L0 0 L60 0"
          stroke="#C9A227"
          strokeWidth="2"
          fill="none"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, delay: baseDelay }}
        />
        
        {/* Geometric squares */}
        <motion.rect
          x="20"
          y="20"
          width="30"
          height="30"
          stroke="#C9A227"
          strokeWidth="1"
          fill="none"
          initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: baseDelay + 0.3 }}
        />
        
        <motion.rect
          x="60"
          y="60"
          width="20"
          height="20"
          stroke="#768064"
          strokeWidth="1"
          fill="none"
          initial={animated ? { opacity: 0, scale: 0.8 } : { opacity: 1, scale: 1 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: baseDelay + 0.5 }}
        />
        
        {/* Diamond */}
        <motion.path
          d="M100 40 L120 60 L100 80 L80 60 Z"
          stroke="#C9A227"
          strokeWidth="1"
          fill="none"
          initial={animated ? { opacity: 0, rotate: -45 } : { opacity: 1, rotate: 0 }}
          animate={{ opacity: 1, rotate: 0 }}
          transition={{ duration: 0.6, delay: baseDelay + 0.7 }}
        />
        
        {/* Small filled squares */}
        <motion.rect
          x="140"
          y="30"
          width="12"
          height="12"
          fill="#768064"
          initial={animated ? { opacity: 0 } : { opacity: 0.6 }}
          animate={{ opacity: 0.6 }}
          transition={{ duration: 0.4, delay: baseDelay + 0.9 }}
        />
        
        <motion.rect
          x="160"
          y="50"
          width="8"
          height="8"
          fill="#C9A227"
          initial={animated ? { opacity: 0 } : { opacity: 0.8 }}
          animate={{ opacity: 0.8 }}
          transition={{ duration: 0.4, delay: baseDelay + 1.1 }}
        />
      </svg>
    );
  }

  if (variant === 'side') {
    return (
      <svg 
        className={`absolute ${className}`} 
        width="100" 
        height="400" 
        viewBox="0 0 100 400" 
        fill="none"
      >
        {/* Vertical line */}
        <motion.line
          x1="50"
          y1="0"
          x2="50"
          y2="400"
          stroke="#4C583E"
          strokeWidth="1"
          initial={animated ? { pathLength: 0 } : { pathLength: 1 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5 }}
        />
        
        {/* Diamonds along the line */}
        {[50, 150, 250, 350].map((y, i) => (
          <motion.path
            key={i}
            d={`M50 ${y - 15} L65 ${y} L50 ${y + 15} L35 ${y} Z`}
            stroke="#C9A227"
            strokeWidth="1"
            fill="none"
            initial={animated ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 + i * 0.2 }}
          />
        ))}
        
        {/* Small squares */}
        {[100, 200, 300].map((y, i) => (
          <motion.rect
            key={i}
            x="42"
            y={y - 4}
            width="16"
            height="16"
            stroke="#768064"
            strokeWidth="1"
            fill="none"
            transform={`rotate(45 50 ${y})`}
            initial={animated ? { opacity: 0 } : { opacity: 1 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.5 + i * 0.2 }}
          />
        ))}
      </svg>
    );
  }

  // Full pattern variant
  return (
    <svg 
      className={`absolute ${className}`} 
      width="400" 
      height="400" 
      viewBox="0 0 400 400" 
      fill="none"
      style={{ opacity: 0.3 }}
    >
      {/* Grid of geometric shapes */}
      {Array.from({ length: 5 }).map((_, row) =>
        Array.from({ length: 5 }).map((_, col) => {
          const x = col * 80 + 40;
          const y = row * 80 + 40;
          const isEven = (row + col) % 2 === 0;
          
          return (
            <g key={`${row}-${col}`}>
              {isEven ? (
                <motion.rect
                  x={x - 15}
                  y={y - 15}
                  width="30"
                  height="30"
                  stroke="#C9A227"
                  strokeWidth="1"
                  fill="none"
                  initial={animated ? { opacity: 0, rotate: 0 } : { opacity: 1, rotate: 45 }}
                  animate={{ opacity: 1, rotate: 45 }}
                  transition={{ duration: 0.5, delay: (row + col) * 0.1 }}
                  style={{ transformOrigin: `${x}px ${y}px` }}
                />
              ) : (
                <motion.path
                  d={`M${x} ${y - 20} L${x + 20} ${y} L${x} ${y + 20} L${x - 20} ${y} Z`}
                  stroke="#768064"
                  strokeWidth="1"
                  fill="none"
                  initial={animated ? { opacity: 0, scale: 0 } : { opacity: 1, scale: 1 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: (row + col) * 0.1 }}
                />
              )}
            </g>
          );
        })
      )}
    </svg>
  );
}

export function GoldFrame({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      {/* Top-left corner */}
      <div className="absolute top-0 left-0 w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M0 48 L0 0 L48 0" stroke="#C9A227" strokeWidth="2" fill="none" />
          <rect x="8" y="8" width="16" height="16" stroke="#C9A227" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      {/* Top-right corner */}
      <div className="absolute top-0 right-0 w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M16 0 L64 0 L64 48" stroke="#C9A227" strokeWidth="2" fill="none" />
          <rect x="40" y="8" width="16" height="16" stroke="#C9A227" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      {/* Bottom-left corner */}
      <div className="absolute bottom-0 left-0 w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M0 16 L0 64 L48 64" stroke="#C9A227" strokeWidth="2" fill="none" />
          <rect x="8" y="40" width="16" height="16" stroke="#C9A227" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      {/* Bottom-right corner */}
      <div className="absolute bottom-0 right-0 w-16 h-16">
        <svg width="64" height="64" viewBox="0 0 64 64" fill="none">
          <path d="M64 16 L64 64 L16 64" stroke="#C9A227" strokeWidth="2" fill="none" />
          <rect x="40" y="40" width="16" height="16" stroke="#C9A227" strokeWidth="1" fill="none" />
        </svg>
      </div>
      
      {children}
    </div>
  );
}
