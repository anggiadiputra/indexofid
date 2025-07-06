'use client';

import { useState } from 'react';
import Link from 'next/link';

interface NewsletterSignupProps {
  variant?: 'default' | 'sidebar' | 'footer' | 'modal';
  className?: string;
  title?: string;
  description?: string;
  showIcon?: boolean;
}

export default function NewsletterSignup({ 
  variant = 'default',
  className = '',
  title,
  description,
  showIcon = true
}: NewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error' | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Email is required');
      setMessageType('error');
      return;
    }

    setIsSubmitting(true);
    setMessage('');
    setMessageType(null);

    try {
      const response = await fetch('/api/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          name: name || undefined,
          phone: phone || undefined
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Successfully subscribed to newsletter!');
        setMessageType('success');
        setEmail('');
        setName('');
        setPhone('');
      } else {
        setMessage(data.error || 'Failed to subscribe. Please try again.');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Newsletter subscription error:', error);
      setMessage('An error occurred. Please try again.');
      setMessageType('error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getVariantStyles = () => {
    switch (variant) {
      case 'sidebar':
        return {
          container: 'bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-lg border border-gray-100 dark:border-gray-700',
          title: 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-2',
          description: 'text-sm text-gray-600 dark:text-gray-300 mb-4',
          form: 'space-y-3'
        };
      case 'footer':
        return {
          container: 'bg-gray-50 dark:bg-gray-800 rounded-xl p-6',
          title: 'text-lg font-bold text-gray-900 dark:text-gray-100 mb-2',
          description: 'text-sm text-gray-600 dark:text-gray-300 mb-4',
          form: 'space-y-3'
        };
      case 'modal':
        return {
          container: 'bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-2xl border border-gray-200 dark:border-gray-700',
          title: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3',
          description: 'text-base text-gray-600 dark:text-gray-300 mb-6',
          form: 'space-y-4'
        };
      default:
        return {
          container: 'bg-gradient-to-br from-blue-50 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/20 rounded-2xl p-8 border border-blue-200/50 dark:border-blue-700/50',
          title: 'text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3',
          description: 'text-base text-gray-600 dark:text-gray-300 mb-6',
          form: 'space-y-4'
        };
    }
  };

  const styles = getVariantStyles();

  const defaultTitle = title || (variant === 'sidebar' ? 'Newsletter' : 'Dapatkan Update Terbaru');
  const defaultDescription = description || (
    variant === 'sidebar' 
      ? 'Artikel terbaru langsung ke email Anda'
      : 'Berlangganan newsletter kami untuk mendapatkan tips WordPress, artikel terbaru, dan penawaran eksklusif langsung ke email Anda.'
  );

  if (messageType === 'success' && message) {
    return (
      <div className={`${styles.container} ${className}`}>
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Berhasil Berlangganan!</h3>
          <p className="text-sm text-gray-600 dark:text-gray-300">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.container} ${className}`}>
      {showIcon && variant === 'default' && (
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-xl mb-4">
          <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
      )}
      
      <h3 className={styles.title}>{defaultTitle}</h3>
      <p className={styles.description}>{defaultDescription}</p>
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className="relative">
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Your email address"
            disabled={isSubmitting}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-3 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
        >
          {isSubmitting ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
              Subscribing...
            </div>
          ) : (
            <>
              Subscribe
              <svg className="w-4 h-4 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>
        
        {message && (
          <div className={`mt-4 p-3 rounded-lg text-sm ${
            messageType === 'success' 
              ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-700'
              : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-700'
          }`}>
            {message}
          </div>
        )}
        
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Dengan berlangganan, Anda setuju dengan{' '}
          <Link href="/privacy" className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline">
            kebijakan privasi
          </Link>{' '}
          kami. Anda dapat berhenti berlangganan kapan saja.
        </p>
      </form>
    </div>
  );
} 