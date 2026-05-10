import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function Sidebar() {
  const user = JSON.parse(localStorage.getItem("user"));
  const location = useLocation();
  const navigate = useNavigate();

  // MOBILE MENU STATE
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  // NAVIGATION ITEMS
  const getNavItems = () => {
    if (user?.role === "ADMIN") {
      return [
        {
          name: "System Dashboard",
          path: "/dashboard",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        },
        {
          name: "Manage Users",
          path: "/users",
          icon: "M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
        },
        {
          name: "System Reports",
          path: "/reports",
          icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
        }
      ];
    } else if (user?.role === "COORDINATOR") {
      return [
        {
          name: "Event Dashboard",
          path: "/dashboard",
          icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
        },
        {
          name: "Approvals",
          path: "/approvals",
          icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
        },
        {
          name: "Analytics",
          path: "/reports",
          icon: "M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
        }
      ];
    } else {
      return [
        {
          name: "Dashboard",
          path: "/dashboard",
          icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
        },
        {
          name: "My Profile",
          path: "/profile",
          icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
        }
      ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {/* ── MOBILE TOPBAR ── */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40"
           style={{ paddingTop: "env(safe-area-inset-top)" }}>
        <div className="h-14 bg-slate-900/95 backdrop-blur-md border-b border-slate-800/80
                        flex items-center justify-between px-4 shadow-lg shadow-black/20">

          {/* LOGO */}
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600
                            flex items-center justify-center shadow-md shadow-blue-500/30">
              <span className="text-white font-bold text-base">E</span>
            </div>
            <h1 className="text-white font-bold text-base tracking-wide">EventHub</h1>
          </div>

          {/* HAMBURGER — large tap target */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-10 h-10 flex items-center justify-center rounded-xl
                       text-slate-300 hover:text-white hover:bg-slate-800
                       active:bg-slate-700 transition-colors"
            aria-label="Toggle menu"
          >
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* ── BACKDROP ── */}
      <div
        className={`fixed inset-0 z-40 lg:hidden transition-all duration-300
                    ${isOpen ? "bg-black/60 backdrop-blur-sm pointer-events-auto"
                              : "bg-transparent pointer-events-none"}`}
        onClick={() => setIsOpen(false)}
      />

      {/* ── SIDEBAR ── */}
      <div
        className={`
          fixed top-0 left-0 h-screen
          w-[280px] lg:w-64
          bg-slate-900 border-r border-slate-800 shadow-2xl shadow-black/40
          flex flex-col
          z-50
          transition-transform duration-300 ease-in-out will-change-transform
          ${isOpen ? "translate-x-0" : "-translate-x-full"}
          lg:translate-x-0
        `}
        style={{ paddingTop: "env(safe-area-inset-top)",
                 paddingBottom: "env(safe-area-inset-bottom)" }}
      >
        {/* LOGO */}
        <div className="h-16 lg:h-20 flex items-center px-6 border-b border-slate-800 shrink-0">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600
                          flex items-center justify-center mr-3 shadow-lg shadow-blue-500/30">
            <span className="text-white font-bold text-lg">E</span>
          </div>
          <h1 className="text-white font-bold text-xl tracking-wide">EventHub</h1>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-3 py-6 space-y-1 overflow-y-auto overscroll-contain">
          <p className="px-4 text-[10px] font-semibold text-slate-500 uppercase tracking-widest mb-3">
            {user?.role} Menu
          </p>

          {navItems.map(item => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsOpen(false)}
                className={`
                  flex items-center gap-3 px-4 py-3.5 rounded-xl
                  transition-all duration-200 group
                  active:scale-[0.98]
                  ${isActive
                    ? "bg-blue-600/10 text-cyan-400 border border-blue-500/20 shadow-inner"
                    : "text-slate-400 hover:bg-slate-800/60 hover:text-slate-200 active:bg-slate-800"}
                `}
              >
                <svg
                  className={`w-5 h-5 shrink-0 transition-colors ${
                    isActive ? "text-cyan-400" : "text-slate-500 group-hover:text-slate-300"
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round"
                        strokeWidth="2" d={item.icon} />
                </svg>
                <span className="font-medium text-sm">{item.name}</span>

                {/* Active indicator dot */}
                {isActive && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-sm shadow-cyan-400/50" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* USER INFO */}
        <div className="p-3 border-t border-slate-800 shrink-0">
          <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-700/50">

            {/* Avatar + info row */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/30 to-blue-600/30
                              border border-slate-600/50 flex items-center justify-center shrink-0">
                <span className="text-cyan-400 font-bold text-sm">
                  {user?.name?.charAt(0)?.toUpperCase() ?? "U"}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">{user?.name}</p>
                <p className="text-slate-400 text-xs truncate">{user?.email}</p>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-3
                         bg-red-500/10 hover:bg-red-500/20 active:bg-red-500/30
                         text-red-400 rounded-xl font-medium text-sm
                         transition-colors border border-red-500/10
                         active:scale-[0.98]"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}