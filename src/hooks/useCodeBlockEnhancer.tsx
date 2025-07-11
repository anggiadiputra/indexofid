'use client';

import { useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import CodeBlock from '@/components/CodeBlock';

interface UseCodeBlockEnhancerProps {
  content: string;
  enabled?: boolean;
  showLineNumbers?: boolean;
}

export default function useCodeBlockEnhancer({ 
  content, 
  enabled = true,
  showLineNumbers = false 
}: UseCodeBlockEnhancerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || !enabled || !containerRef.current || !content) return;

    const container = containerRef.current;
    container.innerHTML = content;

    const codeBlocks = container.querySelectorAll('pre code, .wp-block-code code');
    const roots: any[] = [];

    codeBlocks.forEach((codeElement) => {
      try {
        const codeContent = codeElement.textContent || '';
        const parent = codeElement.parentElement;
        if (!parent) return;

        // Skip inline code
        if (codeContent.trim().length < 10 && !codeContent.includes('\n')) return;

        const wrapper = document.createElement('div');
        wrapper.className = 'my-4';
        parent.parentNode?.insertBefore(wrapper, parent);
        parent.remove();

        const root = createRoot(wrapper);
        root.render(
          <CodeBlock>
            {codeContent}
          </CodeBlock>
        );
        roots.push(root);
      } catch (error) {
        console.error('Error enhancing code block:', error);
      }
    });

    return () => {
      roots.forEach(root => {
        try {
          root.unmount();
        } catch (error) {
          console.error('Error unmounting root:', error);
        }
      });
    };
  }, [content, enabled, isClient]);

  return { containerRef };
}

export function EnhancedContent({ 
  content, 
  className = '',
  showLineNumbers = false,
  enableCodeBlocks = true 
}: {
  content: string;
  className?: string;
  showLineNumbers?: boolean;
  enableCodeBlocks?: boolean;
}) {
  const [mounted, setMounted] = useState(false);
  const { containerRef } = useCodeBlockEnhancer({ 
    content, 
    enabled: enableCodeBlocks && mounted,
    showLineNumbers 
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div 
      ref={containerRef}
      className={`prose prose-lg max-w-none dark:prose-invert ${className}`}
      dangerouslySetInnerHTML={mounted ? { __html: content } : undefined}
    />
  );
} 