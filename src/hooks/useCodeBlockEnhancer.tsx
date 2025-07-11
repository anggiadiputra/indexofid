'use client';

import { useEffect, useRef } from 'react';
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

  useEffect(() => {
    if (!enabled || !containerRef.current || !content) return;

    const container = containerRef.current;
    
    // Set the initial content
    container.innerHTML = content;

    // Find all code blocks (pre > code, code, .wp-block-code)
    const codeBlocks = container.querySelectorAll(
      'pre code, .wp-block-code code, .wp-block-preformatted, pre.wp-block-code, code.language-*'
    );

    const roots: any[] = [];

    codeBlocks.forEach((codeElement, index) => {
      try {
        // Get the code content
        let codeContent = '';
        let language = '';
        let parentElement = codeElement.parentElement;

                 // Extract content based on element type
         if (codeElement.tagName === 'CODE') {
           codeContent = codeElement.textContent || '';
           
           // Try to get language from class
           const classList = Array.from(codeElement.classList);
           const langClass = classList.find(cls => cls.startsWith('language-'));
           if (langClass) {
             language = langClass.replace('language-', '');
           }
           
           // If code is inside a pre tag, use the pre as parent
           if (parentElement?.tagName === 'PRE') {
             parentElement = parentElement as HTMLElement;
           } else {
             parentElement = codeElement as HTMLElement;
           }
         } else if (codeElement.tagName === 'PRE') {
           codeContent = codeElement.textContent || '';
           parentElement = codeElement as HTMLElement;
         } else {
           codeContent = codeElement.textContent || '';
           parentElement = codeElement as HTMLElement;
         }

        // Skip if content is too short (likely inline code)
        if (codeContent.trim().length < 10 || !codeContent.includes('\n')) {
          return;
        }

        // Create a wrapper div
        const wrapperDiv = document.createElement('div');
        wrapperDiv.className = 'code-block-enhanced';
        wrapperDiv.style.margin = '1.5rem 0';

        // Replace the original element with our wrapper
        if (parentElement && parentElement.parentNode) {
          parentElement.parentNode.insertBefore(wrapperDiv, parentElement);
          parentElement.remove();

          // Create React root and render CodeBlock
          const root = createRoot(wrapperDiv);
          root.render(
            <CodeBlock 
              language={language}
              showLineNumbers={showLineNumbers}
            >
              {codeContent}
            </CodeBlock>
          );
          
          roots.push(root);
        }
      } catch (error) {
        console.error('Error enhancing code block:', error);
      }
    });

    // Cleanup function
    return () => {
      roots.forEach(root => {
        try {
          root.unmount();
        } catch (error) {
          console.error('Error unmounting code block:', error);
        }
      });
    };
  }, [content, enabled, showLineNumbers]);

  return { containerRef };
}

// Alternative: Component-based approach
interface EnhancedContentProps {
  content: string;
  className?: string;
  showLineNumbers?: boolean;
  enableCodeBlocks?: boolean;
}

export function EnhancedContent({ 
  content, 
  className = '',
  showLineNumbers = false,
  enableCodeBlocks = true 
}: EnhancedContentProps) {
  const { containerRef } = useCodeBlockEnhancer({ 
    content, 
    enabled: enableCodeBlocks, 
    showLineNumbers 
  });

  return (
    <div 
      ref={containerRef}
      className={`prose prose-lg max-w-none ${className}`}
      style={{
        // Ensure code blocks are properly styled
        '--code-bg': '#1f2937',
        '--code-text': '#f9fafb'
      } as React.CSSProperties}
    />
  );
} 