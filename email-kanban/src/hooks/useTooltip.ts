import { useState, useEffect, useRef, useCallback } from 'react';

interface TooltipPosition {
  x: number;
  y: number;
}

interface UseTooltipOptions {
  delay?: number;
  offset?: number;
  padding?: number;
}

export const useTooltip = (options: UseTooltipOptions = {}) => {
  const { delay = 1000, offset = 10, padding = 20 } = options;
  
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({ x: 0, y: 0 });
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipRef = useRef<HTMLDivElement | null>(null);
  const lastMousePosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const positionUpdateRef = useRef<NodeJS.Timeout | null>(null);

  const calculatePosition = useCallback((mouseX: number, mouseY: number, tooltipWidth?: number, tooltipHeight?: number) => {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    
    // Use provided dimensions or estimate if not available
    const estimatedWidth = tooltipWidth || 400; // Larger default width
    const estimatedHeight = tooltipHeight || 300; // Larger default height

    let x = mouseX + offset;
    let y = mouseY + offset;

    // Adjust horizontal position if tooltip would go off-screen
    if (x + estimatedWidth + padding > windowWidth) {
      x = mouseX - estimatedWidth - offset;
    }
    
    // Ensure tooltip doesn't go off the left edge
    if (x < padding) {
      x = padding;
    }

    // Adjust vertical position if tooltip would go off-screen
    if (y + estimatedHeight + padding > windowHeight) {
      y = mouseY - estimatedHeight - offset;
    }
    
    // Ensure tooltip doesn't go off the top edge
    if (y < padding) {
      y = padding;
    }

    return { x, y };
  }, [offset, padding]);

  const handleMouseEnter = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    
    // Update last mouse position
    lastMousePosition.current = { x: clientX, y: clientY };
    
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set a new timeout to show the tooltip after delay
    timeoutRef.current = setTimeout(() => {
      // Use the most recent mouse position
      const currentPos = lastMousePosition.current;
      const newPosition = calculatePosition(currentPos.x, currentPos.y);
      setPosition(newPosition);
      setIsVisible(true);
    }, delay);
  }, [delay, calculatePosition]);

  const handleMouseLeave = useCallback(() => {
    // Clear timeout and hide tooltip
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setIsVisible(false);
  }, []);

  const handleMouseMove = useCallback((event: React.MouseEvent) => {
    const { clientX, clientY } = event;
    
    // Always update last mouse position
    lastMousePosition.current = { x: clientX, y: clientY };
    
    if (isVisible) {
      // Get actual tooltip dimensions if available
      const tooltipRect = tooltipRef.current?.getBoundingClientRect();
      const newPosition = calculatePosition(
        clientX, 
        clientY, 
        tooltipRect?.width, 
        tooltipRect?.height
      );
      setPosition(newPosition);
    }
  }, [isVisible, calculatePosition]);

  // Update position when tooltip becomes visible or dimensions change
  useEffect(() => {
    if (isVisible && tooltipRef.current) {
      const updatePosition = () => {
        const tooltipRect = tooltipRef.current?.getBoundingClientRect();
        const currentPos = lastMousePosition.current;
        const newPosition = calculatePosition(
          currentPos.x,
          currentPos.y,
          tooltipRect?.width,
          tooltipRect?.height
        );
        setPosition(newPosition);
      };
      
      // Global mouse move handler to track mouse across the entire page
      const handleGlobalMouseMove = (event: MouseEvent) => {
        lastMousePosition.current = { x: event.clientX, y: event.clientY };
        
        // Throttle position updates to prevent excessive recalculations
        if (positionUpdateRef.current) {
          clearTimeout(positionUpdateRef.current);
        }
        
        positionUpdateRef.current = setTimeout(() => {
          updatePosition();
        }, 16); // ~60fps
      };
      
      // Update position immediately when visible
      updatePosition();
      
      // Add global mouse move listener
      document.addEventListener('mousemove', handleGlobalMouseMove);
      
      // Also update position on window resize
      window.addEventListener('resize', updatePosition);
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('resize', updatePosition);
        if (positionUpdateRef.current) {
          clearTimeout(positionUpdateRef.current);
        }
      };
    }
  }, [isVisible, calculatePosition]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (positionUpdateRef.current) {
        clearTimeout(positionUpdateRef.current);
      }
    };
  }, []);

  return {
    isVisible,
    position,
    tooltipRef,
    handleMouseEnter,
    handleMouseLeave,
    handleMouseMove,
  };
};
