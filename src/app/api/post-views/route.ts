import { NextRequest, NextResponse } from 'next/server';

interface ViewData {
  postId: number;
  slug: string;
  timestamp: string;
}

// In-memory storage for demo purposes
// In production, you'd want to use a database
const viewsStorage = new Map<string, { count: number; lastUpdated: string }>();

export async function POST(request: NextRequest) {
  try {
    const body: ViewData = await request.json();
    const { postId, slug, timestamp } = body;

    // Validate input
    if (!postId || !slug || !timestamp) {
      return NextResponse.json(
        { error: 'Missing required fields: postId, slug, timestamp' },
        { status: 400 }
      );
    }

    // Get current view count
    const currentData = viewsStorage.get(slug) || { count: 0, lastUpdated: timestamp };
    
    // Increment view count
    const newCount = currentData.count + 1;
    viewsStorage.set(slug, {
      count: newCount,
      lastUpdated: timestamp,
    });

    // Log for debugging (remove in production)
    console.log(`Post view tracked: ${slug} - ${newCount} views`);

    return NextResponse.json({
      success: true,
      slug,
      viewCount: newCount,
      timestamp,
    });
  } catch (error) {
    console.error('Error tracking post view:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');

    if (slug) {
      // Get view count for specific post
      const data = viewsStorage.get(slug);
      return NextResponse.json({
        slug,
        viewCount: data?.count || 0,
        lastUpdated: data?.lastUpdated || null,
      });
    } else {
      // Get all view counts
      const allViews = Array.from(viewsStorage.entries()).map(([slug, data]) => ({
        slug,
        viewCount: data.count,
        lastUpdated: data.lastUpdated,
      }));

      return NextResponse.json({
        views: allViews,
        total: allViews.length,
      });
    }
  } catch (error) {
    console.error('Error fetching post views:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 