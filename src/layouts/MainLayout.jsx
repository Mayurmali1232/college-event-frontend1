import React from 'react';
import Sidebar from '../components/Sidebar';
import { Outlet } from 'react-router-dom'; // Allows nested routing

const MainLayout = ({ children }) => {
  return (
    <div className="flex h-screen bg-slate-50 font-sans overflow-hidden">
      
      {/* 1. Left Sidebar */}
      <Sidebar />

      {/* 2. Main Content Area (offset by the 64 width of the sidebar: pl-64) */}
      <div className="flex-1 flex flex-col ml-64 overflow-hidden relative">
        
        {/* Optional Top Navbar (for mobile toggles or notifications later) */}
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 flex items-center justify-end px-8 sticky top-0 z-20">
          <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 border-2 border-white rounded-full"></span>
          </button>
        </header>

        {/* Scrollable Page Content */}
        <main className="flex-1 overflow-y-auto p-8 relative z-10">
          {children || <Outlet />}
        </main>
        
      </div>
    </div>
  );
}

export default MainLayout;