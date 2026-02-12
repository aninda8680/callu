"use client";
import React, { useState } from "react";
import { X, ArrowRight, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function ApplyModal({ onClose }: { onClose: () => void }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ name: "", email: "", mobile: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(true);
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl max-w-md text-center">
                <div className="w-16 h-16 bg-emerald-500/10 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight />
                </div>
                <h3 className="text-2xl text-white font-serif mb-2">Application Received</h3>
                <p className="text-zinc-400 mb-6">We will review your profile. You will be notified via email.</p>
                <button onClick={onClose} className="bg-white text-black px-8 py-3 rounded-full font-medium hover:bg-zinc-200 cursor-pointer">
                    Close
                </button>
            </div>
        </div>
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-3xl overflow-hidden relative">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white cursor-pointer">
          <X size={20} />
        </button>

        <div className="p-8">
            <h2 className="text-3xl font-light text-white mb-2">Apply to Join</h2>
            <p className="text-zinc-500 mb-8">Access is exclusive and manually approved.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Full Name</label>
                    <input 
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Mobile</label>
                    <input 
                        required
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                        placeholder="+1 555 000 0000"
                        value={formData.mobile}
                        onChange={e => setFormData({...formData, mobile: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Email</label>
                    <input 
                        required
                        type="email"
                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>

                <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-white text-black font-medium text-lg py-4 rounded-xl hover:bg-zinc-200 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Submit Application"}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}

export function LoginModal({ onClose }: { onClose: () => void }) {
    const { login } = useAuth();
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [adminId, setAdminId] = useState("");
    const [password, setPassword] = useState("");
    const [isAdminMode, setIsAdminMode] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        const success = await login(isAdminMode ? adminId : email, password, isAdminMode);
        setLoading(false);
        if (success) {
            const stored = JSON.parse(localStorage.getItem("callu_user") || "{}");
            if (stored.role === "admin") router.push("/admin");
            else router.push("/dashboard");
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 relative">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-zinc-500 hover:text-white cursor-pointer">
              <X size={20} />
            </button>
            <h2 className="text-2xl font-light text-white mb-6">{isAdminMode ? "Admin Login" : "Member Login"}</h2>
            
            <div className="flex gap-2 mb-6">
                <button 
                    onClick={() => setIsAdminMode(false)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors cursor-pointer ${!isAdminMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                    Member
                </button>
                <button 
                    onClick={() => setIsAdminMode(true)}
                    className={`flex-1 py-2 rounded-lg text-sm transition-colors cursor-pointer ${isAdminMode ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
                >
                    Admin
                </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                {isAdminMode ? (
                    <>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Admin ID</label>
                            <input 
                                required
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="Enter admin ID"
                                value={adminId}
                                onChange={e => setAdminId(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Password</label>
                            <input 
                                required
                                type="password"
                                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                                placeholder="Enter password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                            />
                        </div>
                    </>
                ) : (
                    <div>
                        <label className="block text-xs font-medium text-zinc-500 mb-1 uppercase tracking-wider">Email</label>
                        <input 
                            required
                            type="email"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-white transition-colors"
                            placeholder="john@example.com"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                )}
                 <button 
                    disabled={loading}
                    type="submit" 
                    className="w-full bg-zinc-800 text-white font-medium text-lg py-4 rounded-xl hover:bg-zinc-700 transition-all mt-4 flex items-center justify-center gap-2 cursor-pointer"
                >
                    {loading ? <Loader2 className="animate-spin" /> : "Enter"}
                </button>
            </form>
          </div>
        </div>
    )
}
