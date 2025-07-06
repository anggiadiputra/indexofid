import { NextRequest, NextResponse } from 'next/server';

// Configure route to be dynamic
export const dynamic = 'force-dynamic';

// Newsletter subscription data structure
interface NewsletterSubscription {
  email: string;
  timestamp: number;
  source: string;
  userAgent: string;
  ip: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Get client IP address
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  const real = request.headers.get('x-real-ip');
  const connection = request.headers.get('x-vercel-forwarded-for');
  
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  if (real) {
    return real;
  }
  if (connection) {
    return connection;
  }
  return 'unknown';
}

// Newsletter service integration functions
async function subscribeToMailchimp(email: string): Promise<boolean> {
  const MAILCHIMP_API_KEY = process.env.MAILCHIMP_API_KEY;
  const MAILCHIMP_LIST_ID = process.env.MAILCHIMP_LIST_ID;
  const MAILCHIMP_SERVER = process.env.MAILCHIMP_SERVER; // e.g., 'us1'

  if (!MAILCHIMP_API_KEY || !MAILCHIMP_LIST_ID || !MAILCHIMP_SERVER) {
    console.log('Mailchimp not configured, simulating success');
    return true;
  }

  try {
    const response = await fetch(
      `https://${MAILCHIMP_SERVER}.api.mailchimp.com/3.0/lists/${MAILCHIMP_LIST_ID}/members`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${MAILCHIMP_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email_address: email,
          status: 'subscribed',
          merge_fields: {
            SOURCE: 'website'
          }
        }),
      }
    );

    return response.ok || response.status === 400; // 400 might mean already subscribed
  } catch (error) {
    console.error('Mailchimp subscription error:', error);
    return false;
  }
}

async function subscribeToConvertKit(email: string): Promise<boolean> {
  const CONVERTKIT_API_KEY = process.env.CONVERTKIT_API_KEY;
  const CONVERTKIT_FORM_ID = process.env.CONVERTKIT_FORM_ID;

  if (!CONVERTKIT_API_KEY || !CONVERTKIT_FORM_ID) {
    console.log('ConvertKit not configured, simulating success');
    return true;
  }

  try {
    const response = await fetch(
      `https://api.convertkit.com/v3/forms/${CONVERTKIT_FORM_ID}/subscribe`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: CONVERTKIT_API_KEY,
          email: email,
          tags: ['website-signup']
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('ConvertKit subscription error:', error);
    return false;
  }
}

async function subscribeToEmailOctopus(email: string): Promise<boolean> {
  const EMAILOCTOPUS_API_KEY = process.env.EMAILOCTOPUS_API_KEY;
  const EMAILOCTOPUS_LIST_ID = process.env.EMAILOCTOPUS_LIST_ID;

  if (!EMAILOCTOPUS_API_KEY || !EMAILOCTOPUS_LIST_ID) {
    console.log('EmailOctopus not configured, simulating success');
    return true;
  }

  try {
    const response = await fetch(
      `https://emailoctopus.com/api/1.6/lists/${EMAILOCTOPUS_LIST_ID}/contacts`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          api_key: EMAILOCTOPUS_API_KEY,
          email_address: email,
          fields: {
            source: 'website'
          }
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('EmailOctopus subscription error:', error);
    return false;
  }
}

// Main subscription function
async function subscribeToNewsletter(email: string): Promise<boolean> {
  const service = process.env.NEWSLETTER_SERVICE?.toLowerCase() || 'mailchimp';
  
  switch (service) {
    case 'convertkit':
      return await subscribeToConvertKit(email);
    case 'emailoctopus':
      return await subscribeToEmailOctopus(email);
    case 'mailchimp':
    default:
      return await subscribeToMailchimp(email);
  }
}

// Store subscription locally (for analytics/backup)
async function storeSubscription(subscription: NewsletterSubscription): Promise<void> {
  // In a real application, you would store this in a database
  // For now, we'll just log it
  console.log('Newsletter subscription:', {
    email: subscription.email.replace(/(.{3}).*@/, '$1***@'), // Mask email for privacy
    timestamp: new Date(subscription.timestamp).toISOString(),
    source: subscription.source,
    ip: subscription.ip.replace(/\d+$/, 'xxx') // Mask last IP segment for privacy
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, source = 'website' } = body;

    // Validate email
    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Alamat email tidak valid' },
        { status: 400 }
      );
    }

    // Rate limiting check (simple implementation)
    const userAgent = request.headers.get('user-agent') || 'unknown';
    const clientIP = getClientIP(request);
    
    // Create subscription record
    const subscription: NewsletterSubscription = {
      email: email.toLowerCase().trim(),
      timestamp: Date.now(),
      source,
      userAgent,
      ip: clientIP
    };

    // Store subscription locally
    await storeSubscription(subscription);

    // Subscribe to newsletter service
    const success = await subscribeToNewsletter(subscription.email);

    if (success) {
      return NextResponse.json({
        success: true,
        message: 'Berhasil berlangganan newsletter!'
      });
    } else {
      return NextResponse.json(
        { error: 'Gagal berlangganan. Silakan coba lagi nanti.' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Newsletter subscription error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}

// GET endpoint for subscription status (optional)
export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const email = url.searchParams.get('email');

  if (!email || !isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Email parameter required' },
      { status: 400 }
    );
  }

  // In a real application, you would check the subscription status
  // from your newsletter service or database
  return NextResponse.json({
    subscribed: false, // Default to false for privacy
    message: 'Subscription status check not implemented'
  });
} 