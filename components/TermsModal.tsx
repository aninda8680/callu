"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Shield, CheckCircle2, Sparkles } from "lucide-react";

export default function TermsModal() {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    // ── THIS IS THE TRICK ──
    // The "I Agree" click is a trusted user gesture, so we use it
    // to unlock audio playback for the entire page session.
    try {
      const ctx = new AudioContext();
      // Create a tiny silent buffer and play it — fully unlocks audio
      const buffer = ctx.createBuffer(1, 1, 22050);
      const source = ctx.createBufferSource();
      source.buffer = buffer;
      source.connect(ctx.destination);
      source.start(0);
      ctx.resume().then(() => {
        console.log("🔓 Audio unlocked via Terms acceptance");
        // Keep context alive briefly then close
        setTimeout(() => ctx.close(), 500);
      });
    } catch (e) {
      console.warn("Audio unlock failed:", e);
    }

    // Also pre-warm any Audio elements by playing+pausing a silent one
    try {
      const silentAudio = new Audio("data:audio/wav;base64,UklGRiQAAABXQVZFZm10IBAAAAABAAEARKwAAIhYAQACABAAZGF0YQAAAAA=");
      silentAudio.volume = 0;
      silentAudio.play().then(() => {
        silentAudio.pause();
        console.log("🔓 HTML Audio element unlocked via Terms acceptance");
      }).catch(() => {});
    } catch (e) {
      // ignore
    }

    setAccepted(true);
  };

  if (accepted) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-xl"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.6, bounce: 0.3 }}
          className="bg-zinc-900 border border-zinc-800/50 rounded-3xl p-8 w-full max-w-2xl mx-4 shadow-2xl relative overflow-hidden"
        >
          {/* Decorative gradient blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2 pointer-events-none" />

          {/* Content */}
          <div className="relative z-10">
            {/* Header */}
            <div className="flex flex-col items-center mb-8">
              <motion.div
                initial={{ scale: 0, rotate: -45 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 flex items-center justify-center mb-5 relative"
              >
                <Shield className="text-emerald-400 w-10 h-10" strokeWidth={1.5} />
                <div className="absolute -top-1 -right-1">
                  <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
                </div>
              </motion.div>
              
              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-3xl font-bold text-white tracking-tight"
              >
                Community Guidelines
              </motion.h2>
              
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-zinc-400 text-sm mt-2"
              >
                Please review before continuing
              </motion.p>
            </div>

            {/* Terms Content */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-zinc-950/50 border border-zinc-800/50 rounded-2xl p-6 mb-6 max-h-[350px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent"
            >
              <div className="space-y-5">
                {[
                  {
                    title: "Respect & Privacy",
                    description: "Treat every member with respect. Do not record, screenshot, or share private conversations without explicit consent.",
                  },
                  {
                    title: "No Harassment",
                    description: "Harassment, hate speech, or discriminatory behavior of any kind will result in immediate removal from the community.",
                  },
                  {
                    title: "Authentic Connections",
                    description: "This is a space for genuine conversations. Spam, solicitation, or promotional content is not permitted.",
                  },
                  {
                    title: "Audio & Microphone",
                    description: "By agreeing, you allow CALLU to access your microphone during calls and enable audio notifications for incoming calls.",
                  },
                  {
                    title: "Community Standards",
                    description: "CALLU reserves the right to remove any member who violates these guidelines or disrupts the community experience.",
                  },
                ].map((item, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
                    className="flex gap-4 group"
                  >
                    <div className="flex-shrink-0 mt-0.5">
                      <div className="w-6 h-6 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center group-hover:bg-emerald-500/20 transition-colors">
                        <CheckCircle2 className="text-emerald-400 w-4 h-4" strokeWidth={2} />
                      </div>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold text-sm mb-1">{item.title}</h3>
                      <p className="text-zinc-400 text-sm leading-relaxed">{item.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Agree Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
              onClick={handleAccept}
              className="w-full bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white py-4 rounded-xl font-semibold text-base tracking-wide transition-all active:scale-[0.98] cursor-pointer shadow-lg shadow-emerald-900/30 hover:shadow-emerald-900/50 relative overflow-hidden group"
            >
              <span className="relative z-10 flex items-center justify-center gap-2">
                <Shield className="w-5 h-5" />
                I Agree — Enter Community
              </span>
              <div className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity" />
            </motion.button>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="text-center text-zinc-500 text-xs mt-5 leading-relaxed"
            >
              By clicking above, you agree to our community guidelines and terms of service.
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
