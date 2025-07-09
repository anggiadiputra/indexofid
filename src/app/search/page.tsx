import { Suspense } from 'react';
import { Metadata } from 'next';
import SearchResults from './SearchResults';

// ISR configuration for search page
export const revalidate = 3600; // Revalidate every hour

interface SearchPageProps {
  searchParams: Promise<{
    search?: string;
    categories?: string;
    tags?: string;
    dateFrom?: string;
    dateTo?: string;
    orderBy?: 'relevance' | 'date' | 'title';
    page?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const resolvedSearchParams = await searchParams;
  const query = resolvedSearchParams.search || '';
  
  return {
    title: query ? `Hasil Pencarian: "${query}" | Blog` : 'Pencarian | Blog',
    description: query 
      ? `Temukan artikel terkait "${query}" di blog kami. Hasil pencarian dengan filter kategori, tag, dan tanggal.`
      : 'Cari artikel di blog kami dengan fitur pencarian canggih. Filter berdasarkan kategori, tag, dan tanggal publikasi.',
    openGraph: {
      title: query ? `Hasil Pencarian: "${query}"` : 'Pencarian Blog',
      description: query 
        ? `Temukan artikel terkait "${query}" di blog kami.`
        : 'Cari artikel dengan fitur pencarian canggih.',
      type: 'website',
    },
    robots: {
      index: false, // Don't index search results pages
      follow: true,
    },
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolvedSearchParams = await searchParams;
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              {resolvedSearchParams.search ? 'Hasil Pencarian' : 'Pencarian Artikel'}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
              {resolvedSearchParams.search 
                ? `Menampilkan hasil pencarian untuk "${resolvedSearchParams.search}"`
                : 'Gunakan pencarian canggih untuk menemukan artikel yang Anda cari'
              }
            </p>
          </div>
        </div>

        {/* Search Results Component */}
        <Suspense fallback={<SearchResultsSkeleton />}>
          <SearchResults searchParams={resolvedSearchParams} />
        </Suspense>
      </div>
    </div>
  );
}

// Loading skeleton component
function SearchResultsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {/* Search Bar Skeleton */}
      <div className="lg:col-span-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse">
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
          </div>
        </div>
      </div>

      {/* Filters Skeleton */}
      <div className="lg:col-span-1">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="space-y-2">
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-4/6"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Results Skeleton */}
      <div className="lg:col-span-3">
        <div className="space-y-6">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="flex space-x-4">
                  <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-lg flex-shrink-0"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-5/6"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 