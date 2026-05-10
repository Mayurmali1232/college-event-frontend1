import React, { useState } from "react";
import toast from "react-hot-toast";

export default function Profile() {
  // 1. Base State
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const [activeTab, setActiveTab] = useState("overview");
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);

  // 2. Modal States
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showCoverModal, setShowCoverModal] = useState(false);

  // 3. Form Data States
  const [coverStyle, setCoverStyle] = useState("from-blue-600 via-indigo-600 to-purple-700");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    phone: "",
    about: "Passionate student currently pursuing Computer Engineering at Dr. Babasaheb Ambedkar Technological University (DBATU) in Pune. Actively participating in college events to improve communication and leadership skills. Aspiring Java Developer with a strong interest in full-stack architecture."
  });

  if (!user) {
    return <div className="p-12 text-center text-red-500 font-bold">Please log in to view your profile.</div>;
  }

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2) : '?';
  };

  // ----------------------------------------------------
  // HANDLERS
  // ----------------------------------------------------
  const handleProfileSave = (e) => {
    e.preventDefault();
    const updatedUser = { ...user, name: profileData.name };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    setUser(updatedUser);
    toast.success("Profile updated successfully!");
    setShowProfileModal(false);
  };

  const handleCoverSave = (e, newColor) => {
    e.preventDefault();
    setCoverStyle(newColor);
    toast.success("Cover background updated!");
    setShowCoverModal(false);
  };

  const completionPercentage = profileData.phone.length > 5 ? "100%" : "85%";

  return (
    <div className="min-h-screen bg-slate-50/50 font-sans relative">

      <div className="max-w-6xl mx-auto">

        {/* HEADER BANNER */}
        <div className="relative w-full h-44 sm:h-64 md:h-80 sm:rounded-3xl overflow-hidden shadow-lg">
          <div className={`absolute inset-0 bg-gradient-to-br ${coverStyle} transition-all duration-500`}></div>
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-white opacity-10 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-72 h-72 rounded-full bg-blue-400 opacity-20 blur-2xl"></div>

          {/* Edit Cover Button */}
          <button
            onClick={() => setShowCoverModal(true)}
            className="absolute top-4 right-4 sm:top-6 sm:right-6 bg-white/20 hover:bg-white/30 backdrop-blur-md text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl font-semibold text-xs sm:text-sm transition-all flex items-center gap-2 border border-white/20 shadow-sm active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            <span className="hidden sm:inline">Edit Cover</span>
          </button>
        </div>

        {/* MAIN CONTENT GRID */}
        <div className="relative -mt-16 sm:-mt-24 px-3 sm:px-4 md:px-8 grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 pb-8">

          {/* LEFT COLUMN - Profile Card */}
          <div className="col-span-1">
            <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl shadow-slate-200/50 border border-slate-100 relative">

              {/* Avatar */}
              <div
                className="relative w-24 h-24 sm:w-32 sm:h-32 mx-auto -mt-16 sm:-mt-20 mb-3 sm:mb-4 rounded-full border-4 border-white shadow-lg cursor-pointer overflow-hidden group"
                onMouseEnter={() => setIsHoveringAvatar(true)}
                onMouseLeave={() => setIsHoveringAvatar(false)}
                onClick={() => setShowProfileModal(true)}
              >
                <div className="w-full h-full bg-slate-900 flex items-center justify-center text-white text-3xl sm:text-4xl font-black">
                  {getInitials(user.name)}
                </div>
                <div className={`absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center transition-opacity duration-300 ${isHoveringAvatar ? 'opacity-100' : 'opacity-0'}`}>
                  <svg className="w-7 h-7 sm:w-8 sm:h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                  </svg>
                </div>
              </div>

              {/* User Info */}
              <div className="text-center mb-4 sm:mb-6">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 truncate">{user.name}</h2>
                <p className="text-slate-500 font-medium text-sm truncate">{user.email}</p>
                <div className="mt-2 sm:mt-3 inline-block bg-blue-50 text-blue-600 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full font-bold text-xs uppercase tracking-wider border border-blue-100">
                  {user.role || "STUDENT"}
                </div>
              </div>

              {/* Profile Completion Bar */}
              <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-bold text-slate-500 uppercase">Profile Completion</span>
                  <span className="text-xs font-bold text-blue-600">{completionPercentage}</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full transition-all duration-1000" style={{ width: completionPercentage }}></div>
                </div>
                {completionPercentage === "85%" && (
                  <p className="text-xs text-slate-500 mt-2 sm:mt-3 flex items-center gap-1">
                    <svg className="w-3 h-3 text-orange-500 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
                    </svg>
                    Add your phone number to reach 100%
                  </p>
                )}
              </div>

              {/* Edit Profile Button */}
              <button
                onClick={() => setShowProfileModal(true)}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 active:bg-slate-700 active:scale-[0.98] text-white rounded-xl font-bold transition-all shadow-md text-sm sm:text-base"
              >
                Edit Public Profile
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="col-span-1 lg:col-span-2 mt-0 lg:mt-8">

            {/* Tabs */}
            <div className="bg-white rounded-xl sm:rounded-2xl p-1.5 sm:p-2 shadow-sm border border-slate-200 flex gap-1 sm:gap-2 mb-4 sm:mb-6">
              {['overview', 'activity', 'settings'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`flex-1 py-2.5 sm:py-3 px-2 sm:px-4 rounded-xl font-bold text-xs sm:text-sm capitalize transition-all active:scale-[0.97] ${activeTab === tab ? 'bg-blue-50 text-blue-700 shadow-sm border border-blue-100' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === "overview" && (
              <div className="space-y-4 sm:space-y-6 animate-fade-in-up">
                <div className="bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 shadow-sm border border-slate-200">
                  <div className="flex justify-between items-center mb-3 sm:mb-4">
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-blue-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                      </svg>
                      About Me
                    </h3>
                    <button onClick={() => setShowProfileModal(true)} className="text-blue-600 hover:underline text-xs sm:text-sm font-bold shrink-0">Edit</button>
                  </div>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-line text-sm sm:text-base">
                    {profileData.about}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* EDIT PROFILE MODAL */}
      {showProfileModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Edit Profile</h2>
              <button onClick={() => setShowProfileModal(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Drag handle for mobile */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden"></div>

            <form onSubmit={handleProfileSave} className="space-y-4 sm:space-y-5">
              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">Full Name</label>
                <input
                  type="text"
                  value={profileData.name}
                  onChange={e => setProfileData({...profileData, name: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">Phone Number <span className="text-slate-400 font-normal">(Optional)</span></label>
                <input
                  type="text"
                  placeholder="+91"
                  value={profileData.phone}
                  onChange={e => setProfileData({...profileData, phone: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors text-sm sm:text-base"
                />
              </div>

              <div>
                <label className="text-xs sm:text-sm font-bold text-slate-700">About Me / Bio</label>
                <textarea
                  rows="4"
                  value={profileData.about}
                  onChange={e => setProfileData({...profileData, about: e.target.value})}
                  className="w-full mt-1 p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-blue-500 transition-colors resize-none text-sm sm:text-base"
                ></textarea>
              </div>

              <div className="pt-2 sm:pt-4 flex gap-3">
                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 p-3 font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200 active:scale-[0.98] transition-all text-sm sm:text-base">Cancel</button>
                <button type="submit" className="flex-1 p-3 font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 active:scale-[0.98] transition-all text-sm sm:text-base">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT COVER MODAL */}
      {showCoverModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
          <div className="bg-white p-5 sm:p-8 rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md shadow-2xl">
            <div className="flex justify-between items-center mb-5 sm:mb-6">
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Choose Cover Theme</h2>
              <button onClick={() => setShowCoverModal(false)} className="text-slate-400 hover:text-slate-600 w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 transition-colors">
                <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            {/* Drag handle for mobile */}
            <div className="w-10 h-1 bg-slate-200 rounded-full mx-auto mb-5 sm:hidden"></div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <button onClick={(e) => handleCoverSave(e, "from-blue-600 via-indigo-600 to-purple-700")} className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 hover:ring-4 active:scale-95 ring-blue-300 transition-all"></button>
              <button onClick={(e) => handleCoverSave(e, "from-emerald-500 to-teal-700")} className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 hover:ring-4 active:scale-95 ring-emerald-300 transition-all"></button>
              <button onClick={(e) => handleCoverSave(e, "from-rose-500 to-orange-600")} className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 hover:ring-4 active:scale-95 ring-rose-300 transition-all"></button>
              <button onClick={(e) => handleCoverSave(e, "from-slate-800 to-slate-900")} className="h-20 sm:h-24 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 hover:ring-4 active:scale-95 ring-slate-400 transition-all"></button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}