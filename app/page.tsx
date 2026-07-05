'use client';
import { useState, useEffect } from 'react';

export default function Page() {
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [selectedHtml, setSelectedHtml] = useState<string>("");
  const [targetKeyword, setTargetKeyword] = useState<string>("");
  const [inputKeyword, setInputKeyword] = useState<string>(""); 
  const [loading, setLoading] = useState<boolean>(true);
  const [generating, setGenerating] = useState<boolean>(false); 

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

  return (
    <div className="min-h-screen bg-[#12161A] text-[#F5F5F4] font-sans antialiased selection:bg-orange-500/30">
      <nav className="border-b border-[#1A2026] bg-[#12161A]/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <span className="h-3 w-3 rounded-full bg-gradient-to-r from-orange-500 to-rose-500 shadow-md shadow-orange-500/20" />
            <span className="font-bold tracking-tight text-xl bg-gradient-to-r from-orange-400 via-rose-400 to-white bg-clip-text text-transparent">
              RankYou Project Platform
            </span>
          </div>
          <div className="text-xs text-[#788896] font-mono bg-[#1A2026] px-3 py-1.5 rounded-lg border border-[#232B33]">
            Engine Status: <span className="text-orange-400 font-semibold">gpt-4o-mini Live</span>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-6 md:p-8 space-y-6">
        <div className="bg-[#1A2026] border border-[#232B33] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-[#F5F5F4]">RankYou Workspace Dashboard</h1>
            <p className="text-xs text-[#788896] mt-0.5">Autonomous Optimization Engine Pipeline</p>
          </div>
          <form onSubmit={handleLaunchPipeline} className="w-full md:w-auto flex items-center gap-3">
            <input 
              type="text" 
              placeholder="Enter target keyword..." 
              value={inputKeyword}
              onChange={(e) => setInputKeyword(e.target.value)}
              disabled={generating}
              className="bg-[#12161A] border border-[#232B33] rounded-xl px-4 py-2.5 text-sm text-[#F5F5F4] placeholder-[#4A5764] focus:outline-none focus:border-orange-500/40 w-full md:w-64 transition-all duration-200"
            />
            <button 
              type="submit"
              disabled={generating}
              className="bg-gradient-to-r from-orange-500 to-rose-500 hover:opacity-95 text-white text-xs font-bold px-5 py-3 rounded-xl transition-all duration-200 active:scale-95 whitespace-nowrap shadow-md shadow-orange-500/10"
            >
              {generating ? "Generating..." : "Launch Pipeline"}
            </button>
          </form>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 flex flex-col bg-[#1A2026] border border-[#232B33] rounded-2xl p-5 shadow-xl h-[600px]">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-[#232B33]">
              <h2 className="text-xs font-semibold tracking-wider uppercase text-[#788896]">Campaign History Logs</h2>
              <span className="text-xs bg-[#12161A] text-[#788896] px-2 py-0.5 rounded-full border border-[#232B33] font-medium">{campaigns.length} tracks</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loading ? (
                <div className="h-full flex items-center justify-center text-sm text-[#788896] italic">Syncing database clusters...</div>
              ) : campaigns.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center p-4">
                  <p className="text-sm font-medium text-[#788896]">No Campaigns Found</p>
                </div>
              ) : (
                campaigns.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => {
                      // Binds the active backend payload to render inside the center container
                      setSelectedHtml(item.html_content || "");
                      setTargetKeyword(item.keyword || "Untitled Campaign");
                    }}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      targetKeyword === item.keyword
                        ? 'bg-gradient-to-br from-orange-500/10 via-rose-500/5 to-transparent border-orange-500/40 shadow-lg'
                        : 'bg-[#12161A]/50 border-[#232B33] hover:border-[#4A5764]'
                    }`}
                  >
                    <p className={`font-semibold text-sm ${targetKeyword === item.keyword ? 'text-orange-400' : 'text-[#F5F5F4]'}`}>{item.keyword}</p>
                    <p className="text-[11px] text-[#788896] mt-2 font-mono">🗓️ {item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Recent'}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="lg:col-span-2 flex flex-col bg-[#1A2026] border border-[#232B33] rounded-2xl p-6 shadow-xl h-[600px]">
            <div className="flex justify-between items-center border-b border-[#232B33] pb-4 mb-5">
              <div className="flex items-center space-x-2">
                <span className="h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                <h2 className="text-xs font-semibold tracking-wider uppercase text-rose-400">Workspace Content Preview</h2>
              </div>
              <button onClick={handleMcpExport} className="px-5 py-2 text-xs font-bold text-white rounded-xl bg-gradient-to-r from-orange-500 to-rose-500 shadow-md shadow-orange-500/10 hover:opacity-95 active:scale-95 transition-all">
                <span>🔌 Export via MCP</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1">
              {selectedHtml ? (
                <div className="text-[#D6D3D1] text-sm leading-relaxed space-y-4 max-w-none border border-[#232B33] bg-[#12161A]/40 p-5 rounded-xl font-sans" dangerouslySetInnerHTML={{ __html: selectedHtml }} />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-[#788896] italic text-sm">
                  Select a campaign from the sidebar history logs to load content canvas.
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
