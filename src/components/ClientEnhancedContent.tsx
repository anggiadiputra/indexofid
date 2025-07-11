'use client';

import { useEffect, useRef, useState } from 'react';
import CodeBlock from '@/components/CodeBlock';

interface ClientEnhancedContentProps {
  content: string;
  className?: string;
  showLineNumbers?: boolean;
  enableCodeBlocks?: boolean;
}

export default function ClientEnhancedContent({ 
  content, 
  className = '',
  showLineNumbers = false,
  enableCodeBlocks = true 
}: ClientEnhancedContentProps) {
  const [processedContent, setProcessedContent] = useState<string>('');
  const [codeBlocks, setCodeBlocks] = useState<Array<{
    id: string;
    content: string;
    language: string;
  }>>([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !content || !enableCodeBlocks) {
      setProcessedContent(content);
      return;
    }

    // Create a temporary DOM element to parse the content
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = content;

    // Find all code blocks - prioritize pre elements to avoid duplicates
    const preElements = tempDiv.querySelectorAll('pre.wp-block-code, pre[class*="language-"], .wp-block-preformatted');
    const codeElements = tempDiv.querySelectorAll('code[class*="language-"]');
    
    // Combine but filter out codes that are already inside pre elements
    const allElements = [
      ...Array.from(preElements),
      ...Array.from(codeElements).filter(code => !code.closest('pre'))
    ];



    const blocks: Array<{ id: string; content: string; language: string }> = [];

    allElements.forEach((codeElement, index) => {
      try {
        let codeContent = '';
        let language = '';
        let targetElement = codeElement;

        // Extract content based on element type
        if (codeElement.tagName === 'CODE') {
          codeContent = codeElement.textContent || '';
          
          // Try to get language from class
          const classList = Array.from(codeElement.classList);
          const langClass = classList.find(cls => cls.startsWith('language-'));
          if (langClass) {
            language = langClass.replace('language-', '');
          }
          
          // If code is inside a pre tag, use the pre as target
          if (codeElement.parentElement?.tagName === 'PRE') {
            targetElement = codeElement.parentElement as HTMLElement;
          }
        } else if (codeElement.tagName === 'PRE') {
          codeContent = codeElement.textContent || '';
          targetElement = codeElement as HTMLElement;
          
          // Try to get language from pre element classes
          const preClassList = Array.from(codeElement.classList);
          const preLangClass = preClassList.find(cls => cls.startsWith('language-'));
          if (preLangClass) {
            language = preLangClass.replace('language-', '');
          }
        } else {
          codeContent = codeElement.textContent || '';
          targetElement = codeElement as HTMLElement;
        }

        // Auto-detect bash/shell scripts
        if (!language && codeContent) {
          if (codeContent.trim().startsWith('#!') || 
              codeContent.includes('#!/bin/bash') || 
              codeContent.includes('#!/bin/sh') ||
              (codeContent.includes('#') && (codeContent.includes('echo') || codeContent.includes('mysql') || codeContent.includes('if')))) {
            language = 'bash';
          }
        }

        // Skip if content is too short (likely inline code)
        if (codeContent.trim().length < 3) {
          return;
        }

        // Don't skip multiline content or bash-like scripts
        const isBashLike = codeContent.includes('#') || codeContent.includes('echo') || codeContent.includes('if') || codeContent.includes('mysql');
        const hasMultipleLines = codeContent.includes('\n');
        
        if (!hasMultipleLines && !isBashLike && codeContent.trim().length < 10) {
          return;
        }

        const blockId = `code-block-${index}`;

        blocks.push({
          id: blockId,
          content: codeContent,
          language: language || 'bash'
        });

        // Replace the element directly in the DOM
        const placeholder = document.createElement('div');
        placeholder.setAttribute('data-code-block-id', blockId);
        placeholder.className = 'code-block-placeholder';
        placeholder.style.margin = '16px 0';
        
        // Replace in the temp DOM
        targetElement.parentNode?.replaceChild(placeholder, targetElement);
      } catch (error) {
        console.error('Error processing code block:', error);
      }
    });


    setCodeBlocks(blocks);
    // Get the modified HTML from tempDiv
    setProcessedContent(tempDiv.innerHTML);
  }, [content, enableCodeBlocks, mounted, showLineNumbers]);

  if (!mounted) {
    return (
      <div className={`prose prose-lg max-w-none ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      <div 
        dangerouslySetInnerHTML={{ __html: processedContent }}
      />
      
      {/* Mount code blocks in their placeholders after render */}
      <CodeBlockMounter 
        codeBlocks={codeBlocks}
        showLineNumbers={showLineNumbers}
      />
    </div>
  );
}

// Helper component to mount code blocks without createRoot
function CodeBlockMounter({ 
  codeBlocks, 
  showLineNumbers 
}: { 
  codeBlocks: Array<{ id: string; content: string; language: string }>;
  showLineNumbers: boolean;
}) {
  useEffect(() => {
    // Use setTimeout to ensure DOM is ready
    const timer = setTimeout(() => {

      
      codeBlocks.forEach((block) => {
        // Try multiple selector strategies
        let placeholder = document.querySelector(`[data-code-block-id="${block.id}"]`);
        if (!placeholder) {
          placeholder = document.querySelector(`.code-block-placeholder`);
        }

        if (placeholder) {
          // Create the new element
          const codeBlockElement = document.createElement('div');
          codeBlockElement.className = 'relative group bg-gray-900 text-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-700 my-6 not-prose';
          codeBlockElement.innerHTML = `
            <div class="flex items-center justify-between px-4 py-3 bg-gray-800 border-b border-gray-700">
              <div class="flex items-center space-x-2">
                <span class="text-sm">${getLanguageIcon(block.language)}</span>
                <span class="text-sm font-medium text-gray-300 capitalize">
                  ${block.language}
                </span>
                <span class="text-xs text-gray-500">
                  ${block.content.split('\n').length} lines
                </span>
              </div>
              <button class="copy-btn flex items-center space-x-1 px-3 py-1.5 rounded-md text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 transition-all duration-200 shadow-sm z-10 relative">
                <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
                </svg>
                <span>Copy</span>
              </button>
            </div>
            <div class="relative">
              <pre class="p-4 overflow-x-auto text-sm leading-relaxed bg-gray-900"><code class="language-${block.language} text-gray-100">${escapeHtml(block.content)}</code></pre>
            </div>
          `;

          // Replace placeholder with new element
          placeholder.parentNode?.replaceChild(codeBlockElement, placeholder);

          // Add copy functionality to the button
          const copyBtn = codeBlockElement.querySelector('.copy-btn') as HTMLButtonElement;
          if (copyBtn) {
            copyBtn.addEventListener('click', async (e) => {
              e.preventDefault();
              e.stopPropagation();
              
                              try {
                  await navigator.clipboard.writeText(block.content);
                  const originalHTML = copyBtn.innerHTML;
                  copyBtn.innerHTML = `
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Copied!</span>
                  `;
                  copyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                  copyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                  
                  setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    copyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                  }, 2000);
              } catch (error) {
                console.error('Failed to copy:', error);
                // Fallback method
                try {
                  const textArea = document.createElement('textarea');
                  textArea.value = block.content;
                  document.body.appendChild(textArea);
                  textArea.select();
                  document.execCommand('copy');
                  document.body.removeChild(textArea);
                  
                  const originalHTML = copyBtn.innerHTML;
                  copyBtn.innerHTML = `
                    <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                    <span>Copied!</span>
                  `;
                  copyBtn.classList.remove('bg-blue-600', 'hover:bg-blue-700');
                  copyBtn.classList.add('bg-green-600', 'hover:bg-green-700');
                  
                  setTimeout(() => {
                    copyBtn.innerHTML = originalHTML;
                    copyBtn.classList.remove('bg-green-600', 'hover:bg-green-700');
                    copyBtn.classList.add('bg-blue-600', 'hover:bg-blue-700');
                  }, 2000);
                } catch (fallbackError) {
                  console.error('Fallback copy method also failed:', fallbackError);
                }
              }
            });
          }
        }
      });
    }, 100); // Small delay to ensure DOM is ready

    return () => clearTimeout(timer);
  }, [codeBlocks, showLineNumbers]);

  return null;
}

function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

function getLanguageIcon(language: string): string {
  const icons: Record<string, string> = {
    javascript: '🟨',
    typescript: '🔷', 
    python: '🐍',
    php: '🐘',
    html: '🌐',
    css: '🎨',
    sql: '🗄️',
    bash: '💻',
    shell: '💻',
    json: '📋',
    xml: '📄',
    yaml: '⚙️',
    markdown: '📝',
    code: '📝'
  };
  return icons[language.toLowerCase()] || '📝';
} 