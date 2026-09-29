"use client";

import { useState } from 'react';

export default function BacklinkChecker() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState('');

  const handleCheck = async (e) => {
    e.preventDefault();
    if (!url) return;

    setLoading(true);
    setError('');
    setResults(null);

    try {
      const response = await fetch('/api/check-backlinks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetUrl: url }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Something went wrong');
      
      setResults(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto my-12 p-6 bg-white rounded-xl shadow-md border border-gray-100">
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">🚀 Free Backlink Seeker & Checker</h2>
        <p className="text-gray-600 text-sm">Analyze any domain or URL to discover incoming backlink connections instantly.</p>
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
          {loading ? 'Analyzing...' : 'Find Backlinks'}
        </button>
      </form>

      {error && <div className="p-3 bg-red-50 text-red-600 rounded-lg text-sm mb-6">{error}</div>}

      {results && (
        <div className="border-t border-gray-200 pt-6">
          <div className="grid grid-cols-3 gap-4 text-center mb-6">
            <div className="p-3 bg-blue-50 rounded-lg">
              <span className="block text-xl font-bold text-blue-700">{results.totalBacklinks}</span>
              <span className="text-xs text-gray-500 font-medium">Total Backlinks</span>
            </div>
            <div className="p-3 bg-green-50 rounded-lg">
              <span className="block text-xl font-bold text-green-700">{results.domainAuthority}</span>
              <span className="text-xs text-gray-500 font-medium">Domain Authority</span>
            </div>
            <div className="p-3 bg-purple-50 rounded-lg">
              <span className="block text-xl font-bold text-purple-700">{results.referringDomains}</span>
              <span className="text-xs text-gray-500 font-medium">Referring Domains</span>
            </div>
          </div>

          <h3 className="font-semibold text-gray-700 mb-3 text-sm">Top Referring Sources:</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-gray-50 text-gray-500">
                  <th className="p-2 border-b">Source Page URL</th>
                  <th className="p-2 border-b text-center">Anchor Text</th>
                  <th className="p-2 border-b text-center">Type</th>
                </tr>
              </thead>
              <tbody>
                {results.links.map((link, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 text-gray-600">
                    <td className="p-2 border-b max-w-xs truncate text-blue-600 underline">
                      <a href={link.source} target="_blank" rel="noopener noreferrer">{link.source}</a>
                    </td>
                    <td className="p-2 border-b text-center italic">"{link.anchor}"</td>
                    <td className="p-2 border-b text-center">
                      <span className={`px-2 py-0.5 rounded text-xs font-semibold ${link.isNoFollow ? 'bg-orange-100 text-orange-700' : 'bg-green-100 text-green-700'}`}>
                        {link.isNoFollow ? 'NoFollow' : 'DoFollow'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
