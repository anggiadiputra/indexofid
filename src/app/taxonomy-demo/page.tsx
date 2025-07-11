import { Suspense } from 'react';
import EnhancedTaxonomy from '@/components/EnhancedTaxonomy';
import { getEnhancedTaxonomyData } from '@/lib/wordpress-api';
import SEOHead from '@/components/SEOHead';
import { env } from '@/config/environment';

// Server-side data fetching for better performance
async function getTaxonomyData() {
  try {
    return await getEnhancedTaxonomyData();
  } catch (error) {
    console.error('Failed to fetch taxonomy data:', error);
    return { categories: [], tags: [] };
  }
}

export default async function TaxonomyDemoPage() {
  const taxonomyData = await getTaxonomyData();

  return (
    <>
      <SEOHead
        customTitle={`Enhanced Taxonomy System Demo | ${env.site.name}`}
        customDescription="Demonstration of enhanced WordPress taxonomy system with automatic category hierarchy, tag popularity scoring, and RankMath SEO integration."
        pageType="WebPage"
        fallbackEnabled={true}
      />

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100 mb-4">
              🚀 Enhanced Taxonomy System
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
              Demonstrasi sistem taxonomy yang enhanced dengan integrasi otomatis WordPress API & RankMath SEO, 
              termasuk hierarchy detection, popularity scoring, dan auto-categorization.
            </p>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                  <span className="text-2xl">📂</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Categories</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {taxonomyData.categories.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                  <span className="text-2xl">🏷️</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tags</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                    {taxonomyData.tags.length}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                  <span className="text-2xl">🔍</span>
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">SEO Integration</p>
                  <p className="text-lg font-bold text-green-600 dark:text-green-400">
                    {taxonomyData.rankMathMeta ? 'Active' : 'Available'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
            
            {/* Vertical Layout Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                📋 Vertical Layout
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Layout vertikal dengan hierarchy detection untuk categories dan popularity scoring untuk tags.
              </p>
              
              <Suspense fallback={
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                </div>
              }>
                <EnhancedTaxonomy
                  layout="vertical"
                  maxCategories={5}
                  maxTags={10}
                  className="max-h-96 overflow-y-auto"
                />
              </Suspense>
            </div>

            {/* Grid Layout Demo */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
                🏗️ Grid Layout
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-4 text-sm">
                Layout grid dengan auto-categorization untuk tags dan path display untuk nested categories.
              </p>
              
              <Suspense fallback={
                <div className="animate-pulse grid grid-cols-2 gap-2">
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                  <div className="h-16 bg-gray-200 rounded"></div>
                </div>
              }>
                <EnhancedTaxonomy
                  layout="grid"
                  maxCategories={6}
                  maxTags={15}
                  className="max-h-96 overflow-y-auto"
                />
              </Suspense>
            </div>
          </div>

          {/* Features List */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 shadow-sm border border-gray-200 dark:border-gray-700 mb-8">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-gray-100 mb-6">
              ✨ Enhanced Features
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              
              {/* Categories Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="mr-2">📂</span>
                  Categories Enhancement
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Hierarchy Detection:</strong> Otomatis mendeteksi parent-child relationships
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Level Calculation:</strong> Menghitung kedalaman nested categories
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Full Path Display:</strong> Menampilkan path lengkap (Tech > Frontend > React)
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Children Detection:</strong> Mendeteksi apakah category memiliki sub-categories
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Empty Categories:</strong> Termasuk categories tanpa posts (hide_empty=false)
                    </div>
                  </li>
                </ul>
              </div>

              {/* Tags Features */}
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4 flex items-center">
                  <span className="mr-2">🏷️</span>
                  Tags Enhancement
                </h3>
                <ul className="space-y-3 text-sm">
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Popularity Scoring:</strong> High/Medium/Low berdasarkan usage frequency
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Auto-Categorization:</strong> Technology, Frontend, Backend, Tutorial, WordPress
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Related Terms:</strong> Otomatis mencari tags yang related
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Visual Indicators:</strong> Fire emoji untuk high popularity tags
                    </div>
                  </li>
                  <li className="flex items-start">
                    <span className="text-green-500 mr-2 mt-1">✓</span>
                    <div>
                      <strong>Color Coding:</strong> Different colors untuk popularity levels
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Technical Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg p-6 border border-blue-200 dark:border-blue-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
              🔧 Technical Implementation
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">WordPress API</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Enhanced API calls dengan _fields parameter</li>
                  <li>• Parallel fetching untuk performance</li>
                  <li>• 12-hour caching dengan fallback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">RankMath Integration</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• SEO metadata untuk taxonomy pages</li>
                  <li>• Schema.org structured data</li>
                  <li>• Meta tags optimization</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Performance</h4>
                <ul className="text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Server-side caching</li>
                  <li>• Client-side suspense loading</li>
                  <li>• Error boundaries dan fallbacks</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Usage Example */}
          <div className="mt-8 bg-gray-800 rounded-lg p-6 overflow-x-auto">
            <h3 className="text-lg font-semibold text-white mb-4">💻 Usage Example</h3>
            <pre className="text-green-400 text-sm">
{`// Basic usage
import EnhancedTaxonomy from '@/components/EnhancedTaxonomy';

<EnhancedTaxonomy 
  layout="vertical"
  maxCategories={10}
  maxTags={20}
  showCategories={true}
  showTags={true}
/>

// Advanced usage with enhanced data
import { getEnhancedTaxonomyData } from '@/lib/wordpress-api';

const data = await getEnhancedTaxonomyData();
console.log(data.categories[0].fullPath); // "Tech > Frontend > React"
console.log(data.tags[0].popularity);    // "high" | "medium" | "low"
console.log(data.rankMathMeta);          // SEO metadata from RankMath`}
            </pre>
          </div>

        </div>
      </div>
    </>
  );
} 