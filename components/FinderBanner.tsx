import Link from 'next/link';

export default function FinderBanner() {
  return (
    <div className="bg-ink text-paper text-center text-sm py-2 px-4">
      <span className="mr-2">Free tool: find sites that will link to your trade business.</span>
      <Link
        href="/tools/backlink-opportunity-finder"
        className="inline-block rounded-full bg-green-500 px-3 py-1 font-semibold text-black hover:bg-green-400"
      >
        Try it free &rarr;
      </Link>
    </div>
  );
}