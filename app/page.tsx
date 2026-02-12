"use client";
import React, { useState } from "react";
import Image from "next/image";
import ApplyModal, { LoginModal } from "@/components/ApplyModal";

export default function Home() {
  const [showApply, setShowApply] = useState(false);
  const [showLogin, setShowLogin] = useState(false);

  return (
    <main className="min-h-screen bg-black text-white relative overflow-hidden flex flex-col items-center">
      {/* Background Ambience */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[128px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-900/10 rounded-full blur-[128px]" />
      </div>

      <nav className="relative z-10 flex justify-between items-center px-8 py-6 w-full max-w-7xl">
        <h1 className="text-2xl font-bold tracking-tighter">CALLU.</h1>
        <button onClick={() => setShowLogin(true)} className="text-sm font-medium text-zinc-400 hover:text-white transition-colors">
            Member Area
        </button>
      </nav>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-[80vh] px-4 text-center w-full max-w-5xl">
        
        <div className="mb-8 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-900/50 border border-zinc-800 text-xs text-zinc-400">
           <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
           Accepting Applications
        </div>

        <h2 className="text-5xl md:text-7xl font-sans font-medium tracking-tight mb-8 max-w-4xl text-pretty leading-tight">
          The curated community for <span className="text-zinc-500">meaningful connections.</span>
        </h2>

        <p className="text-lg md:text-xl text-zinc-400 max-w-xl mb-12">
            A private space for professionals, creators, and visionaries. 
            Connect through voice, video, and serendipity.
        </p>
        
        <button 
          onClick={() => setShowApply(true)}
          className="bg-white text-black text-lg font-medium px-10 py-5 rounded-full hover:scale-105 transition-transform duration-300"
        >
            Apply to Join Community
        </button>

        {/* Bento Grid Teaser */}
        <div className="mt-24 grid grid-cols-2 md:grid-cols-4 gap-4 w-full opacity-50 grayscale hover:grayscale-0 transition-all duration-700">
             <div className="bg-zinc-900/50 h-32 rounded-2xl border border-zinc-800/50"></div>
             <div className="bg-zinc-900/50 h-32 rounded-2xl border border-zinc-800/50 translate-y-4"></div>
             <div className="bg-zinc-900/50 h-32 rounded-2xl border border-zinc-800/50"></div>
             <div className="bg-zinc-900/50 h-32 rounded-2xl border border-zinc-800/50 translate-y-8"></div>
        </div>

      </div>

      {showApply && <ApplyModal onClose={() => setShowApply(false)} />}
      {showLogin && <LoginModal onClose={() => setShowLogin(false)} />}
    </main>
  );
}
