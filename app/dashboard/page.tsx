'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
  const statusColor = (status: string) => {
    if (status === 'exported') return 'bg-purple-500';
    if (status === 'approved') return 'bg-green-500';
    if (status === 'generating') return 'bg-blue-500 animate-pulse';
    return 'bg-yellow-500'; // pending_review or unknown
  };

  const scoreColor = (score: number | null | undefined) => {
    if (score === null || score === undefined) return 'bg-line text-slate';
    if (score >= 80) return 'bg-green-600 text-white';
    if (score >= 50) return 'bg-yellow-600 text-white';
    return 'bg-red-600 text-white';
  };

  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedHtml, setSelectedHtml] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState<string>("");
  const [inputKeyword, setInputKeyword] = useState<string>("");
  const [inputCity, setInputCity] = useState<string>("");
  const [inputIndustry, setInputIndustry] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [approving, setApproving] = useState<boolean>(false);
  const [selectedStatus, setSelectedStatus] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [selectedScore, setSelectedScore] = useState<number | null>(null);
  const [selectedBreakdown, setSelectedBreakdown] = useState<any>(null);
  const [showImageModal, setShowImageModal] = useState<boolean>(false);
  const [imagePosition, setImagePosition] = useState<{ type: 'top' } | { type: 'afterHeading'; index: number }>({ type: 'top' });
  const [imageQuery, setImageQuery] = useState<string>("");
  const [imageResults, setImageResults] = useState<any[]>([]);
  const [imageSearching, setImageSearching] = useState<boolean>(false);
  const [insertingImageId, setInsertingImageId] = useState<string | null>(null);
  const router = useRouter();

  const extractHeadings = (html: string): string[] => {
    const matches = [...html.matchAll(/<h2[^>]*>(.*?)<\/h2>/gi)];
    return matches.map(m => m[1].replace(/<[^>]+>/g, '').trim());
  };

  const handleImageSearch = async () => {
    const query = imageQuery.trim() || targetKeyword;
    if (!query) return;
    setImageSearching(true);
    setImageResults([]);
    try {
      const res = await fetch(`/api/unsplash/search?query=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (Array.isArray(data.results)) setImageResults(data.results);
    } catch (err) {
      alert("Image search failed.");
    } finally {
      setImageSearching(false);
    }
  };

  const handleInsertImage = async (photo: any) => {
    if (!selectedId) return;
    setInsertingImageId(photo.id);
    try {
      const res = await fetch('/api/campaigns/insert-image', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedId,
          position: imagePosition,
          imageUrl: photo.fullUrl,
          alt: photo.alt,
          credit: photo.credit,
          creditUrl: photo.creditUrl,
        })
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Failed to insert image.");
        return;
      }
      setSelectedHtml(data.content);
      setSelectedScore(data.seo_score);
      setSelectedBreakdown(data.seo_score_breakdown);
      setCampaigns(prev => prev.map(c => c.id === selectedId ? { ...c, seo_score: data.seo_score, seo_score_breakdown: data.seo_score_breakdown } : c));
      setShowImageModal(false);
      setImageResults([]);
      setImageQuery("");
    } catch (err) {
      alert("Network error inserting image.");
    } finally {
      setInsertingImageId(null);
    }
  };

  const handleLogout = async () => {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push('/login');
    router.refresh();
  };

  const loadData = async () => {
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error('API server error');
      const data = await res.json();
      if (Array.isArray(data)) setCampaigns(data);
    } catch (err) {
      console.error("Database tracking hydration failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleLaunchPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputKeyword.trim()) return alert("Please enter a target keyword first!");
    setGenerating(true);
    setSelectedHtml("");
    setSelectedStatus("");
    setSelectedId(null);
    setSelectedScore(null);
    setSelectedBreakdown(null);
    setTargetKeyword(inputKeyword);

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          keyword: inputKeyword,
          city: inputCity.trim() || undefined,
          industry: inputIndustry.trim() || undefined
        })
      });

      if (!res.ok || !res.body) {
        alert("Pipeline failed. Ensure your OpenAI configuration keys are loaded.");
        setGenerating(false);
        return;
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        fullText += decoder.decode(value, { stream: true });
        setSelectedHtml(fullText);
      }

      setInputKeyword("");
      setInputCity("");
      setInputIndustry("");

      const historyRes = await fetch('/api/history');
      const historyData = await historyRes.json();
      if (Array.isArray(historyData)) {
        setCampaigns(historyData);
        const newest = historyData[0];
        if (newest) {
          setSelectedId(newest.id);
          setSelectedStatus(newest.status || 'pending_review');
          setSelectedScore(newest.seo_score ?? null);
          setSelectedBreakdown(newest.seo_score_breakdown ?? null);
        }
      }

    } catch (err) {
      alert("Network compilation timeout occurred during generation cycle.");
    } finally {
      setGenerating(false);
    }
  };

    const handleApprove = async () => {
    if (!selectedId) return;
    setApproving(true);
    try {
      const res = await fetch('/api/approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedId })
      });
      if (res.ok) {
        setSelectedStatus('approved');
        alert("Campaign approved! It will now appear on your blog.");
        await loadData();
      } else {
        alert("Approval failed.");
      }
    } catch (err) {
      alert("Network error during approval.");
    } finally {
      setApproving(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent-soft">
      <div className="border-b border-line bg-surface px-4 py-3">
      <div className="max-w-7xl mx-auto flex justify-end items-center gap-3">
      <div className="text-xs text-slate font-mono bg-paper px-3 py-2 rounded-md border border-line">
       Engine: <span className="text-accent-text font-semibold">gpt-5.6-terra</span> · Risk-check: <span className="text-accent-text font-semibold">gpt-5-mini</span>
      </div>
      <button
      onClick={handleLogout}
      className="text-xs font-bold text-white bg-gradient-to-r from-accent-from to-accent-to rounded-md px-4 py-2 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-accent"
    >
      Log out
     </button>
     </div>
     </div>

      <main className="max-w-7xl mx-auto p-4 md:p-4 space-y-4">
        <div className="pt-8 pb-4 px-2">
          <h1 className="text-3xl font-bold tracking-tight text-ink">Workspace Dashboard</h1>
          <p className="mt-2 text-slate">Manage and launch your SEO content pipeline.</p>
        </div>

        <div className="bg-surface border border-line rounded-lg p-4 shadow-flat flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">RankinSEO Workspace Dashboard</h2>
            <p className="text-xs text-slate mt-1">Autonomous Optimization Engine Pipeline</p>
          </div>
          <form onSubmit={handleLaunchPipeline} className="w-full md:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <input
              type="text"
              placeholder="Enter target keyword..."
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              disabled={generating}
              className="bg-paper border border-line rounded-md px-4 py-2 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from w-full md:w-56 transition-all duration-200"
            />
            <input
              type="text"
              placeholder="City, Country (optional)"
              value={inputCity}
              onChange={(e) => setInputCity(e.target.value)}
              disabled={generating}
              className="bg-paper border border-line rounded-md px-4 py-2 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from w-full md:w-48 transition-all duration-200"
            />
            <input
              type="text"
              placeholder="Industry (optional)"
              value={inputIndustry}
              onChange={(e) => setInputIndustry(e.target.value)}
              disabled={generating}
              className="bg-paper border border-line rounded-md px-4 py-2 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from w-full md:w-44 transition-all duration-200"
            />
            <button
              type="submit"
              disabled={generating}
              className="bg-gradient-to-r from-accent-from to-accent-to hover:opacity-90 disabled:opacity-60 text-white text-xs font-bold px-4 py-2 rounded-md transition-all duration-200 active:scale-95 whitespace-nowrap shadow-accent"
            >
              {generating ? "Generating..." : "Launch Pipeline"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-1 flex flex-col bg-surface border border-line rounded-lg p-4 shadow-flat h-[600px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-line">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-slate">Campaign History Logs</h2>
              <span className="text-xs bg-paper text-slate px-2 py-1 rounded-sm border border-line font-medium">{campaigns.length} tracks</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-sand italic">Syncing database clusters...</div>
              ) : campaigns.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-sm font-medium text-sand">No campaigns yet</p>
                </div>
              ) : (
                campaigns.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      setSelectedHtml(item.html_content || item.content || "");
                      setTargetKeyword(item.keyword || "Untitled Campaign");
                      setSelectedStatus(item.status || "pending_review");
                      setSelectedId(item.id);
                      setSelectedScore(item.seo_score ?? null);
                      setSelectedBreakdown(item.seo_score_breakdown ?? null);
                    }}
                    className={`p-4 rounded-md border transition-all duration-150 cursor-pointer ${
                      targetKeyword === item.keyword
                        ? 'bg-accent-soft border-accent-from/40 shadow-flat'
                        : 'bg-paper border-line hover:border-sand'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className={`font-semibold text-sm ${targetKeyword === item.keyword ? 'text-accent-text' : 'text-ink'}`}>{item.keyword}</p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {item.seo_score !== null && item.seo_score !== undefined && (
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${scoreColor(item.seo_score)}`}>
                            {item.seo_score}
                          </span>
                        )}
                        <span className={`h-2 w-2 rounded-full mt-0.5 flex-shrink-0 ${statusColor(item.status)}`} title={item.status || 'pending_review'} />
                      </div>
                    </div>
                    <p className="text-[11px] text-sand mt-2 font-mono">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col bg-surface border border-line rounded-lg p-4 shadow-flat h-[600px]">
            <div className="flex justify-between items-center border-b border-line pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className={`h-2 w-2 rounded-full ${statusColor(selectedStatus)}`} />
                <h2 className="text-xs font-semibold tracking-wider uppercase text-accent-text">
                  Workspace Content Preview {selectedStatus && `— ${selectedStatus.replace('_', ' ')}`}
                </h2>
              </div>
              <div className="flex gap-2">
                {selectedId && (
                  <button
                    onClick={() => { setImagePosition({ type: 'top' }); setImageQuery(targetKeyword); setShowImageModal(true); }}
                    className="px-4 py-2 text-xs font-bold text-ink rounded-md border border-line bg-paper hover:border-sand active:scale-95 transition-all"
                  >
                    + Add Image
                  </button>
                )}
                {selectedStatus === 'pending_review' && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="px-4 py-2 text-xs font-bold text-white rounded-md bg-yellow-600 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {approving ? "Approving..." : "Approve for Export"}
                  </button>
                )}
              </div>
            </div>

            {selectedScore !== null && selectedBreakdown && (
              <div className="mb-4 p-3 rounded-md border border-line bg-paper">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold tracking-wider uppercase text-slate">SEO Score</span>
                  <span className={`text-sm font-bold px-2 py-0.5 rounded ${scoreColor(selectedScore)}`}>
                    {selectedScore}/100
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[11px]">
                  <div>
                    <p className="text-slate">Words</p>
                    <p className="font-semibold text-ink">{selectedBreakdown.wordCount}</p>
                  </div>
                  <div>
                    <p className="text-slate">Keyword density</p>
                    <p className="font-semibold text-ink">{selectedBreakdown.keywordDensity}%</p>
                  </div>
                  <div>
                    <p className="text-slate">Headings</p>
                    <p className="font-semibold text-ink">{selectedBreakdown.headingCount}</p>
                  </div>
                  <div>
                    <p className="text-slate">Links</p>
                    <p className="font-semibold text-ink">{selectedBreakdown.linkCount}</p>
                  </div>
                  <div>
                    <p className="text-slate">Images</p>
                    <p className="font-semibold text-ink">{selectedBreakdown.imageCount}</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto pr-1">
              {selectedHtml ? (
                <div className="prose prose-sm max-w-none text-ink leading-relaxed border border-line bg-paper p-4 rounded-md" dangerouslySetInnerHTML={{ __html: selectedHtml }} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-sand italic text-sm">
                  Select a campaign from the sidebar to load content.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showImageModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowImageModal(false)}>
          <div className="bg-surface border border-line rounded-lg p-4 w-full max-w-2xl max-h-[80vh] flex flex-col shadow-flat" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-ink">Add Image from Unsplash</h3>
              <button onClick={() => setShowImageModal(false)} className="text-slate hover:text-ink text-sm">✕</button>
            </div>

            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <select
                value={imagePosition.type === 'top' ? 'top' : String(imagePosition.index)}
                onChange={(e) => {
                  const val = e.target.value;
                  setImagePosition(val === 'top' ? { type: 'top' } : { type: 'afterHeading', index: Number(val) });
                }}
                className="bg-paper border border-line rounded-md px-3 py-2 text-xs text-ink focus:outline-none focus:ring-2 focus:ring-accent-from/30"
              >
                <option value="top">Top of article</option>
                {extractHeadings(selectedHtml).map((heading, i) => (
                  <option key={i} value={i}>After: {heading.slice(0, 40)}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Search Unsplash..."
                value={imageQuery}
                onChange={(e) => setImageQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleImageSearch()}
                className="flex-1 bg-paper border border-line rounded-md px-3 py-2 text-xs text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30"
              />
              <button
                onClick={handleImageSearch}
                disabled={imageSearching}
                className="bg-gradient-to-r from-accent-from to-accent-to text-white text-xs font-bold px-4 py-2 rounded-md disabled:opacity-60"
              >
                {imageSearching ? "Searching..." : "Search"}
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {imageResults.length === 0 ? (
                <p className="text-xs text-sand italic text-center py-8">
                  {imageSearching ? "Searching Unsplash..." : "Search for an image above."}
                </p>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {imageResults.map((photo) => (
                    <button
                      key={photo.id}
                      onClick={() => handleInsertImage(photo)}
                      disabled={insertingImageId === photo.id}
                      className="relative rounded-md overflow-hidden border border-line hover:border-accent-from transition-all disabled:opacity-50"
                    >
                      <img src={photo.thumbUrl} alt={photo.alt} className="w-full h-24 object-cover" />
                      {insertingImageId === photo.id && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center text-white text-[10px]">Adding...</div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
