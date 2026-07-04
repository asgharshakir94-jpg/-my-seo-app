"use client";

import React, { useState, useEffect } from 'react';

interface HistoryItem {
  id: string;
  keyword: string;
  created_at: string;
  content?: string;
}

export default function RankYouApp() {
  const [keyword, setKeyword] = useState<string>("");
  const [htmlContent, setHtmlContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [email, setEmail] = useState<string>("");
  const [isSubmittingEmail, setIsSubmittingEmail] = useState<boolean>(false);
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const [campaignHistory, setCampaignHistory] = useState<HistoryItem[]>([]);

  const fetchHistoryLogs = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setCampaignHistory(data);
      }
    } catch (err) {
      console.error("Failed to query history log tracks:", err);
    }
  };

  useEffect(() => {
    fetchHistoryLogs();
  }, []);

  const handleEmailSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || isSubmittingEmail) return;

    setIsSubmittingEmail(true);
    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (response.ok) {
        setSubscribed(true);
        setEmail("");
      } else {
        const errData = await response.json();
        alert(errData.error || "Subscription pipeline failed.");
      }
    } catch (error) {
      alert("Network connectivity issue. Please try again.");
    } finally {
      setIsSubmittingEmail(false);
    }
  };

  const handleLaunchPipeline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim() || isLoading) return;

    setHtmlContent("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ keyword: keyword.trim() }),
      });

      if (!response.body) throw new Error("No payload data stream returned.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let currentText = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        currentText += decoder.decode(value);
        setHtmlContent(currentText); 
      }
      
      fetchHistoryLogs();
    } catch (error) {
      alert("Failed to establish stream connection with the generation engine.");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-[#FAF8F5] text-slate-800 antialiased font-sans">
      <header className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-5 w-5 rounded bg-gradient-to-tr from-rose-500 to-amber-500 shadow-md shadow-rose-500/20" />
          <span className="text-xl font-extrabold tracking-tight font-mono text-slate-900">RankYou</span>
        </div>
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#" className="hover:text-rose-500 transition-colors">Interactive Demo</a>
          <a href="#" className="hover:text-rose-500 transition-colors">CMS Integrations</a>
          <a href="#" className="hover:text-rose-500 transition-colors">Database Sync</a>
        </nav>
        <button className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm rounded-lg transition-all shadow-sm">Sign In</button>
      </header>

      <section className="max-w-4xl mx-auto text-center pt-16 pb-12 px-6">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.1] mb-6 max-w-4xl mx-auto">
          Own the Search Rankings <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-500 to-amber-500">Traffic on Autopilot</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed mb-8">
          Grow organic traffic continuously. Publish conversion-optimized articles to your website and scale your visibility even while you sleep.
        </p>

        <div className="max-w-md mx-auto mb-20">
          {subscribed ? (
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-800 text-sm font-semibold font-mono text-center shadow-sm">
              ✨ Welcome aboard! Your access spot has been locked in database.
            </div>
          ) : (
            <form onSubmit={handleEmailSubscribe} className="flex gap-2 p-1.5 bg-white border border-orange-100 rounded-xl shadow-md shadow-amber-900/5">
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Enter your email for early access..." className="flex-1 bg-transparent px-3 text-sm focus:outline-none" disabled={isSubmittingEmail} />
              <button type="submit" disabled={isSubmittingEmail} className="px-5 py-2.5 bg-gradient-to-r from-rose-500 to-amber-500 hover:from-rose-600 hover:to-amber-600 text-white text-sm font-bold rounded-lg shadow-sm transition-all disabled:opacity-60">
                {isSubmittingEmail ? "Saving..." : "Get Traffic"}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="bg-white border border-orange-100 rounded-2xl shadow-xl shadow-amber-900/5 overflow-hidden">
          <div className="p-6 border-b border-orange-100/60 bg-[#FFFDFB] flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-slate-900">RankYou Workspace Dashboard</h2>
              <p className="text-xs text-slate-500 font-mono mt-0.5">Autonomous Optimization Engine Pipeline</p>
            </div>
            <form onSubmit={handleLaunchPipeline} className="flex gap-2 min-w-[340px]">
              <input type="text" value={keyword} onChange={(e) => setKeyword(e.target.value)} placeholder="Enter target keyword..." className="flex-1 px-4 py-2 border border-slate-200 bg-white text-sm rounded-lg focus:outline-none focus:border-rose-400 font-mono" />
              <button type="submit" disabled={isLoading} className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-mono text-xs font-bold rounded-lg transition-all disabled:opacity-50">
                {isLoading ? "Launching..." : "Launch Pipeline"}
              </button>
            </form>
          </div>

          <div className="flex h-[550px]">
            <aside className="w-64 border-r border-orange-100/60 bg-[#FFFDFB] p-4 flex flex-col justify-between">
              <div className="w-full">
                <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block mb-3 font-mono">Campaign History Logs</span>
                <div className="space-y-1.5 overflow-y-auto max-h-[420px] custom-scrollbar pr-1">
                  {campaignHistory.length > 0 ? (
                    campaignHistory.map((item) => (
                      <div key={item.id} onClick={() => { setKeyword(item.keyword); setHtmlContent(item.content || ""); }} className="group flex flex-col text-left p-2.5 border border-orange-100/30 rounded-xl bg-orange-50/20 hover:bg-rose-50/40 hover:border-rose-100/60 transition-all cursor-pointer shadow-sm">
                        <span className="text-xs font-semibold text-slate-700 group-hover:text-rose-600 truncate font-mono">{item.keyword || 'Untitled Campaign'}</span>
                        <span className="text-[9px] text-slate-400 font-mono mt-0.5">{new Date(item.created_at).toLocaleDateString()}</span>
                      </div>
                    ))
                  ) : (
                    <div className="p-5 border border-dashed border-orange-200 bg-orange-50/10 rounded-xl text-center my-4 animate-pulse">
                      <p className="text-sm font-bold text-slate-700 font-mono">No Campaigns Found</p>
                      <p className="text-xs text-slate-400 font-mono mt-1 leading-normal">Launch a pipeline above to sync rows.</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="text-[10px] font-mono text-slate-400 border-t border-orange-100/40 pt-3">Pipeline Synchronized</div>
            </aside>

            <main className="flex-1 bg-[#FAF8F5]/30 p-6 flex flex-col">
              <div className="flex-1 flex flex-col bg-white border border-orange-100/60 rounded-xl overflow-hidden shadow-sm shadow-amber-900/5">
                                {/* Header Strip inside Workspace Display with Search Engine Target Indicators */}
                                <div className="flex items-center justify-between px-4 py-3 bg-[#FFFDFB] border-b border-orange-100/40">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-rose-400" />
                    <span className="text-[11px] font-bold tracking-wider uppercase text-rose-500 font-mono">
                      Workspace Content Preview
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-4">
                    {/* Monochromatic Target Search Engine Tracking Array */}
                    <div className="flex items-center gap-2 border-r border-orange-100/60 pr-4 mr-1">
                      <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider mr-1">Targets:</span>
                      
                      {/* Google Icon Indicator */}
                      <svg className="h-3.5 w-3.5 text-slate-400/80 hover:text-slate-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12.24 10.285V13.4h6.887c-.275 1.565-1.88 4.604-6.887 4.604-4.33 0-7.866-3.577-7.866-8s3.536-8 7.866-8c2.46 0 4.105 1.025 5.047 1.926l2.427-2.334C17.955 2.192 15.34 1 12.24 1 5.92 1 1 5.92 1 12s4.92 11 11.24 11c6.59 0 10.97-4.63 10.97-11.17 0-.753-.08-1.32-.178-1.545H12.24z"/>
                      </svg>
                      
                      {/* Microsoft Bing Icon Indicator */}
                      <svg className="h-3.5 w-3.5 text-slate-400/80 hover:text-slate-600 transition-colors" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M5.002 1v22l10.5-6 4.5-1.5-6.5-2.5 4-4.5z"/>
                      </svg>
                      
                      {/* DuckDuckGo Icon Indicator */}
                      <svg className="h-3.5 w-3.5 text-slate-400/80 hover:text-slate-600 transition-colors" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/>
                        <path d="M12 18a6 6 0 1 0 0-12 6 6 0 0 0 0 12z"/>
                        <circle cx="12" cy="12" r="1"/>
                      </svg>
                    </div>

                    {/* Actionable MCP Export Hook Button */}
                                        {/* Actionable CMS Export Hook Button */}
                                        <button
                      onClick={async () => {
                        if (!keyword.trim() || !htmlContent.trim()) {
                          return alert("Please select or launch a campaign article pipeline first!");
                        }
                        try {
                          const res = await fetch('/api/mcp', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ 
                              keyword: keyword.trim(),
                              htmlContent: htmlContent.trim() // Sends your full generated article string safely!
                            })
                          });
                          if (res.ok) alert("🚀 Article successfully dispatched to your CMS collection pipeline!");
                          else alert("CMS endpoint handshake rejected or credentials misconfigured.");
                        } catch (err) {
                          alert("Network error contacting server channels.");
                        }
                      }}
                      className="text-[10px] font-mono font-bold text-white bg-gradient-to-r from-rose-500 to-amber-500 hover:opacity-90 px-2.5 py-1 rounded shadow-sm shadow-rose-500/10 transition-all"
                    >
                      🔌 Export via MCP
                    </button>

                    
                    <span className="text-[10px] text-amber-700/90 font-mono bg-amber-50 px-2 py-0.5 rounded border border-amber-100/60">
                      gpt-4o-mini engine
                    </span>
                  </div>
                </div>

              </div>
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
