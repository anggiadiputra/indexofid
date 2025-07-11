'use client';

import { useState, useRef, useEffect } from 'react';

interface CodeBlockProps {
  children: string;
  language?: string;
  className?: string;
  showLineNumbers?: boolean;
}

export default function CodeBlock({ 
  children, 
  language = '', 
  className = '',
  showLineNumbers = false 
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  const [mounted, setMounted] = useState(false);
  const codeRef = useRef<HTMLElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const copyToClipboard = async () => {
    if (!codeRef.current) return;

    try {
      // Get the text content, preserving line breaks
      const codeText = codeRef.current.textContent || '';
      
      // Use the modern clipboard API
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(codeText);
      } else {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = codeText;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }

      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy code:', error);
      // Fallback method
      try {
        const textArea = document.createElement('textarea');
        textArea.value = codeRef.current?.textContent || '';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (fallbackError) {
        console.error('Fallback copy method also failed:', fallbackError);
      }
    }
  };

  const detectLanguage = (code: string, className: string): string => {
    // Try to detect language from className first
    const classLang = className.match(/language-(\w+)/i)?.[1];
    if (classLang) return classLang;

    // Auto-detect common patterns
    if (code.includes('function') && code.includes('{') && code.includes('}')) {
      if (code.includes('const ') || code.includes('let ') || code.includes('=>')) {
        return 'javascript';
      }
      if (code.includes('def ') || code.includes('import ')) {
        return 'python';
      }
      if (code.includes('<?php')) {
        return 'php';
      }
    }
    
    if (code.includes('<div') || code.includes('<html')) return 'html';
    if (code.includes('SELECT') || code.includes('INSERT') || code.includes('UPDATE')) return 'sql';
    if (code.includes('.container') || code.includes('@media')) return 'css';
    if (code.includes('#!/bin/bash') || code.includes('sudo ')) return 'bash';
    
    return language || 'code';
  };

  const getLanguageIcon = (lang: string) => {
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
    return icons[lang.toLowerCase()] || '📝';
  };

  if (!mounted) {
    return (
      <div className={`relative bg-gray-900 text-gray-100 rounded-lg overflow-hidden ${className}`}>
        <pre className="p-4 overflow-x-auto">
          <code>{children}</code>
        </pre>
      </div>
    );
  }

  const detectedLanguage = detectLanguage(children, className);
  const lines = children.split('\n');

  return (
    <div className={`relative group bg-gray-900 text-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-700 ${className}`}>
      {/* Header with language and copy button */}
      <div className="flex items-center justify-between px-4 py-2 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <span className="text-sm">{getLanguageIcon(detectedLanguage)}</span>
          <span className="text-sm font-medium text-gray-300 capitalize">
            {detectedLanguage}
          </span>
          {lines.length > 1 && (
            <span className="text-xs text-gray-500">
              {lines.length} lines
            </span>
          )}
        </div>
        
        <button
          onClick={copyToClipboard}
          className={`flex items-center space-x-1 px-3 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
            copied 
              ? 'bg-green-600 text-white' 
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white'
          }`}
          title={copied ? 'Copied!' : 'Copy to clipboard'}
        >
          {copied ? (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code content */}
      <div className="relative">
        <pre className={`p-4 overflow-x-auto text-sm leading-relaxed ${showLineNumbers ? 'pl-12' : ''}`}>
          <code ref={codeRef} className={`language-${detectedLanguage}`}>
            {children}
          </code>
        </pre>
        
        {/* Line numbers */}
        {showLineNumbers && lines.length > 1 && (
          <div className="absolute left-0 top-0 p-4 pr-2 text-gray-500 text-sm leading-relaxed select-none">
            {lines.map((_, index) => (
              <div key={index} className="text-right">
                {index + 1}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Gradient overlay for long code */}
      {lines.length > 20 && (
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-gray-900 to-transparent pointer-events-none"></div>
      )}
    </div>
  );
} 