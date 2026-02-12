"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useSocket } from "@/context/SocketContext";
import { useCall } from "@/context/CallContext";
import { Video, Mic } from "lucide-react";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";

interface User {
  _id: string;
  name: string;
  avatarConfig: {
    image: string;
    color: string;
  };
  email: string;
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
  
  // Filter to only show online users
  const onlineMembers = users.filter((u) => isOnline(u._id));

  return (
    <div className="space-y-8">
      <header>
         <h2 className="text-3xl font-light tracking-tight text-white">Community</h2>
         <p className="text-zinc-500 mt-2">
           {onlineMembers.length > 0 
             ? `${onlineMembers.length} member${onlineMembers.length !== 1 ? 's' : ''} online` 
             : 'No members online'}
         </p>
      </header>

      {/* Bento Grid or Empty State */}
      {!loading && onlineMembers.length === 0 ? (
        // Empty state - no one online
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
          <div className="w-80 h-80">
            <DotLottieReact
              src="/Lotties/nobody.lottie"
              loop
              autoplay
            />
          </div>
          <div className="text-center space-y-2">
            <h3 className="text-2xl font-light text-white">No one is online right now</h3>
            <p className="text-zinc-500">Check back later to connect with community members</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {onlineMembers.map((member) => (
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
                     onClick={() => callUser(member._id, member.name, member.avatarConfig?.image)}
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
      )}
    </div>
  );
}
