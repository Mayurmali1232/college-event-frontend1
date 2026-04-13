import { useEffect, useState } from "react";
import { API } from "../api/axios";
import toast from "react-hot-toast";

export default function Approvals() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [pendingRequests, setPendingRequests] = useState([]);
  
  // NEW STATE: Tracks which event "folder" the user has clicked open
  const [selectedEventName, setSelectedEventName] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      if (user?.role === "ADMIN") {
        const res = await API.get("/registrations/pending");
        setPendingRequests(res.data);
      } else if (user?.role === "COORDINATOR") {
        const res = await API.get(`/registrations/pending/coordinator/${user.id}`);
        setPendingRequests(res.data);
      }
    } catch (err) {
      toast.error("Failed to load pending approvals");
    }
  };

  const handleUpdateStatus = async (regId, newStatus) => {
    try {
      await API.put(`/registrations/${regId}/${newStatus}`);
      toast.success(`Registration ${newStatus}!`);
      fetchPendingRequests(); 
    } catch (err) {
      toast.error("Failed to update registration status");
    }
  };

  // Security Gate
  if (user?.role === "STUDENT") {
    return <div className="p-12 text-center text-red-500 font-bold">Access Denied.</div>;
  }

  // 1. Group the students by Event Name
  const groupedRequests = pendingRequests.reduce((groups, reg) => {
    const eventName = reg.event?.title || "Unknown Event";
    if (!groups[eventName]) groups[eventName] = [];
    groups[eventName].push(reg);
    return groups;
  }, {});

  // 2. Auto-close the folder if the admin approves the very last student in it
  useEffect(() => {
    if (selectedEventName && !groupedRequests[selectedEventName]) {
      setSelectedEventName(null);
    }
  }, [pendingRequests, selectedEventName, groupedRequests]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 pb-24">
      
      {/* HEADER */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Registration Approvals</h1>
        <p className="text-slate-500 mt-1">Select an event to review its pending students.</p>
      </div>

      {Object.keys(groupedRequests).length === 0 ? (
        // EMPTY STATE (No pending requests anywhere)
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-12 text-center">
          <svg className="w-16 h-16 text-slate-200 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h2 className="text-xl font-bold text-slate-500">All Caught Up!</h2>
          <p className="text-slate-400 mt-2">There are no pending student registrations at the moment.</p>
        </div>
      ) : (
        <>
          {/* VIEW 1: THE EVENT FOLDERS (Shows when no event is clicked) */}
          {!selectedEventName && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedRequests).map(([eventName, requests]) => (
                <div 
                  key={eventName} 
                  onClick={() => setSelectedEventName(eventName)}
                  className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 cursor-pointer hover:shadow-md hover:border-blue-300 transition-all group"
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-colors">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"></path></svg>
                    </div>
                    <span className="bg-orange-100 text-orange-700 text-sm font-bold px-3 py-1 rounded-full">
                      {requests.length} Pending
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-1">{eventName}</h3>
                  <p className="text-sm text-slate-500 font-medium text-blue-600 group-hover:underline">Click to view students ➔</p>
                </div>
              ))}
            </div>
          )}

          {/* VIEW 2: THE STUDENT LIST (Shows when an event is clicked) */}
          {selectedEventName && groupedRequests[selectedEventName] && (
            <div className="animate-fade-in-up">
              
              {/* Back Button & Event Title */}
              <div className="flex items-center justify-between mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setSelectedEventName(null)}
                    className="flex items-center gap-2 text-slate-500 hover:text-slate-900 font-bold px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    Back to Events
                  </button>
                  <h2 className="text-2xl font-bold text-slate-900 border-l-2 border-slate-200 pl-4">
                    {selectedEventName}
                  </h2>
                </div>
                <span className="bg-slate-900 text-white text-sm font-bold px-4 py-2 rounded-lg">
                  {groupedRequests[selectedEventName].length} Students to Review
                </span>
              </div>

              {/* The Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                        <th className="p-4 font-bold">Student Name</th>
                        <th className="p-4 font-bold">Email ID</th>
                        <th className="p-4 font-bold text-right">Approval Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {groupedRequests[selectedEventName].map(reg => (
                        <tr key={reg.id} className="hover:bg-slate-50 transition-colors">
                          <td className="p-4 font-bold text-slate-900">{reg.student?.name}</td>
                          <td className="p-4 text-slate-500">{reg.student?.email}</td>
                          <td className="p-4 flex justify-end gap-3">
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'APPROVED')}
                              className="flex items-center gap-1 bg-green-50 hover:bg-green-100 text-green-700 font-bold px-4 py-2 rounded-xl transition-colors text-sm border border-green-200 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                              Approve
                            </button>
                            <button 
                              onClick={() => handleUpdateStatus(reg.id, 'REJECTED')}
                              className="flex items-center gap-1 bg-red-50 hover:bg-red-100 text-red-600 font-bold px-4 py-2 rounded-xl transition-colors text-sm border border-red-200 shadow-sm"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                              Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}
        </>
      )}

    </div>
  );
}