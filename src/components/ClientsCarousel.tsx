'use client';

import { useState, useEffect } from 'react';

interface Client {
  id: number;
  name: string;
  logo: string;
  industry: string;
  testimonial: string;
  rating: number;
  gradient: string;
}

const clients: Client[] = [
  { 
    id: 1, 
    name: 'TechCorp', 
    logo: '🏢',
    industry: 'Technology',
    testimonial: 'Tim JasaKami.ID sangat profesional dalam menangani migrasi website kami. Prosesnya cepat dan aman.',
    rating: 5.0,
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    id: 2, 
    name: 'InnovateLab Digital', 
    logo: '💡',
    industry: 'Digital Agency',
    testimonial: 'Tim yang responsif dan hasil yang memuaskan.',
    rating: 5,
    gradient: 'from-emerald-500 to-emerald-600' 
  },
  { 
    id: 3, 
    name: 'DigitalFlow Media', 
    logo: '📱',
    industry: 'Media & Marketing',
    testimonial: 'Website kami kini lebih aman dan performa meningkat drastis.',
    rating: 5,
    gradient: 'from-blue-500 to-blue-600' 
  },
  { 
    id: 4, 
    name: 'CloudVision Systems', 
    logo: '☁️',
    industry: 'Cloud Services',
    testimonial: 'Setup VPS yang perfect dan support yang excellent!',
    rating: 5,
    gradient: 'from-purple-500 to-purple-600' 
  },
  { 
    id: 5, 
    name: 'StartupHub Indonesia', 
    logo: '🌟',
    industry: 'Business Hub',
    testimonial: 'Malware removal yang thorough, website kembali normal.',
    rating: 5,
    gradient: 'from-pink-500 to-pink-600' 
  },
  { 
    id: 6, 
    name: 'GrowthMax Consulting', 
    logo: '📊',
    industry: 'Business Consulting',
    testimonial: 'Management VPS 24/7 yang sangat dapat diandalkan.',
    rating: 5,
    gradient: 'from-cyan-500 to-cyan-600' 
  },
];

export default function ClientsCarousel() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [visibleCount, setVisibleCount] = useState(1);
  const [mounted, setMounted] = useState(false);
  const totalSlides = clients.length;

  // Handle responsive visible count
  useEffect(() => {
    setMounted(true);
    
    const updateVisibleCount = () => {
      if (window.innerWidth >= 1024) {
        setVisibleCount(3);
      } else if (window.innerWidth >= 768) {
        setVisibleCount(2);
      } else {
        setVisibleCount(1);
      }
    };

    updateVisibleCount();
    window.addEventListener('resize', updateVisibleCount);
    return () => window.removeEventListener('resize', updateVisibleCount);
  }, []);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  // Auto-play functionality with hover pause
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000);

      return () => clearInterval(interval);
    }
  }, [totalSlides, isHovered]);

  // Get visible clients based on state
  const getVisibleClients = () => {
    const visible = [];
    for (let i = 0; i < visibleCount; i++) {
      const index = (currentSlide + i) % totalSlides;
      visible.push(clients[index]);
    }
    return visible;
  };

  // Prevent hydration mismatch by not rendering until mounted
  if (!mounted) {
    return (
      <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 relative overflow-hidden">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              Testimonials
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              Dipercaya oleh{' '}
              <span className="text-blue-600 dark:text-blue-400">Klien Terbaik</span>
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Bergabunglah dengan ratusan klien yang telah mempercayai layanan WordPress profesional kami
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8">
            <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg animate-pulse">
              <div className="h-20 w-20 bg-gray-200 dark:bg-gray-700 rounded-2xl mx-auto mb-6"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-2 w-32"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto mb-4 w-24"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mx-auto w-48"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <svg
        key={i}
        className={`w-4 h-4 ${i < rating ? 'text-yellow-400' : 'text-gray-300 dark:text-gray-600'}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-br from-gray-50 via-white to-blue-50/30 dark:from-gray-900 dark:via-gray-900 dark:to-blue-900/20 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0 opacity-40">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-400/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-80 h-80 bg-blue-400/10 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 bg-blue-100 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300 rounded-full text-sm font-medium mb-6">
            <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Testimonials
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Dipercaya oleh{' '}
            <span className="text-blue-600 dark:text-blue-400">Klien Terbaik</span>
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Bergabunglah dengan ratusan klien yang telah mempercayai layanan WordPress profesional kami
          </p>
        </div>

        {/* Carousel Container */}
        <div 
          className="relative"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {getVisibleClients().map((client, index) => (
                <div
                  key={`${client.id}-${currentSlide}`}
                  className={`transform transition-all duration-700 ease-out ${
                    index === 1 ? 'scale-105 z-10' : 'scale-95 opacity-80'
                  }`}
                  style={{
                    animationDelay: `${index * 0.1}s`
                  }}
                >
                  <div className="group bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-blue-200 dark:hover:border-blue-600 hover:-translate-y-2 relative overflow-hidden">
                    {/* Background gradient overlay */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${client.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                    
                    <div className="relative z-10">
                      {/* Client Logo/Icon */}
                      <div className="flex items-center justify-center mb-6">
                        <div className={`w-20 h-20 bg-gradient-to-br ${client.gradient} rounded-2xl flex items-center justify-center text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                          {client.logo}
                        </div>
                      </div>

                      {/* Client Info */}
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {client.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                          {client.industry}
                        </p>
                      </div>

                      {/* Rating */}
                      <div className="flex justify-center mb-4">
                        {renderStars(client.rating)}
                      </div>

                      {/* Testimonial */}
                      <blockquote className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed italic text-center">
                        &ldquo;{client.testimonial}&rdquo;
                      </blockquote>

                      {/* Decorative quote icon */}
                      <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity">
                        <svg className="w-8 h-8 text-blue-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-full p-4 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50 group"
            aria-label="Previous testimonial"
          >
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl rounded-full p-4 hover:bg-white dark:hover:bg-gray-700 hover:scale-110 transition-all duration-300 border border-blue-200/50 dark:border-blue-700/50 group"
            aria-label="Next testimonial"
          >
            <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 group-hover:text-blue-700 dark:group-hover:text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Enhanced Pagination Dots */}
        <div className="flex justify-center mt-12 space-x-3">
          {clients.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`transition-all duration-300 rounded-full ${
                index === currentSlide
                  ? 'w-8 h-3 bg-blue-600 dark:bg-blue-400 shadow-lg'
                  : 'w-3 h-3 bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500 hover:scale-125'
              }`}
              aria-label={`Go to testimonial ${index + 1}`}
            />
          ))}
        </div>

        {/* Bottom Stats */}
        <div className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">100+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Happy Clients</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">500+</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Projects Done</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">5.0</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Average Rating</div>
          </div>
          <div className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm rounded-xl p-6 border border-blue-100 dark:border-blue-700">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">24/7</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">Support</div>
          </div>
        </div>
      </div>
    </section>
  );
} 