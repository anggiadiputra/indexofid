'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { WordPressPost } from '@/types/wordpress';

interface ArticlesCarouselProps {
  posts: WordPressPost[];
}

// Function to get category color based on category name
function getCategoryColor(categoryName: string): string {
  const categoryColors: { [key: string]: string } = {
    'wisata': 'bg-blue-100 text-blue-800',
    'kuliner': 'bg-green-100 text-green-800',
    'budaya': 'bg-purple-100 text-purple-800',
    'sejarah': 'bg-red-100 text-red-800',
    'default': 'bg-gray-100 text-gray-800'
  };
  
  return categoryColors[categoryName] || categoryColors['default'];
}

// Function to get placeholder image based on category
function getPlaceholderImage(categoryName: string): string {
  const images: { [key: string]: string } = {
    'Trik & Tips': '🎯',
    'wisata': '🏞️',
    'Technology': '💻',
    'Web Development': '🚀',
    'Digital Marketing': '📈',
    'Design & UX': '🎨',
    'default': '📝'
  };
  
  return images[categoryName] || images['default'];
}

// Function to get actual category name from post
function getCategoryName(post: WordPressPost): string {
  // Check if post has _embedded categories data
  if (post._embedded && post._embedded['wp:term'] && post._embedded['wp:term'].length > 0) {
    // wp:term contains arrays for different taxonomies (categories, tags, etc.)
    const categories = post._embedded['wp:term'].find(termArray => 
      termArray.length > 0 && termArray[0].taxonomy === 'category'
    );
    
    if (categories && categories.length > 0) {
      // Filter out 'Uncategorized' and return the first actual category
      const actualCategory = categories.find(cat => cat.name !== 'Uncategorized');
      return actualCategory ? actualCategory.name : 'Technology';
    }
  }
  
  return 'Technology'; // Default fallback
}

// Function to calculate reading time based on content
function calculateReadingTime(post: WordPressPost): string {
  // Extract text content from both content and excerpt
  const contentText = post.content?.rendered?.replace(/<[^>]*>/g, '') || '';
  const excerptText = post.excerpt?.rendered?.replace(/<[^>]*>/g, '') || '';
  
  // Use the longer text for calculation
  const fullText = contentText.length > excerptText.length ? contentText : excerptText;
  
  // Average reading speed is about 200-250 words per minute
  // We'll use 220 words per minute as average
  const wordsPerMinute = 220;
  const wordCount = fullText.trim().split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / wordsPerMinute);
  
  // Minimum reading time is 1 minute
  const finalTime = Math.max(1, readingTimeMinutes);
  
  return `${finalTime} menit baca`;
}

// Function to get featured image URL from post
function getFeaturedImageUrl(post: WordPressPost): string | null {
  // Check if post has _embedded data with featured media
  if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'].length > 0) {
    const featuredMedia = post._embedded['wp:featuredmedia'][0];
    
    // Try to get medium_large size first, then medium, then large, then full
    if (featuredMedia.media_details && featuredMedia.media_details.sizes) {
      const sizes = featuredMedia.media_details.sizes;
      
      if (sizes.medium_large) {
        return sizes.medium_large.source_url;
      } else if (sizes.medium) {
        return sizes.medium.source_url;
      } else if (sizes.large) {
        return sizes.large.source_url;
      } else if (sizes.full) {
        return sizes.full.source_url;
      }
    }
    
    // Fallback to source_url
    return featuredMedia.source_url || null;
  }
  
  return null;
}

export default function ArticlesCarousel({ posts }: ArticlesCarouselProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [slidesToShow, setSlidesToShow] = useState(1);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [mounted, setMounted] = useState(false);

  const totalSlides = Math.max(0, posts.length - slidesToShow + 1);

  // Responsive slides configuration
  useEffect(() => {
    setMounted(true);
    
    const updateSlidesToShow = () => {
      if (window.innerWidth >= 1024) {
        setSlidesToShow(3); // Desktop: show 3 cards
      } else if (window.innerWidth >= 768) {
        setSlidesToShow(2); // Tablet: show 2 cards
      } else {
        setSlidesToShow(1); // Mobile: show 1 card
      }
    };

    updateSlidesToShow();
    window.addEventListener('resize', updateSlidesToShow);
    return () => window.removeEventListener('resize', updateSlidesToShow);
  }, []);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || totalSlides <= 1) return;

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides);
    }, 5000); // Change slide every 5 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  if (!posts || posts.length === 0) {
    return null;
  }

  // Prevent hydration mismatch by showing loading state until mounted
  if (!mounted) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden px-4 sm:px-6 lg:px-8">
        <div className="relative">
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 gap-8">
              <div className="bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg animate-pulse">
                <div className="h-56 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 rounded-xl mb-8"></div>
                <div className="space-y-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                  <div className="flex justify-between items-center pt-4">
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-10 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 relative overflow-hidden px-4 sm:px-6 lg:px-8">
      <div 
        className="relative"
        onMouseEnter={() => setIsAutoPlaying(false)}
        onMouseLeave={() => setIsAutoPlaying(true)}
      >
        {/* Enhanced Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute z-20 left-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full p-4 hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={currentSlide === 0}
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <button
          onClick={nextSlide}
          className="absolute z-20 right-4 top-1/2 transform -translate-y-1/2 bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-full p-4 hover:bg-white hover:border-blue-300 hover:shadow-2xl transition-all duration-300 transform hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          disabled={currentSlide >= totalSlides - 1}
        >
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>

        {/* Carousel Container */}
        <div className="overflow-hidden">
          <div 
            className="flex transition-transform duration-500 ease-in-out"
            style={{ 
              transform: `translateX(-${currentSlide * (100 / slidesToShow)}%)`,
              width: `${(posts.length / slidesToShow) * 100}%`
            }}
          >
            {posts.map((post, index) => {
              // Get actual category name from post data
              const categoryName = getCategoryName(post);
              
              // Calculate actual reading time
              const readingTime = calculateReadingTime(post);

              // Get featured image URL
              const featuredImageUrl = getFeaturedImageUrl(post);
              
              return (
                <div 
                  key={post.id} 
                  className="px-4"
                  style={{ width: `${100 / posts.length}%` }}
                >
                  <div className="group relative h-full">
                    {/* Enhanced Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    
                    <div className="relative bg-white/80 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 h-full overflow-hidden group-hover:-translate-y-2">
                      {/* Enhanced Featured Image */}
                      <div className="relative h-56 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center overflow-hidden">
                        {featuredImageUrl ? (
                          <Image
                            src={featuredImageUrl}
                            alt={post.title?.rendered || 'Article Image'}
                            fill
                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            onError={(e) => {
                              // If image fails to load, show placeholder
                              e.currentTarget.style.display = 'none';
                              const placeholder = e.currentTarget.nextElementSibling as HTMLElement;
                              if (placeholder) {
                                placeholder.style.display = 'flex';
                              }
                            }}
                          />
                        ) : null}
                        
                        {/* Enhanced Fallback placeholder */}
                        <div 
                          className={`absolute inset-0 flex flex-col items-center justify-center text-6xl ${featuredImageUrl ? 'hidden' : 'flex'}`}
                          style={{ display: featuredImageUrl ? 'none' : 'flex' }}
                        >
                          <div className="text-8xl mb-4 opacity-80">
                            {getPlaceholderImage(categoryName)}
                          </div>
                          <div className="text-lg font-semibold text-gray-600 opacity-60">
                            Artikel {categoryName}
                          </div>
                        </div>
                        
                        {/* Enhanced Overlay */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                        
                        {/* Floating Date Badge */}
                        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-white/50 px-3 py-2 rounded-xl shadow-lg">
                          <span className="text-xs font-semibold text-gray-700">
                            {new Date(post.date).toLocaleDateString('id-ID', {
                              day: '2-digit',
                              month: 'short',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
                      
                      {/* Enhanced Card Content */}
                      <div className="p-8">
                        {/* Enhanced Category Tag */}
                        <div className="mb-6">
                          <span className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200/50 text-blue-700 text-sm font-semibold rounded-full shadow-sm">
                            <svg className="w-3 h-3 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M17.707 9.293a1 1 0 010 1.414l-7 7a1 1 0 01-1.414 0l-7-7A.997.997 0 012 10V5a3 3 0 013-3h5c.256 0 .512.098.707.293l7 7zM5 6a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
                            </svg>
                            {categoryName}
                          </span>
                        </div>

                        {/* Enhanced Title */}
                        <h3 className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
                          <span
                            dangerouslySetInnerHTML={{
                              __html: post.title?.rendered || 'Untitled Article',
                            }}
                          />
                        </h3>

                        {/* Enhanced Excerpt */}
                        <div className="mb-6">
                          <div
                            className="text-gray-600 text-base line-clamp-3 leading-relaxed"
                            dangerouslySetInnerHTML={{
                              __html: post.excerpt?.rendered || 'No description available',
                            }}
                          />
                        </div>

                        {/* Enhanced Read More Button */}
                        <div className="flex justify-between items-center">
                          <div className="flex items-center text-sm text-gray-500">
                            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                            </svg>
                            <span className="font-medium">{readingTime}</span>
                          </div>
                          
                          <Link
                            href={`/${post.slug}`}
                            className="group/btn inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-sm font-semibold rounded-xl transition-all duration-300 shadow-md hover:shadow-lg transform hover:scale-105"
                          >
                            Baca
                            <svg className="w-4 h-4 ml-2 transition-transform group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                            </svg>
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Enhanced Pagination Dots */}
        <div className="flex justify-center mt-12 space-x-3">
          {Array.from({ length: totalSlides }, (_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`relative transition-all duration-300 ${
                currentSlide === index 
                  ? 'w-12 h-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full shadow-lg' 
                  : 'w-4 h-4 bg-gray-300 hover:bg-gray-400 rounded-full hover:scale-110'
              }`}
            >
              {currentSlide === index && (
                <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full blur-sm opacity-40"></div>
              )}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
} 