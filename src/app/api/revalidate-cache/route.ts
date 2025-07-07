import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath, revalidateTag } from 'next/cache';
import { clearAllCache } from '@/lib/wordpress-api';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify the request is from Vercel Cron
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    console.log('[Cache Revalidation] Starting cache revalidation process...');

    // Clear WordPress API cache
    clearAllCache();

    // Revalidate key paths
    const pathsToRevalidate = [
      '/',
      '/blog',
      '/services',
      '/search',
      '/tags'
    ];

    for (const path of pathsToRevalidate) {
      revalidatePath(path);
      console.log(`[Cache Revalidation] Revalidated path: ${path}`);
    }

    // Revalidate by tags
    const tagsToRevalidate = [
      'wordpress-posts',
      'wordpress-categories',
      'wordpress-tags',
      'homepage-data'
    ];

    for (const tag of tagsToRevalidate) {
      revalidateTag(tag);
      console.log(`[Cache Revalidation] Revalidated tag: ${tag}`);
    }

    console.log('[Cache Revalidation] Cache revalidation completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Cache revalidated successfully',
      timestamp: new Date().toISOString(),
      revalidatedPaths: pathsToRevalidate,
      revalidatedTags: tagsToRevalidate
    });

  } catch (error) {
    console.error('[Cache Revalidation] Error during cache revalidation:', error);
    
    return NextResponse.json({
      error: 'Cache revalidation failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  return GET(request);
} 