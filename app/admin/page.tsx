"use client";
import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";

interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  status: string;
  createdAt: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/users?status=pending");
      const data = await res.json();
      setUsers(data.users || []);
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
      fetchUsers(); // Refresh
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-light">Pending Applications</h2>
      
      {loading ? (
        <div className="flex justify-center py-20"><Loader2 className="animate-spin text-zinc-600" /></div>
      ) : users.length === 0 ? (
        <p className="text-zinc-500">No pending applications.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users.map((applicant) => (
            <div key={applicant._id} className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/50 flex flex-col justify-between gap-4">
              <div>
                <h3 className="text-lg font-medium text-white">{applicant.name}</h3>
                <p className="text-sm text-zinc-400 mt-1">{applicant.email}</p>
                <p className="text-sm text-zinc-500 font-mono mt-1">{applicant.mobile}</p>
                <p className="text-xs text-zinc-600 mt-4">Applied: {new Date(applicant.createdAt).toLocaleDateString()}</p>
              </div>
              <div className="flex gap-2 mt-2">
                <button
                  onClick={() => handleApprove(applicant._id)}
                  className="flex-1 flex items-center justify-center gap-2 bg-zinc-100 text-black hover:bg-white px-4 py-2 rounded-xl text-sm font-medium transition-colors"
                >
                  <Check size={16} /> Approve
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
