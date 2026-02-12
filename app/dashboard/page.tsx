"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useCall } from "@/context/CallContext";
import { Video, Mic, Search } from "lucide-react";

interface User {
  _id: string;
  name: string;
  avatarConfig: any;
  email: string; // for key
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { onlineUsers } = useSocket();
  const { callUser } = useCall();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await fetch("/api/users?status=approved");
        const data = await res.json();
        // Filter out self
        const others = data.users.filter((u: User) => u._id !== user?._id);
        setUsers(others);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (user) fetchUsers();
  }, [user]);

  const isOnline = (id: string) => onlineUsers.includes(id);

  return (
    <div className="space-y-8">
      <header className="flex justify-between items-end">
         <div>
            <h2 className="text-3xl font-light tracking-tight text-white">Community</h2>
            <p className="text-zinc-500 mt-2">Discover and connect with members.</p>
         </div>
      </header>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((member) => (
             <div key={member._id} className="group relative bg-zinc-900 border border-zinc-800 rounded-3xl p-6 hover:border-zinc-700 transition-colors">
                <div className="flex justify-between items-start mb-6">
                   <div className="w-14 h-14 rounded-2xl overflow-hidden flex items-center justify-center bg-zinc-800">
                      {member.avatarConfig?.image ? (
                        <img 
                          src={member.avatarConfig.image} 
                          alt={member.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xl font-bold text-white">{member.name[0].toUpperCase()}</span>
                      )}
                   </div>
                   <div className="flex flex-col items-end">
                       <div className={`w-3 h-3 rounded-full ${isOnline(member._id) ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                   </div>
                </div>
                
                <h3 className="text-lg font-medium text-white">{member.name}</h3>
                <p className="text-sm text-zinc-500">Member</p>

                <div className="mt-8 flex gap-2">
                   <button 
                     onClick={() => callUser(member._id, member.name)}
                     className="flex-1 bg-white text-black hover:bg-zinc-200 py-3 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                     disabled={!isOnline(member._id)}
                     title={!isOnline(member._id) ? "User is offline" : "Start Voice Call"}
                   >
                      <Mic size={18} /> Call
                   </button>
                   <button className="px-4 py-3 rounded-xl bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-colors">
                      <Video size={18} />
                   </button>
                </div>
             </div>
          ))}
          
          {loading && [1,2,3,4].map(i => (
             <div key={i} className="animate-pulse bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 h-[200px]" />
          ))}
      </div>
    </div>
  );
}
