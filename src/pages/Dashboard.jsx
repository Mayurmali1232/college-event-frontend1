import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const isAdminOrCoordinator =
    user?.role === "ADMIN" || user?.role === "COORDINATOR";

  // State Management
  const [events, setEvents] = useState([]);
  const [myRegistrations, setMyRegistrations] = useState([]);
  const [pendingRegs, setPendingRegs] = useState([]);
  const [allRegs, setAllRegs] = useState([]);
  const [coordinators, setCoordinators] = useState([]);
  const [activeTab, setActiveTab] = useState("UPCOMING");

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    location: "",
    coordinatorId: "",
    imageUrl: "",
  });

  const [editingEvent, setEditingEvent] = useState(null);

  // Fetch Data
  const fetchData = async () => {
    try {
      if (user?.role === "ADMIN") {
        API.get("/events").then(res => setEvents(res.data));
        API.get("/registrations/pending").then(res => setPendingRegs(res.data));
        API.get("/registrations/all").then(res => setAllRegs(res.data));
        API.get("/users").then(res =>
          setCoordinators(res.data.filter(u => u.role === "COORDINATOR"))
        );
      } else if (user?.role === "COORDINATOR") {
        API.get(`/events/coordinator/${user.id}`).then(res => setEvents(res.data));
        API.get(`/registrations/pending/coordinator/${user.id}`).then(res => setPendingRegs(res.data));
        API.get(`/registrations/coordinator/${user.id}/all`).then(res => setAllRegs(res.data));
      } else if (user?.role === "STUDENT") {
        API.get("/events").then(res => setEvents(res.data));
        API.get(`/registrations/student/${parseInt(user.id)}`).then(res => setMyRegistrations(res.data));
      }
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  };

  useEffect(() => {
    if (!user) navigate("/");
    else fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // Create Event
  const handleCreateEvent = async e => {
    e.preventDefault();

    try {
      const assignedCoordinatorId =
        user?.role === "ADMIN" ? newEvent.coordinatorId : user?.id;

      if (!assignedCoordinatorId)
        return toast.error("Please select a coordinator!");

      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        imageUrl: newEvent.imageUrl === "" ? null : newEvent.imageUrl,
        coordinator: { id: parseInt(assignedCoordinatorId) },
      };

      await API.post("/events", payload);
      toast.success("Event Created Successfully!");
      setShowCreateModal(false);
      setNewEvent({ title: "", description: "", date: "", location: "", coordinatorId: "", imageUrl: "" });
      fetchData();
    } catch (err) {
      toast.error("Failed to create event.");
    }
  };
  // Update Event
  const handleUpdateEvent = async e => {
    e.preventDefault();

    try {
      const payload = {
        ...editingEvent,
        imageUrl: editingEvent.imageUrl === "" ? null : editingEvent.imageUrl,
        coordinator: { id: parseInt(editingEvent.coordinator?.id || user.id) },
      };

      await API.put(`/events/${editingEvent.id}`, payload);
      toast.success("Event Updated!");
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      toast.error("Failed to update event");
    }
  };

  // Delete Event
  const handleDeleteEvent = async eventId => {
    if (window.confirm("Delete this event permanently?")) {
      try {
        await API.delete(`/events/${eventId}`);
        toast.success("Event Deleted");
        fetchData();
      } catch (err) {
        toast.error("Error deleting event");
      }
    }
  };

  // Participate
  const handleParticipate = async eventId => {
    try {
      const payload = {
        student: { id: parseInt(user.id) },
        event: { id: parseInt(eventId) },
      };
      const response = await API.post("/registrations", payload);
      console.log(response.data);
      toast.success("Successfully Registered!");
      fetchData();
    } catch (err) {
      console.log(err);
      toast.error("Registration failed.");
    }
  };

  // Update Registration
  const updateRegistrationStatus = async (regId, status) => {
    try {
      await API.put(`/registrations/${regId}/${status}`);
      toast.success(`Student ${status}!`);
      fetchData();
    } catch (err) {
      toast.error("Failed to update status");
    }
  };

  // Dismiss Notification
  const handleDismissNotification = async regId => {
    try {
      await API.put(`/registrations/seen/${regId}`);
      fetchData();
    } catch (err) {}
  };

  // Export CSV
  const exportToCSV = () => {
    const headers = "Event Title,Student Name,Student Email,Status\n";
    const rows = allRegs
      .map(r => `"${r.eventTitle || ""}","${r.studentName || ""}","${r.studentEmail || ""}","${r.status || ""}"`)
      .join("\n");
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
    <div
      className="min-h-screen bg-cover bg-fixed bg-center relative text-white font-sans selection:bg-purple-500 selection:text-white"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-slate-900/85 backdrop-blur-sm z-0"></div>

      <div className="relative z-10 px-3 sm:px-6 md:px-12 py-4 sm:py-6 pb-24 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 sm:mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl shadow-lg gap-3 sm:gap-4">
          <div>
            <h1 className="text-xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">
              {user?.role === "ADMIN"
                ? "Global Event Headquarters"
                : user?.role === "COORDINATOR"
                ? "Coordinator Portal"
                : "Student Dashboard"}
            </h1>
            <p className="text-indigo-200 mt-1 text-xs sm:text-base">Welcome back, {user?.name}</p>
          </div>

          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            {isAdminOrCoordinator && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-none bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl shadow-lg transition-all text-sm sm:text-base active:scale-95"
              >
                + Create Event
              </button>
            )}
            <button
              onClick={handleLogout}
              className="flex-1 sm:flex-none bg-white/10 hover:bg-red-500/80 border border-white/20 text-white font-bold py-2.5 sm:py-3 px-4 sm:px-6 rounded-xl transition-all text-sm sm:text-base active:scale-95"
            >
              Logout
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto gap-2 sm:gap-3 mb-6 sm:mb-8 pb-2 scrollbar-hide">
          <button
            onClick={() => setActiveTab("UPCOMING")}
            className={`whitespace-nowrap font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base active:scale-95 ${
              activeTab === "UPCOMING"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                : "bg-white/5 border border-white/10"
            }`}
          >
            {isAdminOrCoordinator ? "Global Events" : "Browse Upcoming"}
          </button>

          {user?.role === "STUDENT" && (
            <button
              onClick={() => setActiveTab("MY_EVENTS")}
              className={`whitespace-nowrap font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base active:scale-95 ${
                activeTab === "MY_EVENTS"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                  : "bg-white/5 border border-white/10"
              }`}
            >
              My Registrations
            </button>
          )}

          {isAdminOrCoordinator && (
            <>
              <button
                onClick={() => setActiveTab("PENDING")}
                className={`whitespace-nowrap font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base active:scale-95 ${
                  activeTab === "PENDING"
                    ? "bg-gradient-to-r from-orange-500 to-pink-600"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                Pending Approvals
              </button>
              <button
                onClick={() => setActiveTab("REPORTS")}
                className={`whitespace-nowrap font-bold px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl transition-all text-sm sm:text-base active:scale-95 ${
                  activeTab === "REPORTS"
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                📊 Global Report
              </button>
            </>
          )}
        </div>

        {/* EVENTS TAB */}
        {activeTab === "UPCOMING" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
            {events.map(e => {
              const isRegistered = myRegistrations.some(reg => reg.event?.id === e.id);
              return (
                <div
                  key={e.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl overflow-hidden flex flex-col"
                >
                  {e.imageUrl ? (
                    <img src={e.imageUrl} alt={e.title} className="w-full h-44 sm:h-56 object-cover" />
                  ) : (
                    <div className="w-full h-44 sm:h-56 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 flex items-center justify-center">
                      <span className="text-sm text-white/60">No Image</span>
                    </div>
                  )}

                  <div className="p-4 sm:p-6 flex flex-col flex-grow">
                    <h3 className="text-lg sm:text-2xl font-bold mb-1.5">{e.title}</h3>
                    <p className="text-purple-300 text-xs sm:text-sm mb-2">{e.date} • {e.location}</p>
                    <p className="text-white/80 text-xs sm:text-sm flex-grow mb-4">{e.description}</p>

                    {user?.role === "STUDENT" && (
                      <button
                        onClick={() => handleParticipate(e.id)}
                        disabled={isRegistered}
                        className={`w-full font-bold py-3 rounded-xl text-sm active:scale-95 transition-all ${
                          isRegistered
                            ? "bg-green-500/20 text-green-300"
                            : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                      >
                        {isRegistered ? "✓ Already Registered" : "Register Now"}
                      </button>
                    )}

                    {isAdminOrCoordinator && (
                      <div className="flex gap-2 mt-auto">
                        <button
                          onClick={() => { setEditingEvent(e); setShowEditModal(true); }}
                          className="flex-1 bg-white/10 hover:bg-white/20 active:scale-95 py-2.5 rounded-lg text-sm transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(e.id)}
                          className="flex-1 bg-red-500/20 hover:bg-red-500/40 active:scale-95 py-2.5 rounded-lg text-sm transition-all"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* PENDING TAB */}
        {activeTab === "PENDING" && isAdminOrCoordinator && (
          <div className="space-y-4">
            {pendingRegs.length === 0 ? (
              <p className="text-center text-white/50 py-12">No pending approvals.</p>
            ) : (
              pendingRegs.map(reg => (
                <div
                  key={reg.id}
                  className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  {/* LEFT — Event + Student info */}
                  <div className="flex flex-col gap-2 flex-1 min-w-0">

                    {/* Event badge */}
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 bg-purple-500/20 text-purple-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-purple-500/30">
                        Event
                      </span>
                      <p className="font-bold text-white text-sm sm:text-base truncate">
                        {reg.eventTitle || "—"}
                      </p>
                    </div>

                    {/* Event date + location if available */}
                    {(reg.eventDate || reg.eventLocation) && (
                      <p className="text-purple-300 text-xs flex items-center gap-1 ml-0.5">
                        <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {reg.eventDate && <span>{reg.eventDate}</span>}
                        {reg.eventDate && reg.eventLocation && <span>•</span>}
                        {reg.eventLocation && <span>{reg.eventLocation}</span>}
                      </p>
                    )}

                    {/* Divider */}
                    <div className="border-t border-white/10 my-1" />

                    {/* Student badge */}
                    <div className="flex items-center gap-2">
                      <span className="shrink-0 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border border-indigo-500/30">
                        Student
                      </span>
                      <p className="font-semibold text-white text-sm truncate">
                        {reg.studentName || "—"}
                      </p>
                    </div>

                    <p className="text-white/50 text-xs ml-0.5 truncate">
                      {reg.studentEmail || ""}
                    </p>
                  </div>

                  {/* RIGHT — Action buttons */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <button
                      onClick={() => updateRegistrationStatus(reg.id, "APPROVED")}
                      className="flex-1 sm:flex-none bg-green-500/20 hover:bg-green-500/40 active:scale-95
                                 text-green-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-all
                                 border border-green-500/20 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                      </svg>
                      Approve
                    </button>
                    <button
                      onClick={() => updateRegistrationStatus(reg.id, "REJECTED")}
                      className="flex-1 sm:flex-none bg-red-500/20 hover:bg-red-500/40 active:scale-95
                                 text-red-300 font-bold px-5 py-2.5 rounded-xl text-sm transition-all
                                 border border-red-500/20 flex items-center justify-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Reject
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
        {/* MY REGISTRATIONS TAB */}
        {activeTab === "MY_EVENTS" && user?.role === "STUDENT" && (
          <div className="space-y-4">
            {myRegistrations.length === 0 ? (
              <p className="text-center text-white/50 py-12">You haven't registered for any events yet.</p>
            ) : (
              myRegistrations.map(reg => (
                <div key={reg.id} className="bg-white/10 backdrop-blur-xl rounded-2xl border border-white/20 p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <p className="font-bold text-sm sm:text-base">{reg.event?.title}</p>
                    <p className="text-purple-300 text-xs sm:text-sm">{reg.event?.date} • {reg.event?.location}</p>
                  </div>
                  <span className={`self-start sm:self-auto px-3 py-1 rounded-lg text-xs font-bold ${
                    reg.status === "APPROVED" ? "bg-green-500/20 text-green-300" :
                    reg.status === "REJECTED" ? "bg-red-500/20 text-red-300" :
                    "bg-orange-500/20 text-orange-300"
                  }`}>
                    {reg.status}
                  </span>
                </div>
              ))
            )}
          </div>
        )}

        {/* REPORTS TAB */}
        {activeTab === "REPORTS" && isAdminOrCoordinator && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-between sm:items-center">
              <h2 className="text-xl sm:text-3xl font-bold">System Analytics</h2>
              <button
                onClick={exportToCSV}
                className="w-full sm:w-auto bg-white/10 hover:bg-white/20 active:scale-95 border border-white/20 text-white font-bold py-2 px-6 rounded-lg text-sm transition-all"
              >
                ⬇ Download CSV
              </button>
            </div>

            <div className="grid grid-cols-2 xl:grid-cols-4 gap-3 sm:gap-6">
              <div className="bg-white/5 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xs sm:text-sm text-white/60 mb-1">Total Events</h3>
                <p className="text-3xl sm:text-4xl font-bold">{events.length}</p>
              </div>
              <div className="bg-indigo-500/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xs sm:text-sm text-white/60 mb-1">Registrations</h3>
                <p className="text-3xl sm:text-4xl font-bold">{allRegs.length}</p>
              </div>
              <div className="bg-green-500/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xs sm:text-sm text-white/60 mb-1">Approved</h3>
                <p className="text-3xl sm:text-4xl font-bold">{allRegs.filter(r => r.status === "APPROVED").length}</p>
              </div>
              <div className="bg-orange-500/10 p-4 sm:p-6 rounded-2xl sm:rounded-3xl">
                <h3 className="text-xs sm:text-sm text-white/60 mb-1">Pending</h3>
                <p className="text-3xl sm:text-4xl font-bold">{allRegs.filter(r => r.status === "PENDING").length}</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-xl rounded-2xl sm:rounded-3xl border border-white/20 shadow-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="min-w-[600px] w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="p-3 sm:p-4 text-white/60 font-semibold">Event</th>
                      <th className="p-3 sm:p-4 text-white/60 font-semibold">Student</th>
                      <th className="p-3 sm:p-4 text-white/60 font-semibold">Email</th>
                      <th className="p-3 sm:p-4 text-white/60 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allRegs.map(reg => (
                      <tr key={reg.id} className="border-b border-white/10 hover:bg-white/5 transition-colors">
                        <td className="p-3 sm:p-4">{reg.eventTitle}</td>
                        <td className="p-3 sm:p-4">{reg.studentName}</td>
                        <td className="p-3 sm:p-4">{reg.studentEmail}</td>
                        <td className="p-3 sm:p-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                            reg.status === "APPROVED" ? "bg-green-500/20 text-green-300" :
                            reg.status === "REJECTED" ? "bg-red-500/20 text-red-300" :
                            "bg-orange-500/20 text-orange-300"
                          }`}>
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
        )}

        {/* ── CREATE / EDIT MODAL ── */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
            <div className="bg-slate-900/95 border border-white/20 p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[92vh] overflow-y-auto">

              {/* Drag handle — mobile only */}
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-5 sm:hidden" />

              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold">
                  {showCreateModal ? "Launch New Event" : "Edit Event"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                  className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/10 hover:bg-white/20 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form
                onSubmit={showCreateModal ? handleCreateEvent : handleUpdateEvent}
                className="space-y-4"
              >
                {/* Title */}
                <input
                  required
                  placeholder="Event Title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors placeholder:text-white/30"
                  value={showCreateModal ? newEvent.title : editingEvent.title}
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({ ...newEvent, title: e.target.value })
                      : setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                />

                {/* Description */}
                <textarea
                  rows="3"
                  placeholder="Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors resize-none placeholder:text-white/30"
                  value={showCreateModal ? newEvent.description : editingEvent.description}
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({ ...newEvent, description: e.target.value })
                      : setEditingEvent({ ...editingEvent, description: e.target.value })
                  }
                />

                {/* Date + Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <input
                    required
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors"
                    value={showCreateModal ? newEvent.date : editingEvent.date}
                    onChange={e =>
                      showCreateModal
                        ? setNewEvent({ ...newEvent, date: e.target.value })
                        : setEditingEvent({ ...editingEvent, date: e.target.value })
                    }
                  />
                  <input
                    required
                    placeholder="Location"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors placeholder:text-white/30"
                    value={showCreateModal ? newEvent.location : editingEvent.location}
                    onChange={e =>
                      showCreateModal
                        ? setNewEvent({ ...newEvent, location: e.target.value })
                        : setEditingEvent({ ...editingEvent, location: e.target.value })
                    }
                  />
                </div>

                {/* Image URL */}
                <input
                  placeholder="Image URL (optional)"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors placeholder:text-white/30"
                  value={showCreateModal ? newEvent.imageUrl : editingEvent.imageUrl || ""}
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({ ...newEvent, imageUrl: e.target.value })
                      : setEditingEvent({ ...editingEvent, imageUrl: e.target.value })
                  }
                />

                {/* ✅ COORDINATOR DROPDOWN — ADMIN only (THIS WAS MISSING — root cause of the bug) */}
                {user?.role === "ADMIN" && (
                  <select
                    required
                    className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-sm sm:text-base outline-none focus:border-purple-400 transition-colors text-white"
                    value={
                      showCreateModal
                        ? newEvent.coordinatorId
                        : editingEvent.coordinator?.id || ""
                    }
                    onChange={e =>
                      showCreateModal
                        ? setNewEvent({ ...newEvent, coordinatorId: e.target.value })
                        : setEditingEvent({
                            ...editingEvent,
                            coordinator: { id: e.target.value },
                          })
                    }
                  >
                    <option value="" disabled>Select Coordinator</option>
                    {coordinators.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} — {c.email}
                      </option>
                    ))}
                  </select>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowCreateModal(false); setShowEditModal(false); }}
                    className="flex-1 p-3 sm:p-4 bg-white/10 hover:bg-white/20 active:scale-95 rounded-xl font-bold text-sm sm:text-base transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 p-3 sm:p-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 rounded-xl font-bold text-sm sm:text-base transition-all"
                  >
                    Save Event
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}