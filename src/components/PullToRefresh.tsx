import React, { useState, useRef, useEffect, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface PullToRefreshProps {
  onRefresh: () => Promise<void>;
  children: ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pulling, setPulling] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const currentY = useRef(0);

  const MAX_PULL = 80;

  const handleTouchStart = (e: React.TouchEvent | React.MouseEvent) => {
    if (window.scrollY === 0) {
      startY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
      setPulling(true);
    }
  };

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!pulling || refreshing) return;
    
    currentY.current = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const diff = currentY.current - startY.current;
    
    if (diff > 0) {
      setPullDistance(Math.min(diff * 0.5, MAX_PULL));
    }
  };

  const handleTouchEnd = async () => {
    if (!pulling) return;
    setPulling(false);
    
    if (pullDistance >= MAX_PULL) {
      setRefreshing(true);
      await onRefresh();
      setRefreshing(false);
    }
    setPullDistance(0);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-full overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      onMouseLeave={handleTouchEnd}
    >
      <div 
        className="absolute top-0 left-0 w-full flex justify-center items-center overflow-hidden transition-all duration-300 z-50 pointer-events-none"
        style={{ 
          height: pulling ? `${pullDistance}px` : (refreshing ? '60px' : '0px'),
          opacity: pullDistance > 10 || refreshing ? 1 : 0
        }}
      >
        <div className={`bg-stone-800 p-2 rounded-full shadow-lg border border-stone-700 ${refreshing ? 'animate-spin' : ''}`}
             style={{ transform: `rotate(${pullDistance * 2}deg)` }}>
          <RefreshCw className="w-5 h-5 text-amber-500" />
        </div>
      </div>
      <div 
        className="transition-transform duration-300 w-full h-full"
        style={{ transform: `translateY(${pulling ? pullDistance : (refreshing ? 60 : 0)}px)` }}
      >
        {children}
      </div>
    </div>
  );
};
