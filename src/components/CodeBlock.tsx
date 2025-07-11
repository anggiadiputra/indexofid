'use client';

import { useState, useRef, useEffect } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
}

export default function CodeBlock({ 
  children, 
  language = '', 
  className = ''
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  // Ensure hydration
  useEffect(() => {
    const timer = setTimeout(() => {
      setMounted(true);
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async () => {
    if (!codeRef.current) return;
    try {
      await navigator.clipboard.writeText(codeRef.current.textContent || '');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  // Loading state
  if (!mounted) {
    return (
      <div className="relative bg-gray-800 rounded-lg p-4">
        <div className="animate-pulse space-y-2">
          <div className="h-4 bg-gray-700 rounded w-3/4"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-white">{language || 'code'}</span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
            copied 
              ? 'bg-green-500 text-white' 
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre className="p-4 overflow-x-auto">
          <code 
            ref={codeRef}
            className="text-gray-100 text-sm block font-mono whitespace-pre"
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
} 