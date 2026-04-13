import { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast from "react-hot-toast";

export default function Users() {
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetches all users from your database
      const res = await API.get("/users");
      setUsers(res.data);
    } catch (err) {
      toast.error("Failed to load users");
    }
  };

  // Admin function to assign roles
  const handleRoleChange = async (userId, newRole) => {
    if (window.confirm(`Are you sure you want to change this user's role to ${newRole}?`)) {
      try {
        // Calls the backend to update the user's role
        await API.put(`/users/${userId}/role`, { role: newRole });
        toast.success(`Role updated to ${newRole}`);
        fetchUsers(); // Refresh the table
      } catch (err) {
        toast.error("Failed to update role");
      }
    }
  };

  // Filter users based on search input
  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    u.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Security check: Only Admins should see this page
  if (currentUser?.role !== "ADMIN") {
    return <div className="p-12 text-center text-red-500 font-bold text-xl">Access Denied. Admin privileges required.</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12">
      
      {/* HEADER & SEARCH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">System Users</h1>
          <p className="text-slate-500 mt-1">Manage system access and assign coordinator roles.</p>
        </div>
        
        {/* Search Bar */}
        <div className="relative w-full md:w-96">
          <input 
            type="text" 
            placeholder="Search users by name or email..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all shadow-sm"
          />
          <svg className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-sm uppercase tracking-wider">
                <th className="p-4 font-semibold">User Details</th>
                <th className="p-4 font-semibold">Current Role</th>
                <th className="p-4 font-semibold text-right">Role Management Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-slate-500">No users found matching your search.</td>
                </tr>
              ) : (
                filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <p className="font-bold text-slate-900">{u.name}</p>
                      <p className="text-sm text-slate-500">{u.email}</p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                        u.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' : 
                        u.role === 'COORDINATOR' ? 'bg-blue-100 text-blue-700' : 
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role || 'STUDENT'}
                      </span>
                    </td>
                    <td className="p-4 flex justify-end gap-2 items-center h-full">
                      
                      {/* Prevent Admin from downgrading themselves accidentally */}
                      {u.id === currentUser.id ? (
                        <span className="text-xs text-slate-400 font-medium italic">Cannot modify self</span>
                      ) : (
                        <select 
                          className="bg-white border border-slate-300 text-slate-700 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none cursor-pointer"
                          value={u.role || "STUDENT"}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        >
                          <option value="STUDENT">Student</option>
                          <option value="COORDINATOR">Coordinator</option>
                          <option value="ADMIN">Admin</option>
                        </select>
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}