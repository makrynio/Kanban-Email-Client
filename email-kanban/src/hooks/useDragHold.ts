import { useState, useCallback, useRef } from 'react';

interface UseDragHoldOptions {
  holdDelay?: number;
}

export const useDragHold = (options: UseDragHoldOptions = {}) => {
  const { holdDelay = 250 } = options;
  const [isHolding, setIsHolding] = useState(false);
  const holdTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleMouseDown = useCallback(() => {
    setIsHolding(false);
    
    // Clear any existing timeout
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }

    // Start the hold timer
    holdTimeoutRef.current = setTimeout(() => {
      setIsHolding(true);
    }, holdDelay);
  }, [holdDelay]);

  const handleMouseUp = useCallback(() => {
    setIsHolding(false);
    
    // Clear the timeout if mouse is released before hold completes
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsHolding(false);
    
    // Clear the timeout if mouse leaves element
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
      holdTimeoutRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (holdTimeoutRef.current) {
      clearTimeout(holdTimeoutRef.current);
    }
  }, []);

  return {
    isHolding,
    handleMouseDown,
    handleMouseUp,
    handleMouseLeave,
    cleanup,
  };
};
