'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CodeBlock from '@/components/CodeBlock';

interface UseCodeBlockEnhancerProps {
  content: string;
  enabled?: boolean;
}

export default function useCodeBlockEnhancer({ 
  content, 
  enabled = true
}: UseCodeBlockEnhancerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const rootsRef = useRef<any[]>([]);

  // Handle hydration
  useEffect(() => {
    setIsHydrated(true);
    return () => {
      rootsRef.current.forEach(root => {
        try {
          root.unmount();
        } catch (error) {
          console.error('Error unmounting:', error);
        }
      });
      rootsRef.current = [];
    };
  }, []);

  // Process code blocks
  useEffect(() => {
    if (!isHydrated || !enabled || !containerRef.current || !content) return;

    const container = containerRef.current;
    container.innerHTML = content;

    // Find and enhance code blocks
    const codeBlocks = container.querySelectorAll('pre code, .wp-block-code code');
    
    codeBlocks.forEach((codeElement) => {
      try {
        const codeContent = codeElement.textContent || '';
        const parent = codeElement.parentElement;
        if (!parent) return;

        // Create wrapper
        const wrapper = document.createElement('div');
        wrapper.className = 'my-4';
        parent.parentNode?.insertBefore(wrapper, parent);
        parent.remove();

        // Create and store root
        const root = createRoot(wrapper);
        root.render(<CodeBlock>{codeContent}</CodeBlock>);
        rootsRef.current.push(root);
      } catch (error) {
        console.error('Error processing code block:', error);
      }
    });
  }, [content, enabled, isHydrated]);

  return containerRef;
}

export function EnhancedContent({ 
  content, 
  className = '' 
}: {
  content: string;
  className?: string;
}) {
  const [mounted, setMounted] = useState(false);
  const containerRef = useCodeBlockEnhancer({ 
    content,
    enabled: mounted
  });

  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  if (!mounted) {
    return <div className="animate-pulse">Loading...</div>;
  }

  return (
    <div 
      ref={containerRef}
      className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
} 