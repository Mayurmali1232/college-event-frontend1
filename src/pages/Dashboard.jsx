import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

// 1. IMPORTANT: Ensure your Sidebar is imported here
// import Sidebar from "../components/Sidebar"; 

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdminOrCoordinator = user?.role === "ADMIN" || user?.role === "COORDINATOR";

  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]); 
  const [allRegs, setAllRegs] = useState([]); 
  const [coordinators, setCoordinators] = useState([]);
  const [activeTab, setActiveTab] = useState("UPCOMING"); 
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [newEvent, setNewEvent] = useState({ title: "", description: "", date: "", location: "", coordinatorId: "", imageUrl: "" });
  const [editingEvent, setEditingEvent] = useState(null);

  const fetchData = async () => {
    try {
      if (user?.role === "ADMIN") {
        const [ev, pending, all, users] = await Promise.all([
          API.get("/events"),
          API.get("/registrations/pending"),
          API.get("/registrations/all"),
          API.get("/users")
        ]);
        setEvents(ev.data);
        setPendingRegs(pending.data);
        setAllRegs(all.data);
        setCoordinators(users.data.filter(u => u.role === "COORDINATOR"));
      } else if (user?.role === "COORDINATOR") {
        const [ev, pending, all] = await Promise.all([
          API.get(`/events/coordinator/${user.id}`),
          API.get(`/registrations/pending/coordinator/${user.id}`),
          API.get(`/registrations/coordinator/${user.id}/all`)
        ]);
        setEvents(ev.data);
        setPendingRegs(pending.data);
        setAllRegs(all.data);
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

  const handleCreateEvent = async (e) => {
    e.preventDefault();
    try {
      const assignedCoordinatorId = user?.role === "ADMIN" ? newEvent.coordinatorId : user?.id;
      const payload = {
        title: newEvent.title, description: newEvent.description, date: newEvent.date, location: newEvent.location,
        imageUrl: newEvent.imageUrl || null, 
        coordinator: { id: parseInt(assignedCoordinatorId) } 
      };
      await API.post("/events", payload);
      toast.success("Event Created!");
      setShowCreateModal(false);
      fetchData();
    } catch (err) { toast.error("Failed to create event."); }
  };

  const handleUpdateEvent = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...editingEvent,
        imageUrl: editingEvent.imageUrl || null,
        coordinator: { id: parseInt(editingEvent.coordinator?.id || user.id) }
      };
      await API.put(`/events/${editingEvent.id}`, payload);
      toast.success("Event Updated!");
      setShowEditModal(false);
      fetchData();
    } catch (err) { toast.error("Failed to update event"); }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm("Delete permanently?")) {
      try {
        await API.delete(`/events/${eventId}`);
        toast.success("Deleted");
        fetchData();
      } catch (err) { toast.error("Error"); }
    }
  };

  const handleParticipate = async (eventId) => {
    try {
      await API.post("/registrations", { student: { id: parseInt(user.id) }, event: { id: parseInt(eventId) } });
      toast.success("Registered!");
      fetchData();
    } catch (err) { toast.error("Failed."); }
  };

  const updateRegistrationStatus = async (regId, status) => {
    try {
      await API.put(`/registrations/${regId}/${status}`);
      toast.success(`Status updated to ${status}`);
      fetchData(); 
    } catch (err) { toast.error("Failed"); }
  };

  const handleDismissNotification = async (regId) => {
    try {
      await API.put(`/registrations/seen/${regId}`);
      fetchData(); 
    } catch (err) {}
  };

  return (
    // 2. THIS FLEX WRAPPER IS KEY. It keeps the Sidebar and Content side-by-side.
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      
      {/* SIDEBAR AREA - Keep this outside the scrolling content */}
      <div className="h-full z-30">
         {/* <Sidebar />  <-- UNCOMMENT THIS LINE AND USE YOUR ACTUAL SIDEBAR */}
         <div className="w-64 h-full bg-slate-900 border-r border-white/10 p-6 hidden md:block">
            <h2 className="text-xl font-bold text-white mb-10">CollegeEvents</h2>
            <nav className="space-y-4 text-gray-400">
               <p className="hover:text-white cursor-pointer">Dashboard</p>
               <p className="hover:text-white cursor-pointer">Profile</p>
            </nav>
         </div>
      </div>

      {/* MAIN CONTENT - This scrolls while sidebar stays still */}
      <main 
        className="flex-1 h-full overflow-y-auto relative text-white font-sans"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-slate-900/90 backdrop-blur-sm z-0"></div>

        <div className="relative z-10 p-6 md:p-12 max-w-7xl mx-auto">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-6 rounded-3xl gap-4">
            <div>
              <h1 className="text-3xl font-extrabold text-white">
                {user?.role === "ADMIN" ? "Admin Panel" : "Event Portal"}
              </h1>
              <p className="text-indigo-200">Welcome, {user?.name}</p>
            </div>
            <div className="flex gap-4">
              {isAdminOrCoordinator && (
                <button onClick={() => setShowCreateModal(true)} className="bg-purple-600 hover:bg-purple-500 text-white font-bold py-3 px-6 rounded-xl transition-all">
                  + Create Event
                </button>
              )}
              <button onClick={handleLogout} className="bg-white/10 hover:bg-red-600 px-6 py-3 rounded-xl transition-all">
                Logout
              </button>
            </div>
          </div>

          {/* ALERTS (FOR STUDENTS) */}
          {user?.role === "STUDENT" && myRegistrations.filter(r => r.status !== "PENDING" && !r.studentSeen).map(reg => (
            <div key={reg.id} className="mb-6 p-4 rounded-xl border bg-indigo-500/10 border-indigo-500/30 flex justify-between items-center">
              <p>Your registration for <b>{reg.event?.title}</b> was <b>{reg.status}</b></p>
              <button onClick={() => handleDismissNotification(reg.id)} className="bg-white/10 px-4 py-2 rounded-lg">Dismiss</button>
            </div>
          ))}

          {/* TABS */}
          <div className="flex gap-4 mb-8">
            <button onClick={() => setActiveTab("UPCOMING")} className={`px-6 py-3 rounded-xl ${activeTab === "UPCOMING" ? "bg-purple-600" : "bg-white/5"}`}>Events</button>
            {isAdminOrCoordinator && (
              <>
                <button onClick={() => setActiveTab("PENDING")} className={`px-6 py-3 rounded-xl ${activeTab === "PENDING" ? "bg-orange-600" : "bg-white/5"}`}>Pending ({pendingRegs.length})</button>
                <button onClick={() => setActiveTab("REPORTS")} className={`px-6 py-3 rounded-xl ${activeTab === "REPORTS" ? "bg-emerald-600" : "bg-white/5"}`}>Reports</button>
              </>
            )}
          </div>

          {/* CONTENT AREA */}
          {activeTab === "UPCOMING" && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map(e => (
                <div key={e.id} className="bg-white/10 border border-white/10 rounded-2xl overflow-hidden flex flex-col">
                  {e.imageUrl ? <img src={e.imageUrl} className="h-48 w-full object-cover" /> : <div className="h-48 bg-slate-800" />}
                  <div className="p-5 flex-1">
                    <h3 className="text-xl font-bold">{e.title}</h3>
                    <p className="text-sm text-purple-300 mb-2">{e.date} | {e.location}</p>
                    <p className="text-gray-300 text-sm mb-4 line-clamp-3">{e.description}</p>
                    {isAdminOrCoordinator ? (
                      <div className="flex gap-2">
                        <button onClick={() => { setEditingEvent(e); setShowEditModal(true); }} className="flex-1 bg-white/5 py-2 rounded-lg">Edit</button>
                        <button onClick={() => handleDeleteEvent(e.id)} className="flex-1 bg-red-500/20 text-red-400 py-2 rounded-lg">Delete</button>
                      </div>
                    ) : (
                      <button onClick={() => handleParticipate(e.id)} className="w-full bg-indigo-600 py-2 rounded-lg">Register</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* MODAL OVERLAY - Uses fixed to cover entire screen, but Sidebar stays underneath */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[999] p-4">
            <div className="bg-slate-900 border border-white/20 p-8 rounded-3xl w-full max-w-md">
              <h2 className="text-2xl font-bold mb-6">{showCreateModal ? "New Event" : "Update Event"}</h2>
              <form onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent} className="space-y-4">
                <input required placeholder="Title" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl" value={showCreateModal ? newEvent.title : editingEvent.title} onChange={e => showCreateModal ? setNewEvent({...newEvent, title: e.target.value}) : setEditingEvent({...editingEvent, title: e.target.value})} />
                <textarea placeholder="Description" className="w-full bg-white/5 border border-white/10 p-3 rounded-xl" value={showCreateModal ? newEvent.description : editingEvent.description} onChange={e => showCreateModal ? setNewEvent({...newEvent, description: e.target.value}) : setEditingEvent({...editingEvent, description: e.target.value})} />
                <div className="flex gap-4">
                   <input type="date" className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl" value={showCreateModal ? newEvent.date : editingEvent.date} onChange={e => showCreateModal ? setNewEvent({...newEvent, date: e.target.value}) : setEditingEvent({...editingEvent, date: e.target.value})} />
                   <input placeholder="Location" className="flex-1 bg-white/5 border border-white/10 p-3 rounded-xl" value={showCreateModal ? newEvent.location : editingEvent.location} onChange={e => showCreateModal ? setNewEvent({...newEvent, location: e.target.value}) : setEditingEvent({...editingEvent, location: e.target.value})} />
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => {setShowCreateModal(false); setShowEditModal(false)}} className="flex-1 py-3 bg-white/5 rounded-xl">Cancel</button>
                  <button type="submit" className="flex-1 py-3 bg-purple-600 rounded-xl">Save</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}