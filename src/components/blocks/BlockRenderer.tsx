'use client';

import { useMemo, useState, useEffect } from 'react';
import { WordPressBlock, WpBlockToHtmlConfig } from '@/types/wordpress';

interface BlockRendererProps {
  blocks: WordPressBlock[];
  className?: string;
  config?: Partial<WpBlockToHtmlConfig>;
}

// Type compatible with wp-block-to-html
interface CompatibleBlock {
  blockName: string;
  attrs: Record<string, any>;
  innerBlocks: CompatibleBlock[];
  innerHTML: string;
  innerContent: string[];
}

const defaultConfig: WpBlockToHtmlConfig = {
  cssFramework: 'tailwind',
  hydration: {
    strategy: 'viewport',
    rootSelector: '#content',
  },
  ssrOptions: {
    enabled: true,
    optimizationLevel: 'maximum',
    lazyLoadMedia: true,
  },
};

// Recursively convert WordPressBlock to CompatibleBlock
function convertToCompatibleBlocks(blocks: WordPressBlock[]): CompatibleBlock[] {
  return blocks
    .filter(block => block.blockName !== null)
    .map(block => ({
      blockName: block.blockName as string,
      attrs: block.attrs,
      innerHTML: block.innerHTML,
      innerContent: block.innerContent || [],
      innerBlocks: convertToCompatibleBlocks(block.innerBlocks),
    }));
}

export default function BlockRenderer({ 
  blocks, 
  className = '', 
  config = {} 
}: BlockRendererProps) {
  const [convertBlocks, setConvertBlocks] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const mergedConfig = useMemo(() => ({
    ...defaultConfig,
    ...config,
  }), [config]);

  // Dynamic import to avoid SSR issues
  useEffect(() => {
    async function loadWpBlockToHtml() {
      try {
        const wpBlockModule = await import('wp-block-to-html');
        setConvertBlocks(() => wpBlockModule.convertBlocks);
        setIsLoading(false);
      } catch (err) {
        console.error('Failed to load wp-block-to-html:', err);
        setError('Failed to load block converter');
        setIsLoading(false);
      }
    }

    loadWpBlockToHtml();
  }, []);

  const renderedHTML = useMemo(() => {
    if (!blocks || blocks.length === 0 || !convertBlocks) {
      return '';
    }

    // Convert to compatible format recursively
    const compatibleBlocks = convertToCompatibleBlocks(blocks);

    if (compatibleBlocks.length === 0) {
      return '';
    }

    try {
      return convertBlocks(compatibleBlocks, mergedConfig);
    } catch (error) {
      console.error('Error rendering blocks with wp-block-to-html:', error);
      setError(`Error rendering content: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return '';
    }
  }, [blocks, mergedConfig, convertBlocks]);

  // Loading state
  if (isLoading) {
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

  // Error state - fallback to basic rendering
  if (error || !convertBlocks) {
    return <FallbackBlockRenderer blocks={blocks} className={className} />;
  }

  if (!renderedHTML) {
    return (
      <div className="text-gray-500 italic p-4">
        No content to display
      </div>
    );
  }

  return (
    <div 
      id="content"
      className={`prose prose-lg max-w-none ${className}`}
      dangerouslySetInnerHTML={{ __html: renderedHTML }}
    />
  );
}

// Fallback component for when wp-block-to-html fails
export function FallbackBlockRenderer({ blocks, className = '' }: { blocks: WordPressBlock[], className?: string }) {
  const renderBlock = (block: WordPressBlock): JSX.Element => {
    const { blockName, innerHTML, innerBlocks } = block;

    // Handle common core blocks as fallbacks
    switch (blockName) {
      case 'core/paragraph':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/heading':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-6"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/image':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-6"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/list':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/quote':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-6"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/code':
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-4"
            dangerouslySetInnerHTML={{ __html: innerHTML }} 
          />
        );
      
      case 'core/group':
      case 'core/columns':
        return (
          <div key={`${blockName}-${Math.random()}`} className="mb-6">
            {innerBlocks.map(renderBlock)}
          </div>
        );
      
      default:
        return (
          <div 
            key={`${blockName}-${Math.random()}`}
            className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md"
          >
            <p className="text-sm text-yellow-800 mb-2">
              <strong>Unsupported block:</strong> {blockName}
            </p>
            {innerHTML && (
              <div 
                className="text-sm text-gray-600"
                dangerouslySetInnerHTML={{ __html: innerHTML }} 
              />
            )}
            {innerBlocks.length > 0 && (
              <div className="mt-2">
                {innerBlocks.map(renderBlock)}
              </div>
            )}
          </div>
        );
    }
  };

  return (
    <div className={`prose prose-lg max-w-none ${className}`}>
      {blocks.map(renderBlock)}
    </div>
  );
}

// Error boundary wrapper for block rendering
export function BlockRendererWithFallback({ 
  blocks, 
  className = '', 
  config = {} 
}: BlockRendererProps) {
  try {
    return <BlockRenderer blocks={blocks} className={className} config={config} />;
  } catch (error) {
    console.error('BlockRenderer failed, using fallback:', error);
    return <FallbackBlockRenderer blocks={blocks} className={className} />;
  }
} 