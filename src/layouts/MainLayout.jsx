import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom';

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">

      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area
            - ml-64 only on desktop (lg:ml-64), zero on mobile
            - pt-14 on mobile to clear the fixed topbar, zero on desktop (lg:pt-0)
      */}
      <div className="flex-1 flex flex-col lg:ml-64 pt-14 lg:pt-0 overflow-hidden relative">

        {/* Top Navbar — desktop only */}
        <header className="hidden lg:flex h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 items-center justify-end px-8 sticky top-0 z-20">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full" />
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 relative z-10">
          {children || <Outlet />}
        </main>

      </div>
    </div>
  );
};

export default MainLayout;