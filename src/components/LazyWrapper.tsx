'use client';

import { useEffect, useRef, useState, ReactNode } from 'react';

interface LazyWrapperProps {
  children: ReactNode;
  className?: string;
  threshold?: number;
  rootMargin?: string;
  fallback?: ReactNode;
  once?: boolean;
  onInView?: () => void;
}

export default function LazyWrapper({
  children,
  className = '',
  threshold = 0.1,
  rootMargin = '50px',
  fallback = null,
  once = true,
  onInView
}: LazyWrapperProps) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    // Create intersection observer
    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);
          onInView?.();
          
          // If once is true, stop observing after first intersection
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once, onInView]);

  // Determine what to render
  const shouldRender = once ? hasBeenInView : isInView;

  return (
    <div ref={elementRef} className={className}>
      {shouldRender ? children : fallback}
    </div>
  );
}

// Higher-order component version
export function withLazyLoading<P extends object>(
  Component: React.ComponentType<P>,
  options: Omit<LazyWrapperProps, 'children'> = {}
) {
  return function LazyComponent(props: P) {
    return (
      <LazyWrapper {...options}>
        <Component {...props} />
      </LazyWrapper>
    );
  };
}

// Hook for intersection observer
export function useIntersectionObserver(
  options: {
    threshold?: number;
    rootMargin?: string;
    once?: boolean;
  } = {}
) {
  const [isInView, setIsInView] = useState(false);
  const [hasBeenInView, setHasBeenInView] = useState(false);
  const elementRef = useRef<HTMLElement>(null);

  const { threshold = 0.1, rootMargin = '50px', once = true } = options;

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        
        if (entry.isIntersecting) {
          setIsInView(true);
          setHasBeenInView(true);
          
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          setIsInView(false);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [threshold, rootMargin, once]);

  return {
    ref: elementRef,
    isInView: once ? hasBeenInView : isInView,
    hasBeenInView
  };
} 