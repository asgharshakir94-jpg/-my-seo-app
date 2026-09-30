import BacklinkChecker from '@/components/BacklinkChecker';

export const metadata = {
  title: 'Free Backlink Checker & Seeker Tool | RankinSEO',
  description: 'Instantly find and analyze incoming backlinks for any domain or URL for free.',
};

export default function BacklinkSeekerPage() {
  return (
    <main className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <BacklinkChecker />
      </div>
    </main>
  );
}
