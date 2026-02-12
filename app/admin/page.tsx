"use client";
import { useEffect, useState } from "react";
import { Check, X, Loader2, Ban, Trash2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [pendingUsers, setPendingUsers] = useState<User[]>([]);
  const [approvedUsers, setApprovedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'pending' | 'approved'>('pending');

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const [pendingRes, approvedRes] = await Promise.all([
        fetch("/api/users?status=pending"),
        fetch("/api/users?status=approved")
      ]);
      const pendingData = await pendingRes.json();
      const approvedData = await approvedRes.json();
      setPendingUsers(pendingData.users || []);
      setApprovedUsers(approvedData.users || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await fetch("/api/users/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRevoke = async (id: string) => {
    if (!confirm('Revoke access for this user?')) return;
    try {
      await fetch("/api/users/approve", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "rejected" }),
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Permanently delete this user? This action cannot be undone.')) return;
    try {
      await fetch("/api/users/delete", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      fetchUsers();
    } catch (error) {
      console.error(error);
    }
  };

  const displayUsers = activeTab === 'pending' ? pendingUsers : approvedUsers;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-light">User Management</h2>
        <div className="flex gap-2 bg-zinc-900 p-1 rounded-lg">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-4 py-2 rounded-md text-sm transition-colors cursor-pointer ${activeTab === 'pending' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Pending ({pendingUsers.length})
          </button>
          <button 
            onClick={() => setActiveTab('approved')}
            className={`px-4 py-2 rounded-md text-sm transition-colors cursor-pointer ${activeTab === 'approved' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-white'}`}
          >
            Approved ({approvedUsers.length})
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-600" /></div>
      ) : displayUsers.length === 0 ? (
        <p className="text-zinc-500">No {activeTab} users.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {displayUsers.map((user) => (
            <div key={user._id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{user.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{user.email}</p>
                <p className="text-sm text-zinc-500 font-mono mt-1">{user.mobile}</p>
                <p className="text-xs text-zinc-600 mt-4">
                  {activeTab === 'pending' ? 'Applied' : 'Approved'}: {new Date(user.createdAt).toLocaleDateString()}
                </p>
              </div>
              
              {activeTab === 'pending' ? (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleApprove(user._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-black hover:bg-white px-4 py-2 rounded-xl text-sm font-medium transition-colors cursor-pointer"
                  >
                    <Check size={16} /> Approve
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex gap-2 mt-2">
                  <button
                    onClick={() => handleRevoke(user._id)}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 px-4 py-2 rounded-xl text-sm font-medium transition-colors border border-orange-500/20 cursor-pointer"
                  >
                    <Ban size={16} /> Revoke
                  </button>
                  <button
                    onClick={() => handleDelete(user._id)}
                    className="px-4 py-2 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/20 transition-colors cursor-pointer"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
