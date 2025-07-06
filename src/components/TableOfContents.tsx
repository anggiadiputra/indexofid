'use client';

import { useEffect, useState, useMemo } from 'react';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

interface TableOfContentsProps {
  content: string;
  postTitle?: string;
}

const TableOfContents = ({ content, postTitle }: TableOfContentsProps) => {
  const [isOpen, setIsOpen] = useState(true); // Default to open
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Memoize the TOC items extraction for better performance
  const tocItems = useMemo(() => {
    if (!content || typeof window === 'undefined') return [];

    try {
      const tempDiv = document.createElement('div');
      tempDiv.innerHTML = content;
      
      const headings = tempDiv.querySelectorAll('h2, h3, h4, h5, h6');
      const items: TocItem[] = [];
      
      const cleanPostTitle = postTitle 
        ? postTitle.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().toLowerCase()
        : '';
      
      headings.forEach((heading, index) => {
        try {
          const text = heading.textContent?.trim();
          if (!text) return;
          
          const level = parseInt(heading.tagName.charAt(1));
          if (level < 2 || level > 6) return; // Only H2-H6
          
          // Skip if matches post title (case insensitive)
          if (cleanPostTitle && text.toLowerCase() === cleanPostTitle) {
            return;
          }
          
          // Create a more readable ID from the text
          const id = `heading-${text.toLowerCase()
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50)}-${index}`;
          
          items.push({ id, text, level });
        } catch (error) {
          console.warn('Error processing heading:', error);
        }
      });
      
      return items;
    } catch (error) {
      console.error('Error extracting headings:', error);
      return [];
    }
  }, [content, postTitle]);

  // Add IDs to actual DOM headings after component mounts
  useEffect(() => {
    if (!mounted || tocItems.length === 0 || typeof window === 'undefined') return;

    const timer = setTimeout(() => {
      try {
        const articleElement = document.querySelector('article[data-content="article"]');
        if (!articleElement) return;

        const domHeadings = articleElement.querySelectorAll('h2, h3, h4, h5, h6');
        let tocIndex = 0;

        domHeadings.forEach((heading) => {
          try {
            const text = heading.textContent?.trim();
            if (!text) return;

            const level = parseInt(heading.tagName.charAt(1));
            if (level < 2 || level > 6) return;

            // Skip if matches post title
            const cleanPostTitle = postTitle 
              ? postTitle.replace(/<[^>]*>/g, '').replace(/&[^;]+;/g, ' ').trim().toLowerCase()
              : '';
            
            if (cleanPostTitle && text.toLowerCase() === cleanPostTitle) {
              return;
            }

            if (tocItems[tocIndex]) {
              heading.id = tocItems[tocIndex].id;
              tocIndex++;
            }
          } catch (error) {
            console.warn('Error processing DOM heading:', error);
          }
        });
      } catch (error) {
        console.error('Error adding IDs to headings:', error);
      }
    }, 500); // Wait for content to render

    return () => clearTimeout(timer);
  }, [mounted, tocItems, postTitle]);

  const scrollToHeading = (id: string) => {
    if (typeof window === 'undefined') return;
    
    try {
      const element = document.getElementById(id);
      if (element) {
        const offset = 100;
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
          top: elementPosition,
          behavior: 'smooth'
        });
        
        // Close mobile menu after scrolling
        if (window.innerWidth < 1024) {
          setIsOpen(false);
        }
      }
    } catch (error) {
      console.warn('Error scrolling to heading:', error);
    }
  };

  // Don't render anything on server or if no items
  if (!mounted) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm text-gray-400 text-center">
        <span>Memuat Daftar Isi…</span>
      </div>
    );
  }

  if (tocItems.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm text-gray-400 text-center">
        <span>Tidak ada Daftar Isi</span>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-gray-900 dark:text-gray-100 text-lg flex items-center gap-2">
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
          </svg>
          Daftar Isi
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400">
            ({tocItems.length} bagian)
          </span>
        </h3>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-200 group"
          aria-label={isOpen ? 'Tutup daftar isi' : 'Buka daftar isi'}
          title={isOpen ? 'Tutup daftar isi' : 'Buka daftar isi'}
        >
          <div className="flex items-center gap-1">
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
              {isOpen ? 'Tutup' : 'Buka'}
            </span>
            <svg
              className={`w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-gray-800 dark:group-hover:text-gray-200 transition-all duration-300 ${
                isOpen ? 'rotate-180' : 'rotate-0'
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* TOC List */}
      <nav className={`transition-all duration-300 ease-in-out overflow-hidden ${
        isOpen ? 'block opacity-100 max-h-[600px]' : 'hidden opacity-0 max-h-0'
      }`}>
        <ul className="space-y-1">
          {tocItems.map((item, index) => (
            <li key={`${item.id}-${index}`}>
              <button
                onClick={() => scrollToHeading(item.id)}
                className={`
                  block w-full text-left py-2 px-3 rounded-lg transition-all duration-200
                  hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300
                  text-gray-700 dark:text-gray-300 hover:translate-x-1
                  ${item.level === 2 ? 'font-semibold text-sm' : ''}
                  ${item.level === 3 ? 'ml-4 text-sm font-medium' : ''}
                  ${item.level === 4 ? 'ml-8 text-xs' : ''}
                  ${item.level >= 5 ? 'ml-12 text-xs opacity-75' : ''}
                `}
                title={item.text}
              >
                <span className="flex items-center gap-2">
                  <span className={`w-1 h-4 rounded-full bg-blue-500 opacity-60 ${
                    item.level === 2 ? 'opacity-100' : ''
                  }`}></span>
                  <span className="line-clamp-2 leading-relaxed">{item.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* Summary Footer */}
      {isOpen && (
        <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 transition-all duration-300">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <span>{tocItems.length} bagian tersedia</span>
            </div>
            <div className="flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Klik untuk loncat</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TableOfContents; 