"use client";

import { useState } from 'react';

const PAGE_SIZE = 10;

export default function BacklinkChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');
  const [visible, setVisible] = useState(PAGE_SIZE);

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResults(null);
    setVisible(PAGE_SIZE);

    try {
      const response = await fetch('/api/check-backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });

      let data;
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }

      if (!response.ok) {
        throw new Error(data?.message || 'Something went wrong');
      }

      setResults(data);
    } catch (err) {
      setError(err.message || 'Network error occurred');
    } finally {
      setLoading(false);
    }
  };

  const links = (results && results.links) || [];
  const total = (results && results.totalBacklinks) || 0;
  const shownCount = Math.min(visible, links.length);
  const hasMoreToReveal = shownCount < links.length;
  const listWasCapped = total > links.length;

  return (
    <div className="max-w-3xl mx-auto my-12 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Free Outbound Link Checker</h2>
        <p className="text-gray-600 text-sm">
          Enter any page URL to see every external site it links to, with anchor text and follow status.
        </p>
      </div>

      <form onSubmit={handleCheck} className="flex flex-col sm:flex-row gap-3 mb-6">
        <input
          type="url"
          required
          placeholder="https://example.com"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          className="flex-grow p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white font-medium px-6 py-3 rounded-lg hover:bg-blue-700 transition disabled:bg-gray-400"
        >
          {loading ? 'Analyzing...' : 'Check Links'}
        </button>
      </form>

      {error && (
        <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-6 border border-red-200">
          {error}
        </div>
      )}

      {results && (
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-2 gap-4 text-center mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="block text-xl font-bold text-blue-700">{results.totalBacklinks ?? 0}</span>
              <span className="text-xs text-gray-500 font-medium">External Links Found</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <span className="block text-xl font-bold text-purple-700">{results.referringDomains ?? 0}</span>
              <span className="text-xs text-gray-500 font-medium">Unique Domains</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-3 text-sm">
            {total > shownCount
              ? `Showing ${shownCount} of ${total} external links found on this page:`
              : 'Links found on this page:'}
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="p-2 border-b">Linked URL</th>
                  <th className="p-2 border-b text-center">Anchor Text</th>
                  <th className="p-2 border-b text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {links.length > 0 ? (
                  links.slice(0, shownCount).map((link, idx) => (
                    <tr key={link.source + idx} className="hover:bg-gray-50 text-gray-600">
                      <td className="p-2 border-b max-w-xs truncate">
                        <a
                          href={link.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 underline inline-block w-full cursor-pointer"
                        >
                          {link.source}
                        </a>
                      </td>
                      <td className="p-2 border-b text-center italic">"{link.anchor || 'No Anchor'}"</td>
                      <td className="p-2 border-b text-center">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${link.isNoFollow ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                          {link.isNoFollow ? 'NoFollow' : 'DoFollow'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-gray-400">
                      No external links found on this page.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {hasMoreToReveal && (
            <div className="flex items-center justify-center gap-3 mt-4">
              <button
                type="button"
                onClick={() => setVisible((v) => v + PAGE_SIZE)}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                Show {Math.min(PAGE_SIZE, links.length - shownCount)} more
              </button>
              <button
                type="button"
                onClick={() => setVisible(links.length)}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                Show all
              </button>
            </div>
          )}

          {!hasMoreToReveal && listWasCapped && (
            <p className="text-xs text-gray-400 text-center mt-4">
              This page has more links than we can list. Showing the first {links.length}.
            </p>
          )}
        </div>
      )}
    </div>
  );
}