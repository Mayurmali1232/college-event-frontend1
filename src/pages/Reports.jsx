import { useEffect, useState } from "react";
import { API } from "../api/axios";

export default function Reports() {
  const user = JSON.parse(localStorage.getItem("user"));

  const [stats, setStats] = useState({
    totalUsers: 0,
    students: 0,
    coordinators: 0,
    totalEvents: 0,
    totalRegistrations: 0,
    approvedRegistrations: 0,
    pendingRegistrations: 0
  });

  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // src/pages/Reports.jsx madhe ha badal kara:

useEffect(() => {
  if (!user || user.role === "STUDENT") return;

  const fetchAnalytics = async () => {
    try {
      if (user.role === "ADMIN") {
        const [usersRes, eventsRes, regsRes] = await Promise.all([
          API.get("/users"),
          API.get("/events"),
          API.get("/registrations/all") 
        ]);

        setStats({
          totalUsers: usersRes.data.length,
          students: usersRes.data.filter(u => u.role === "STUDENT" || !u.role).length,
          coordinators: usersRes.data.filter(u => u.role === "COORDINATOR").length,
          totalEvents: eventsRes.data.length,
          totalRegistrations: regsRes.data.length,
          approvedRegistrations: regsRes.data.filter(r => r.status === "APPROVED").length,
          pendingRegistrations: regsRes.data.filter(r => r.status === "PENDING").length,
        });
        
        // MAHTVACHA BADAL: eventsRes jagi regsRes vapra karan regsRes madhe flattened data aahe
        setEvents(regsRes.data); 

      } else if (user.role === "COORDINATOR") {
        const [eventsRes, regsRes] = await Promise.all([
          API.get(`/events/coordinator/${user.id}`),
          API.get(`/registrations/coordinator/${user.id}/all`)
        ]);

        setStats({
          totalEvents: eventsRes.data.length,
          totalRegistrations: regsRes.data.length,
          approvedRegistrations: regsRes.data.filter(r => r.status === "APPROVED").length,
          pendingRegistrations: regsRes.data.filter(r => r.status === "PENDING").length,
        });
        setEvents(regsRes.data);
      }
    } catch (err) {
      console.error("Failed to fetch analytics", err);
    } finally {
      setIsLoading(false);
    }
  };

  fetchAnalytics();
}, []); // <--- ITHE [user] KADHUN FAKT [] THEVA, YANE INFINITE LOOP THAMBEL

  if (!user || user.role === "STUDENT") {
    return <div className="p-12 text-center text-red-500 font-bold">Access Denied.</div>;
  }

  if (isLoading) {
    return <div className="p-12 text-center text-slate-500 font-bold animate-pulse">Loading Analytics...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans p-6 md:p-12 pb-24">
      
      {/* DYNAMIC HEADER */}
      <div className="mb-8 border-b border-slate-200 pb-6">
        <h1 className="text-3xl font-bold text-slate-900">
          {user.role === "ADMIN" ? "Global System Reports" : "My Event Analytics"}
        </h1>
        <p className="text-slate-500 mt-1">
          {user.role === "ADMIN" 
            ? "High-level overview of all college platform usage." 
            : "Performance metrics for the events you manage."}
        </p>
      </div>

      {/* METRICS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        
        {/* User Metric (ONLY SHOW TO ADMIN) */}
        {user.role === "ADMIN" && (
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path></svg>
              </div>
              <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Total System Users</h3>
            </div>
            <p className="text-4xl font-black text-slate-900">{stats.totalUsers}</p>
            <p className="text-sm text-slate-500 font-medium mt-2">{stats.students} Students • {stats.coordinators} Coordinators</p>
          </div>
        )}

        {/* Event Metric */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-purple-100 text-purple-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">
              {user.role === "ADMIN" ? "Total Global Events" : "My Assigned Events"}
            </h3>
          </div>
          <p className="text-4xl font-black text-slate-900">{stats.totalEvents}</p>
          <p className="text-sm text-green-500 font-bold mt-2">+ Active on platform</p>
        </div>

        {/* Total Registrations Metric */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-green-100 text-green-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Student Engagement</h3>
          </div>
          <p className="text-4xl font-black text-slate-900">{stats.totalRegistrations}</p>
          <p className="text-sm text-green-600 font-bold mt-2">{stats.approvedRegistrations} Approved Participants</p>
        </div>

        {/* Pending Metric */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 hover:shadow-md transition-shadow">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-orange-100 text-orange-600 rounded-xl">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </div>
            <h3 className="text-slate-500 font-bold text-sm uppercase tracking-wider">Pending Approvals</h3>
          </div>
          <p className="text-4xl font-black text-slate-900">{stats.pendingRegistrations}</p>
          <p className="text-sm text-orange-500 font-bold mt-2">Require immediate attention</p>
        </div>

      </div>

      {/* EVENT BREAKDOWN TABLE */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-900 text-white">
          <h2 className="text-lg font-bold tracking-wide">
             {user.role === "ADMIN" ? "Global Event Overview" : "My Managed Events"}
          </h2>
          <span className="bg-blue-600 text-xs font-bold px-3 py-1 rounded-full">{events.length} Events Listed</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b text-slate-500 text-xs uppercase tracking-wider">
                <th className="p-4 font-bold">Event Title</th>
                <th className="p-4 font-bold">Date</th>
                <th className="p-4 font-bold">Location</th>
                {user.role === "ADMIN" && <th className="p-4 font-bold">Assigned Coordinator</th>}
              </tr>
            </thead>
          



<tbody>
  {events.map(reg => (
    <tr key={reg.id} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
      {/* 1. Event Title sathi 'eventTitle' vapra */}
      <td className="p-4 font-bold text-slate-900">{reg.eventTitle}</td>
      
      {/* 2. Date sathi 'eventDate' (jar backend query madhe date add keli asel tar) */}
      {/* Jar query madhe date nasel tar Repo query update karavi lagel */}
      <td className="p-4 text-slate-600 font-medium">{reg.eventDate || "13-04-2026"}</td>
      
      {/* 3. Location sathi 'eventLocation' */}
      <td className="p-4 text-slate-600">{reg.eventLocation || "Pune"}</td>
      
      <td className="p-4 text-right">
        <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-lg text-sm font-bold border border-blue-100">
          {reg.status}
        </span>
      </td>
    </tr>
  ))}
</tbody>
          </table>
        </div>
      </div>

    </div>
  );
}