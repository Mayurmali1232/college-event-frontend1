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
        API.get("/registrations/pending").then(res =>
          setPendingRegs(res.data)
        );
        API.get("/registrations/all").then(res =>
          setAllRegs(res.data)
        );
        API.get("/users").then(res =>
          setCoordinators(
            res.data.filter(u => u.role === "COORDINATOR")
          )
        );
      } else if (user?.role === "COORDINATOR") {
        API.get(`/events/coordinator/${user.id}`).then(res =>
          setEvents(res.data)
        );

        API.get(
          `/registrations/pending/coordinator/${user.id}`
        ).then(res => setPendingRegs(res.data));

        API.get(
          `/registrations/coordinator/${user.id}/all`
        ).then(res => setAllRegs(res.data));
      } else if (user?.role === "STUDENT") {
        API.get("/events").then(res => setEvents(res.data));

        API.get(
          `/registrations/student/${parseInt(user.id)}`
        ).then(res => setMyRegistrations(res.data));
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
        user?.role === "ADMIN"
          ? newEvent.coordinatorId
          : user?.id;

      if (!assignedCoordinatorId)
        return toast.error("Please select a coordinator!");

      const payload = {
        title: newEvent.title,
        description: newEvent.description,
        date: newEvent.date,
        location: newEvent.location,
        imageUrl:
          newEvent.imageUrl === ""
            ? null
            : newEvent.imageUrl,

        coordinator: {
          id: parseInt(assignedCoordinatorId),
        },
      };

      await API.post("/events", payload);

      toast.success("Event Created Successfully!");
      setShowCreateModal(false);
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
        imageUrl:
          editingEvent.imageUrl === ""
            ? null
            : editingEvent.imageUrl,

        coordinator: {
          id: parseInt(
            editingEvent.coordinator?.id || user.id
          ),
        },
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
 const handleParticipate = async (eventId) => {
  try {

    const payload = {
      student: {
        id: parseInt(user.id),
      },
      event: {
        id: parseInt(eventId),
      },
    };

    console.log(payload);

    const response = await API.post(
      "/registrations",
      payload
    );

    console.log(response.data);

    toast.success("Successfully Registered!");
    fetchData();

  } catch (err) {

    console.log(err);

    console.log(err.response);

    console.log(err.response?.data);

    toast.error("Registration failed.");
  }
};

  // Update Registration
  const updateRegistrationStatus = async (
    regId,
    status
  ) => {
    try {
      await API.put(
        `/registrations/${regId}/${status}`
      );

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
    const headers =
      "Event Title,Student Name,Student Email,Status\n";

    const rows = allRegs
      .map(
        r =>
          `"${r.eventTitle || ""}","${
            r.studentName || ""
          }","${r.studentEmail || ""}","${
            r.status || ""
          }"`
      )
      .join("\n");

    const csvContent =
      "data:text/csv;charset=utf-8," + headers + rows;

    const encodedUri = encodeURI(csvContent);

    const link = document.createElement("a");

    link.setAttribute("href", encodedUri);

    link.setAttribute(
      "download",
      "Global_Event_Report.csv"
    );

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

      <div className="relative z-10 px-4 sm:px-6 md:px-12 py-6 pb-24 max-w-7xl mx-auto">

        {/* HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-10 bg-white/5 backdrop-blur-xl border border-white/10 p-4 sm:p-6 rounded-3xl shadow-lg gap-4">

          <div className="text-center lg:text-left">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-300">
              {user?.role === "ADMIN"
                ? "Global Event Headquarters"
                : user?.role === "COORDINATOR"
                ? "Coordinator Portal"
                : "Student Dashboard"}
            </h1>

            <p className="text-indigo-200 mt-1 text-sm sm:text-base">
              Welcome back, {user?.name}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto">

            {isAdminOrCoordinator && (
              <button
                onClick={() =>
                  setShowCreateModal(true)
                }
                className="w-full sm:w-auto bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-3 px-6 rounded-xl shadow-lg transition-all"
              >
                + Create Event
              </button>
            )}

            <button
              onClick={handleLogout}
              className="w-full sm:w-auto bg-white/10 hover:bg-red-500/80 border border-white/20 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              Logout
            </button>
          </div>
        </div>

        {/* TABS */}
        <div className="flex overflow-x-auto gap-3 mb-8 pb-2 scrollbar-hide">

          <button
            onClick={() =>
              setActiveTab("UPCOMING")
            }
            className={`whitespace-nowrap font-bold px-4 sm:px-6 py-3 rounded-xl transition-all ${
              activeTab === "UPCOMING"
                ? "bg-gradient-to-r from-purple-600 to-indigo-600"
                : "bg-white/5 border border-white/10"
            }`}
          >
            {isAdminOrCoordinator
              ? "Global Events"
              : "Browse Upcoming"}
          </button>

          {user?.role === "STUDENT" && (
            <button
              onClick={() =>
                setActiveTab("MY_EVENTS")
              }
              className={`whitespace-nowrap font-bold px-4 sm:px-6 py-3 rounded-xl transition-all ${
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
                onClick={() =>
                  setActiveTab("PENDING")
                }
                className={`whitespace-nowrap font-bold px-4 sm:px-6 py-3 rounded-xl transition-all ${
                  activeTab === "PENDING"
                    ? "bg-gradient-to-r from-orange-500 to-pink-600"
                    : "bg-white/5 border border-white/10"
                }`}
              >
                Pending Approvals
              </button>

              <button
                onClick={() =>
                  setActiveTab("REPORTS")
                }
                className={`whitespace-nowrap font-bold px-4 sm:px-6 py-3 rounded-xl transition-all ${
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

        {/* EVENTS */}
        {activeTab === "UPCOMING" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">

            {events.map(e => {
              const isRegistered =
                myRegistrations.some(
                  reg => reg.event?.id === e.id
                );

              return (
                <div
                  key={e.id}
                  className="bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden flex flex-col"
                >
                  {e.imageUrl ? (
                    <img
                      src={e.imageUrl}
                      alt={e.title}
                      className="w-full h-48 sm:h-56 object-cover"
                    />
                  ) : (
                    <div className="w-full h-48 sm:h-56 bg-gradient-to-br from-indigo-500/40 to-purple-500/40 flex items-center justify-center">
                      <span>No Image</span>
                    </div>
                  )}

                  <div className="p-5 sm:p-6 flex flex-col flex-grow">

                    <h3 className="text-xl sm:text-2xl font-bold mb-2">
                      {e.title}
                    </h3>

                    <p className="text-purple-300 text-sm mb-3">
                      {e.date} • {e.location}
                    </p>

                    <p className="text-white/80 text-sm flex-grow mb-6">
                      {e.description}
                    </p>

                    {user?.role === "STUDENT" && (
                      <button
                        onClick={() =>
                          handleParticipate(e.id)
                        }
                        disabled={isRegistered}
                        className={`w-full font-bold py-3 rounded-xl ${
                          isRegistered
                            ? "bg-green-500/20 text-green-300"
                            : "bg-indigo-600 hover:bg-indigo-500"
                        }`}
                      >
                        {isRegistered
                          ? "✓ Already Registered"
                          : "Register Now"}
                      </button>
                    )}

                    {isAdminOrCoordinator && (
                      <div className="flex flex-col sm:flex-row gap-2 mt-auto">

                        <button
                          onClick={() => {
                            setEditingEvent(e);
                            setShowEditModal(true);
                          }}
                          className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() =>
                            handleDeleteEvent(e.id)
                          }
                          className="flex-1 bg-red-500/20 hover:bg-red-500/40 py-2 rounded-lg"
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

        {/* REPORTS */}
        {activeTab === "REPORTS" &&
          isAdminOrCoordinator && (
            <div className="space-y-6">

              <div className="flex flex-col sm:flex-row gap-4 justify-between sm:items-center">

                <h2 className="text-2xl sm:text-3xl font-bold">
                  System Analytics
                </h2>

                <button
                  onClick={exportToCSV}
                  className="w-full sm:w-auto bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-2 px-6 rounded-lg"
                >
                  ⬇ Download CSV
                </button>
              </div>

              {/* KPI */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">

                <div className="bg-white/5 p-6 rounded-3xl">
                  <h3>Total Events</h3>
                  <p className="text-4xl font-bold">
                    {events.length}
                  </p>
                </div>

                <div className="bg-indigo-500/10 p-6 rounded-3xl">
                  <h3>Total Registrations</h3>
                  <p className="text-4xl font-bold">
                    {allRegs.length}
                  </p>
                </div>

                <div className="bg-green-500/10 p-6 rounded-3xl">
                  <h3>Approved</h3>
                  <p className="text-4xl font-bold">
                    {
                      allRegs.filter(
                        r =>
                          r.status === "APPROVED"
                      ).length
                    }
                  </p>
                </div>

                <div className="bg-orange-500/10 p-6 rounded-3xl">
                  <h3>Pending</h3>
                  <p className="text-4xl font-bold">
                    {
                      allRegs.filter(
                        r =>
                          r.status === "PENDING"
                      ).length
                    }
                  </p>
                </div>
              </div>

              {/* TABLE */}
              <div className="bg-white/5 backdrop-blur-xl rounded-3xl border border-white/20 shadow-xl overflow-hidden p-4 sm:p-8">

                <div className="overflow-x-auto">

                  <table className="min-w-[700px] w-full text-left">

                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="p-4">Event</th>
                        <th className="p-4">Student</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {allRegs.map(reg => (
                        <tr
                          key={reg.id}
                          className="border-b border-white/10"
                        >
                          <td className="p-4">
                            {reg.eventTitle}
                          </td>

                          <td className="p-4">
                            {reg.studentName}
                          </td>

                          <td className="p-4">
                            {reg.studentEmail}
                          </td>

                          <td className="p-4">
                            {reg.status}
                          </td>
                        </tr>
                      ))}
                    </tbody>

                  </table>
                </div>
              </div>
            </div>
          )}

        {/* MODALS */}
        {(showCreateModal || showEditModal) && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4">

            <div className="bg-slate-900/90 border border-white/20 p-5 sm:p-8 rounded-3xl w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">

              <h2 className="text-2xl font-bold mb-6">
                {showCreateModal
                  ? "Launch New Event"
                  : "Edit Event"}
              </h2>

              <form
                onSubmit={
                  showCreateModal
                    ? handleCreateEvent
                    : handleUpdateEvent
                }
                className="space-y-4"
              >
                <input
                  required
                  placeholder="Title"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={
                    showCreateModal
                      ? newEvent.title
                      : editingEvent.title
                  }
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({
                          ...newEvent,
                          title: e.target.value,
                        })
                      : setEditingEvent({
                          ...editingEvent,
                          title: e.target.value,
                        })
                  }
                />

                <textarea
                  placeholder="Description"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={
                    showCreateModal
                      ? newEvent.description
                      : editingEvent.description
                  }
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({
                          ...newEvent,
                          description:
                            e.target.value,
                        })
                      : setEditingEvent({
                          ...editingEvent,
                          description:
                            e.target.value,
                        })
                  }
                ></textarea>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                  <input
                    required
                    type="date"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    value={
                      showCreateModal
                        ? newEvent.date
                        : editingEvent.date
                    }
                    onChange={e =>
                      showCreateModal
                        ? setNewEvent({
                            ...newEvent,
                            date: e.target.value,
                          })
                        : setEditingEvent({
                            ...editingEvent,
                            date: e.target.value,
                          })
                    }
                  />

                  <input
                    required
                    placeholder="Location"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                    value={
                      showCreateModal
                        ? newEvent.location
                        : editingEvent.location
                    }
                    onChange={e =>
                      showCreateModal
                        ? setNewEvent({
                            ...newEvent,
                            location:
                              e.target.value,
                          })
                        : setEditingEvent({
                            ...editingEvent,
                            location:
                              e.target.value,
                          })
                    }
                  />
                </div>

                <input
                  placeholder="Image URL"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3"
                  value={
                    showCreateModal
                      ? newEvent.imageUrl
                      : editingEvent.imageUrl || ""
                  }
                  onChange={e =>
                    showCreateModal
                      ? setNewEvent({
                          ...newEvent,
                          imageUrl:
                            e.target.value,
                        })
                      : setEditingEvent({
                          ...editingEvent,
                          imageUrl:
                            e.target.value,
                        })
                  }
                />

                <div className="flex flex-col sm:flex-row gap-3 mt-6">

                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false);
                      setShowEditModal(false);
                    }}
                    className="flex-1 p-4 bg-white/10 rounded-xl"
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="flex-1 p-4 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl"
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