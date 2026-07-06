'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Page() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedHtml, setSelectedHtml] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState<string>("");
  const [inputKeyword, setInputKeyword] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false);
  const [email, setEmail] = useState<string>("");
  const [subscribing, setSubscribing] = useState<boolean>(false);

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
    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: inputKeyword })
      });
      if (res.ok) {
        setInputKeyword("");
        alert("Pipeline completed! New article saved directly to database clusters.");
        await loadData();
      } else {
        alert("Pipeline failed. Ensure your OpenAI configuration keys are loaded.");
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

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubscribing(true);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        alert("Subscribed! Thanks for joining.");
        setEmail("");
      } else {
        alert(data.error || "Something went wrong.");
      }
    } catch (err) {
      alert("Network error occurred.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper text-ink font-sans antialiased selection:bg-accent-soft">
      <nav className="border-b border-line bg-paper/90 backdrop-blur-md sticky top-0 z-50 px-4 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-r from-accent-from to-accent-to shadow-accent" />
            <span className="font-bold tracking-tight text-lg text-ink">
              RankYou <span className="text-sand font-medium">Project Platform</span>
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6 text-sm font-medium text-slate">
            <a href="#" className="hover:text-ink transition-colors">What's Inside</a>
            <a href="#" className="hover:text-ink transition-colors">Pricing</a>
            <a href="#" className="hover:text-ink transition-colors">FAQ</a>
          </div>

          <div className="text-xs text-slate font-mono bg-surface px-3 py-2 rounded-md border border-line">
            Engine Status: <span className="text-accent-text font-semibold">gpt-4o-mini Live</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-4 md:p-4 space-y-4">
        <div className="pt-16 pb-4 px-2">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-ink leading-tight">
            Publish SEO content while<br />you focus on everything else.
          </h1>
          <p className="mt-4 text-lg text-slate max-w-2xl">
            RankYou researches keywords, drafts optimized articles, and pushes them
            straight to your CMS — so your traffic keeps growing without you
            touching a keyboard.
          </p>
          <div className="mt-6 flex items-center gap-4">
            <Link href="/quiz">
            <button className="px-8 py-4 bg-black text-white rounded-md font-medium text-base">
             Get Traffic on Robotic Pilot
            </button>
            </Link>

            <button className="flex items-center gap-2 px-6 py-4 border border-line rounded-md font-medium text-ink hover:bg-surface transition-colors">
            <span className="h-6 w-6 rounded-full bg-gradient-to-r from-accent-from to-accent-to" />
            View Demo
            </button>
            </div>
          </div>
          

        <div className="bg-surface border border-line rounded-lg p-4 shadow-flat flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-ink">RankYou Workspace Dashboard</h2>
            <p className="text-xs text-slate mt-1">Autonomous Optimization Engine Pipeline</p>
          </div>
          <form onSubmit={handleLaunchPipeline} className="w-full md:w-auto flex items-center gap-2">
            <input
              type="text"
              placeholder="Enter target keyword..."
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              disabled={generating}
              className="bg-paper border border-line rounded-md px-4 py-2 text-sm text-ink placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from w-full md:w-64 transition-all duration-200"
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
                      setSelectedHtml(item.html_content || "");
                      setTargetKeyword(item.keyword || "Untitled Campaign");
                    }}
                    className={`p-4 rounded-md border transition-all duration-150 cursor-pointer ${
                      targetKeyword === item.keyword
                        ? 'bg-accent-soft border-accent-from/40 shadow-flat'
                        : 'bg-paper border-line hover:border-sand'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${targetKeyword === item.keyword ? 'text-accent-text' : 'text-ink'}`}>{item.keyword}</p>
                    <p className="text-[11px] text-sand mt-2 font-mono">{item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col bg-surface border border-line rounded-lg p-4 shadow-flat h-[600px]">
            <div className="flex justify-between items-center border-b border-line pb-4 mb-4">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-accent-to" />
                <h2 className="text-xs font-semibold tracking-wider uppercase text-accent-text">Workspace Content Preview</h2>
              </div>
              <button onClick={handleMcpExport} className="px-4 py-2 text-xs font-bold text-white rounded-md bg-gradient-to-r from-accent-from to-accent-to shadow-accent hover:opacity-90 active:scale-95 transition-all">
                Export via MCP
              </button>
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

        <div className="bg-surface border border-line rounded-lg p-6 shadow-flat">
          <h2 className="text-lg font-bold text-ink mb-1">Get notified about new features</h2>
          <p className="text-sm text-slate mb-4">
            Join other site owners getting updates on RankYou.
          </p>
          <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
            <input
              type="email"
              required
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={subscribing}
              className="flex-1 px-4 py-2 border border-line rounded-md text-ink bg-paper placeholder-sand focus:outline-none focus:ring-2 focus:ring-accent-from/30 focus:border-accent-from"
            />
            <button
              type="submit"
              disabled={subscribing}
              className="px-4 py-2 bg-black text-white rounded-md font-medium hover:bg-ink/90 transition-colors disabled:opacity-60 whitespace-nowrap"
            >
              {subscribing ? "Subscribing..." : "Subscribe"}
            </button>
          </form>
        </div>

      </main>
    </div>
  );
}