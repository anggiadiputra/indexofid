import { Metadata } from 'next';
import DomainChecker from './DomainChecker';

export const metadata: Metadata = {
  title: 'Domain Extension Info - IndexOf.ID',
  description: 'Check domain extension pricing and availability information. Get instant domain pricing for various TLDs including .com, .id, and more.',
  keywords: 'domain extension, domain pricing, TLD prices, domain checker, domain availability',
};

export default function DomainPage() {
  return (
    <div className="min-h-screen bg-neutral-900 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full bg-neutral-800 rounded-xl shadow-lg p-8 mt-16">
        <h1 className="text-3xl font-bold text-white mb-6 text-center">Domain Extension Info</h1>
        <DomainChecker />
      </div>
    </div>
  );
} 