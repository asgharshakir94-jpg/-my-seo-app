'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function DashboardPage() {
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
  const router = useRouter();

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
        }
      }

    } catch (err) {
      alert("Network compilation timeout occurred during generation cycle.");
    } finally {
      setGenerating(false);
    }
  };

  const handleMcpExport = async () => {
    if (!selectedHtml) return alert("Select a campaign item from the sidebar first.");
    try {
      const res = await fetch('/api/mcp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: targetKeyword, html_content: selectedHtml })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        alert("Draft exported cleanly via MCP!");
      } else {
        alert(`Export failed: ${data.error || 'Check server configuration'}`);
      }
    } catch (err) {
      alert("Network transmission error occurred.");
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
        alert("Campaign approved! You can now export it via MCP.");
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
      <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankinSEO <span className="text-sand font-medium">Project Platform</span>
            </span>
          </Link>
          <div className="flex items-center gap-6">
          <Link href="/" className="text-lg font-medium text-ink/70 hover:text-ink transition-colors">
          Home
          </Link>
          <Link href="/#pricing" className="text-lg font-medium text-ink/70 hover:text-ink transition-colors">
          Pricing
          </Link>
          </div>
          <div className="flex items-center gap-3">
          

            <div className="text-xs text-slate font-mono bg-surface px-3 py-2 rounded-md border border-line">
              Engine Status: <span className="text-accent-text font-semibold">gpt-5-mini Live</span>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-bold text-white bg-gradient-to-r from-accent-from to-accent-to rounded-md px-4 py-2 hover:opacity-90 active:scale-95 transition-all duration-200 shadow-accent"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

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
                    }}
                    className={`p-4 rounded-md border transition-all duration-150 cursor-pointer ${
                      targetKeyword === item.keyword
                        ? 'bg-accent-soft border-accent-from/40 shadow-flat'
                        : 'bg-paper border-line hover:border-sand'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <p className={`font-semibold text-sm ${targetKeyword === item.keyword ? 'text-accent-text' : 'text-ink'}`}>{item.keyword}</p>
                      <span className={`h-2 w-2 rounded-full mt-1 flex-shrink-0 ${item.status === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} title={item.status || 'pending_review'} />
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
                <span className={`h-2 w-2 rounded-full ${selectedStatus === 'approved' ? 'bg-green-500' : 'bg-yellow-500'}`} />
                <h2 className="text-xs font-semibold tracking-wider uppercase text-accent-text">
                  Workspace Content Preview {selectedStatus && `— ${selectedStatus.replace('_', ' ')}`}
                </h2>
              </div>
              <div className="flex gap-2">
                {selectedStatus === 'pending_review' && (
                  <button
                    onClick={handleApprove}
                    disabled={approving}
                    className="px-4 py-2 text-xs font-bold text-white rounded-md bg-yellow-600 hover:opacity-90 active:scale-95 transition-all disabled:opacity-60"
                  >
                    {approving ? "Approving..." : "Approve for Export"}
                  </button>
                )}
                <button
                  onClick={handleMcpExport}
                  className="px-4 py-2 text-xs font-bold text-white rounded-md bg-green-600 hover:opacity-90 active:scale-95 transition-all"
                >
                  Export via MCP
                </button>
              </div>
            </div>

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
    </div>
  );
}