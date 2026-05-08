import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdminOrCoordinator = user?.role === "ADMIN" || user?.role === "COORDINATOR";

  // State Management
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]); 
  const [allRegs, setAllRegs] = useState([]); // NEW: State for the Global Report
  const [coordinators, setCoordinators] = useState([]);
  const [activeTab, setActiveTab] = useState("UPCOMING"); // UPCOMING, MY_EVENTS, PENDING, REPORTS
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", coordinatorId: "", imageUrl: "" });
  const [editingEvent, setEditingEvent] = useState(null);

  // Master Fetch Function
  const fetchData = async () => {
    try {
      if (user?.role === "ADMIN") {
        API.get("/events").then(res => setEvents(res.data));
        API.get("/registrations/pending").then(res => setPendingRegs(res.data));
        API.get("/registrations/all").then(res => setAllRegs(res.data)); // Fetch all for Admin Report
        API.get("/users").then(res => setCoordinators(res.data.filter(u => u.role === "COORDINATOR")));
      } else if (user?.role === "COORDINATOR") {
        API.get(`/events/coordinator/${user.id}`).then(res => setEvents(res.data));
        API.get(`/registrations/pending/coordinator/${user.id}`).then(res => setPendingRegs(res.data));
        API.get(`/registrations/coordinator/${user.id}/all`).then(res => setAllRegs(res.data)); // Fetch all for Coordinator Report
      } else if (user?.role === "STUDENT") {
        API.get("/events").then(res => setEvents(res.data));
        API.get(`/registrations/student/${parseInt(user.id)}`).then(res => setMyRegistrations(res.data));
      }
    } catch (err) { console.error("Error fetching data:", err); }
  };

  useEffect(() => {
    if (!user) navigate("/");
    else fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Event Actions
  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const assignedCoordinatorId = user?.role === "ADMIN" ? newEvent.coordinatorId : user?.id;
      if (!assignedCoordinatorId) return toast.error("Please select a coordinator!");

      const payload = {
        title: newEvent.title, description: newEvent.description, date: newEvent.date, location: newEvent.location,
        imageUrl: newEvent.imageUrl === "" ? null : newEvent.imageUrl, 
        coordinator: { id: parseInt(assignedCoordinatorId) } 
      };
      await API.post("/events", payload);
      toast.success("Event Created Successfully!");
      setShowCreateModal(false);
      fetchData();
    } catch (err) { toast.error("Failed to create event."); }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingEvent,
        imageUrl: editingEvent.imageUrl === "" ? null : editingEvent.imageUrl,
        coordinator: { id: parseInt(editingEvent.coordinator?.id || user.id) }
      };
      await API.put(`/events/${editingEvent.id}`, payload);
      toast.success("Event Updated!");
      setShowEditModal(false);
      fetchData();
    } catch (err) { toast.error("Failed to update event"); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Delete this event permanently?")) {
      try {
        await API.delete(`/events/${eventId}`);
        toast.success("Event Deleted");
        fetchData();
      } catch (err) { toast.error("Error deleting event"); }
    }
  };

  // Registration Actions
  const handleParticipate = async (eventId) => {
    try {
      await API.post("/registrations", { student: { id: parseInt(user.id) }, event: { id: parseInt(eventId) } });
      toast.success("Successfully Registered!");
      fetchData();
    } catch (err) { toast.error("Registration failed."); }
  };

  const updateRegistrationStatus = async (regId, status) => {
    try {
      await API.put(`/registrations/${regId}/${status}`);
      toast.success(`Student ${status}!`);
      fetchData(); 
    } catch (err) { toast.error("Failed to update status"); }
  };

  const handleDismissNotification = async (regId) => {
    try {
      await API.put(`/registrations/seen/${regId}`);
      fetchData(); 
    } catch (err) {}
  };

  // Export CSV Function
  // src/pages/Dashboard.jsx madhe exportToCSV function asha prakare update kara:

const exportToCSV = () => {
  const headers = "Event Title,Student Name,Student Email,Status\n";
  
  // r.student?.email AIWJI r.studentEmail vapra
  const rows = allRegs.map(r => 
    `"${r.eventTitle || ''}","${r.studentName || ''}","${r.studentEmail || ''}","${r.status || ''}"`
  ).join("\n");

  const csvContent = "data:text/csv;charset=utf-8," + headers + rows;
  const encodedUri = encodeURI(csvContent);
  const link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Global_Event_Report.csv");
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

 return (
    <div className="flex min-h-screen bg-slate-900">
      {/* --- SIDEBAR AREA --- */}
      {/* This ensures the sidebar stays present even when modals are open */}
      <aside className="hidden md:block w-64 bg-slate-800 border-r border-white/10">
         {/* <Sidebar />  <-- Replace this with your actual Sidebar component */}
         <div className="p-6 font-bold text-xl">EventApp</div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <div 
        className="flex-1 min-h-screen bg-cover bg-fixed bg-center relative text-white font-sans selection:bg-purple-500 selection:text-white overflow-y-auto"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')" }}
      >
        <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-0"></div>

        <div className="relative z-10 p-6 md:p-12 pb-24 max-w-7xl mx-auto">
          
          {/* PREMIUM HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl shadow-lg gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">
                {user?.role === "ADMIN" ? "Global Event Headquarters" : user?.role === "COORDINATOR" ? "Coordinator Portal" : "Student Dashboard"}
              </h1>
              <p className="text-indigo-200 mt-1">Welcome back, {user?.name}</p>
            </div>
            <div className="flex gap-4">
              {isAdminOrCoordinator && (
                <button onClick={() => setShowCreateModal(true)} className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all transform hover:-translate-y-1">
                  + Create Event
                </button>
              )}
              <button onClick={handleLogout} className="bg-white/10 hover:bg-red-500/80 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all">
                Logout
              </button>
            </div>
          </div>

          {/* STUDENT ALERTS */}
          {user?.role === "STUDENT" && myRegistrations.filter(r => r.status !== "PENDING" && !r.studentSeen).map(reg => (
            <div key={reg.id} className={`mb-6 p-4 rounded-2xl border backdrop-blur-md flex justify-between items-center ${reg.status === 'APPROVED' ? 'bg-green-500/20 border-green-400/50' : 'bg-red-500/20 border-red-400/50'}`}>
              <div>
                <h4 className="font-bold text-lg">{reg.status === 'APPROVED' ? '🎉 Registration Approved!' : '❌ Registration Declined'}</h4>
                <p className="text-white/80">{reg.event?.title}</p>
              </div>
              <button onClick={() => handleDismissNotification(reg.id)} className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-bold transition">Dismiss</button>
            </div>
          ))}

          {/* GLOWING TABS */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button onClick={() => setActiveTab("UPCOMING")} className={`font-bold px-6 py-3 rounded-xl transition-all ${activeTab === "UPCOMING" ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40 border border-transparent" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
              {isAdminOrCoordinator ? "Global Events" : "Browse Upcoming"}
            </button>
            {user?.role === "STUDENT" && (
              <button onClick={() => setActiveTab("MY_EVENTS")} className={`font-bold px-6 py-3 rounded-xl transition-all ${activeTab === "MY_EVENTS" ? "bg-gradient-to-r from-purple-600 to-indigo-600 shadow-lg shadow-purple-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                My Registrations
              </button>
            )}
            {isAdminOrCoordinator && (
              <>
                <button onClick={() => setActiveTab("PENDING")} className={`font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${activeTab === "PENDING" ? "bg-gradient-to-r from-orange-500 to-pink-600 shadow-lg shadow-orange-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                  Pending Approvals 
                  {pendingRegs.length > 0 && <span className="bg-white text-orange-600 text-xs py-1 px-2 rounded-full">{pendingRegs.length}</span>}
                </button>
                <button onClick={() => setActiveTab("REPORTS")} className={`font-bold px-6 py-3 rounded-xl transition-all flex items-center gap-2 ${activeTab === "REPORTS" ? "bg-gradient-to-r from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/40" : "bg-white/5 border border-white/10 hover:bg-white/10"}`}>
                  📊 Global Report
                </button>
              </>
            )}
          </div>

          {/* CONTENT VIEWS */}
          {activeTab === "UPCOMING" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {events.map(e => {
                const isRegistered = myRegistrations.some(reg => reg.event?.id === e.id);
                return (
                  <div key={e.id} className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden flex flex-col group hover:bg-white/15 transition-all">
                    {e.imageUrl ? <img src={e.imageUrl} alt={e.title} className="w-full h-56 object-cover" /> : <div className="w-full h-56 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 flex items-center justify-center"><span className="text-white/50 font-bold">No Image</span></div>}
                    <div className="p-6 flex flex-col flex-grow">
                      <h3 className="text-2xl font-bold mb-1">{e.title}</h3>
                      <p className="text-purple-300 font-semibold text-sm mb-3">{e.date} • {e.location}</p>
                      <p className="text-white/80 text-sm flex-grow mb-6">{e.description}</p>
                      {user?.role === "STUDENT" && (
                        <button onClick={() => handleParticipate(e.id)} disabled={isRegistered} className={`w-full font-bold py-3 rounded-xl transition-all ${isRegistered ? "bg-green-500/20 text-green-300 border border-green-500/30 cursor-not-allowed" : "bg-indigo-600 hover:bg-indigo-500 shadow-lg"}`}>
                          {isRegistered ? "✓ Already Registered" : "Register Now"}
                        </button>
                      )}
                      {isAdminOrCoordinator && (
                        <div className="flex gap-2 mt-auto">
                          <button onClick={() => { setEditingEvent(e); setShowEditModal(true); }} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-2.5 rounded-lg text-sm border border-white/10">Edit</button>
                          <button onClick={() => handleDeleteEvent(e.id)} className="flex-1 bg-red-500/20 hover:bg-red-500/40 text-red-200 font-bold py-2.5 rounded-lg text-sm border border-red-500/30">Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ... Add your OTHER TABS (PENDING, REPORTS, MY_EVENTS) here following the same logic ... */}

        </div>

        {/* MODALS (Fixed Position ensures they appear over the sidebar too if needed) */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-[100] p-4">
             {/* ... Your existing modal form code ... */}
             <div className="bg-slate-900/90 border border-white/20 p-8 rounded-3xl w-full max-w-lg shadow-2xl">
               <h2 className="text-2xl font-bold mb-6 text-white">{showCreateModal ? "Launch New Event" : "Edit Event"}</h2>
               <form onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent} className="space-y-4">
                 <input required placeholder="Title" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none" value={showCreateModal ? newEvent.title : editingEvent.title} onChange={e => showCreateModal ? setNewEvent({...newEvent, title: e.target.value}) : setEditingEvent({...editingEvent, title: e.target.value})} />
                 <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none" value={showCreateModal ? newEvent.description : editingEvent.description} onChange={e => showCreateModal ? setNewEvent({...newEvent, description: e.target.value}) : setEditingEvent({...editingEvent, description: e.target.value})}></textarea>
                 <div className="grid grid-cols-2 gap-4">
                   <input required type="date" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none min-h-[50px] date-input-glass" value={showCreateModal ? newEvent.date : editingEvent.date} onChange={e => showCreateModal ? setNewEvent({...newEvent, date: e.target.value}) : setEditingEvent({...editingEvent, date: e.target.value})} />
                   <input required placeholder="Location" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none" value={showCreateModal ? newEvent.location : editingEvent.location} onChange={e => showCreateModal ? setNewEvent({...newEvent, location: e.target.value}) : setEditingEvent({...editingEvent, location: e.target.value})} />
                 </div>
                 <input placeholder="Image URL" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-400 outline-none" value={showCreateModal ? newEvent.imageUrl : (editingEvent.imageUrl || "")} onChange={e => showCreateModal ? setNewEvent({...newEvent, imageUrl: e.target.value}) : setEditingEvent({...editingEvent, imageUrl: e.target.value})} />
                 
                 <div className="flex gap-3 mt-8">
                   <button type="button" onClick={() => {setShowCreateModal(false); setShowEditModal(false)}} className="flex-1 p-4 font-bold text-white bg-white/10 rounded-xl hover:bg-white/20 transition">Cancel</button>
                   <button type="submit" className="flex-1 p-4 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl hover:shadow-lg transition">Save Event</button>
                 </div>
               </form>
             </div>
          </div>
        )}

      </div>
      
      <style>{`
        .date-input-glass::-webkit-calendar-picker-indicator { filter: invert(1); }
      `}</style>
    </div>
  );
}