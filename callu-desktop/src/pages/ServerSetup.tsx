import React, { useState } from "react";
import { Server, Globe, CheckCircle2, AlertCircle } from "lucide-react";

export default function ServerSetup({ onComplete }: { onComplete: () => void }) {
  const [customUrl, setCustomUrl] = useState("");
  const [error, setError] = useState("");

  const saveUrl = async (url: string) => {
    try {
      // Basic URL validation
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
        throw new Error("URL must start with http:// or https://");
      }
      
      const cleanUrl = url.endsWith('/') ? url.slice(0, -1) : url;
      
      if (window.electron) {
        window.electron.send("set-server-url", cleanUrl);
        window.CALLU_SERVER_URL = cleanUrl;
      }
      
      onComplete();
    } catch (err: any) {
      setError(err.message || "Invalid URL format.");
    }
  };

  const handleOfficial = () => {
    // Set to official URL
    saveUrl(import.meta.env.VITE_API_URL || "https://callu.up.railway.app");
  };

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customUrl.trim()) {
      setError("Please enter a valid URL.");
      return;
    }
    saveUrl(customUrl.trim());
  };

  return (
    <div className="flex-1 flex items-center justify-center bg-black p-6 font-dm relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[128px]" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-900/10 rounded-full blur-[128px]" />

      <div className="relative z-10 w-full max-w-md bg-zinc-950/80 backdrop-blur-xl border border-zinc-800/60 rounded-3xl p-8 shadow-2xl">
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
            <Server className="w-8 h-8 text-emerald-400" />
          </div>
        </div>

        <h1 className="text-2xl font-bold text-center text-white mb-2 tracking-tight">Configure Server</h1>
        <p className="text-center text-zinc-400 text-sm mb-8">
          Welcome to Callu! Do you want to connect to the official server or use a custom self-hosted server?
        </p>

        <div className="space-y-4">
          <button
            onClick={handleOfficial}
            className="w-full flex items-center gap-4 p-4 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-800/50 transition-all group text-left"
          >
            <div className="p-2 rounded-xl bg-emerald-500/10 group-hover:bg-emerald-500/20 transition-colors">
              <Globe className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-semibold text-sm">Use Official Server</h3>
              <p className="text-zinc-500 text-xs mt-0.5">Connect to the standard Callu network</p>
            </div>
          </button>

          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-zinc-800/60"></div>
            <span className="flex-shrink-0 mx-4 text-zinc-600 text-xs uppercase tracking-widest font-semibold">Or</span>
            <div className="flex-grow border-t border-zinc-800/60"></div>
          </div>

          <form onSubmit={handleCustomSubmit} className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wider pl-1">
                Self-Hosted Server URL
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={customUrl}
                  onChange={(e) => {
                    setCustomUrl(e.target.value);
                    setError("");
                  }}
                  placeholder="https://callu.my-server.com"
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
            </div>
            
            {error && (
              <div className="flex items-center gap-1.5 text-red-400 text-xs pl-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-3 rounded-xl text-sm font-semibold transition-all mt-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Connect to Custom Server
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
