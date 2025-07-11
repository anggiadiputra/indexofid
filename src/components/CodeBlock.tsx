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
    // Force a re-render after mounting
    const timer = setTimeout(() => {
      setMounted(state => state);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const copyToClipboard = async () => {
    if (!codeRef.current) return;

    try {
      const codeText = codeRef.current.textContent || '';
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const detectLanguage = (code: string, className: string): string => {
    const classLang = className.match(/language-(\w+)/i)?.[1];
    if (classLang) return classLang;

    if (code.includes('#!/bin/bash') || code.includes('sudo ')) return 'bash';
    if (code.includes('function') || code.includes('const ')) return 'javascript';
    if (code.includes('<?php')) return 'php';
    if (code.includes('<div') || code.includes('<html')) return 'html';
    if (code.includes('.container') || code.includes('@media')) return 'css';
    
    return language || 'text';
  };

  const getLanguageIcon = (lang: string): string => {
    const icons: Record<string, string> = {
      javascript: '🟨',
      typescript: '🔷',
      php: '🐘',
      html: '🌐',
      css: '🎨',
      bash: '💻',
      text: '📝'
    };
    return icons[lang.toLowerCase()] || '📝';
  };

  // Initial loading state
  if (!mounted) {
    return (
      <div className="relative bg-gray-800 rounded-lg p-4 text-white">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-700 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const detectedLanguage = detectLanguage(children, className);
  const lines = children.split('\n');

  return (
    <div className="relative group bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
      {/* Header */}
      <div className="flex items-center justify-between p-2 bg-gray-900 border-b border-gray-700">
        <div className="flex items-center gap-2">
          <span>{getLanguageIcon(detectedLanguage)}</span>
          <span className="text-white font-medium capitalize">{detectedLanguage}</span>
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
            className="text-gray-100 text-sm block font-mono"
          >
            {children}
          </code>
        </pre>
      </div>
    </div>
  );
} 