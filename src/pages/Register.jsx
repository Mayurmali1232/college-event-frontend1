import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export default function Register() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: ""
  });

  const handleRegister = async () => {
    try {
      await API.post("/users/register", form);
      toast.success("Registration Successful!");
      navigate("/");
    } catch (err) {
      toast.error("Registration Failed. Please try again.");
    }
  };

  return (
    // 1. Full-screen background with the Festival Image
    <div 
      className="min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat relative font-sans selection:bg-purple-500 selection:text-white"
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=2070&auto=format&fit=crop')" 
      }}
    >
      {/* 2. Dark Overlay to make the form pop and text readable */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

      {/* 3. Premium Glassmorphism Card (Now floating above the overlay) */}
      <div className="relative z-10 w-full max-w-md bg-white/10 backdrop-blur-xl rounded-3xl border border-white/20 shadow-[0_8px_32px_0_rgba(31,38,135,0.37)] p-8 sm:p-10 mx-4">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-white to-purple-200 tracking-tight drop-shadow-md">
            Create Account
          </h2>
          <p className="text-indigo-100/90 mt-2 text-sm font-medium">
            Join the ultimate College Event platform
          </p>
        </div>

        {/* Form Fields */}
        <div className="space-y-5">
          
          {/* Name Input */}
          <div className="relative group">
            <input 
              type="text"
              placeholder="Full Name" 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 peer backdrop-blur-md"
              onChange={e => setForm({ ...form, name: e.target.value })} 
            />
          </div>

          {/* Email Input */}
          <div className="relative group">
            <input 
              type="email"
              placeholder="Email Address" 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 peer backdrop-blur-md"
              onChange={e => setForm({ ...form, email: e.target.value })} 
            />
          </div>

          {/* Password Input */}
          <div className="relative group">
            <input 
              type="password" 
              placeholder="Password" 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 peer backdrop-blur-md"
              onChange={e => setForm({ ...form, password: e.target.value })} 
            />
          </div>

          {/* Custom Select Dropdown */}
          <div className="relative group">
            <select 
              className="w-full bg-black/20 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 appearance-none cursor-pointer backdrop-blur-md"
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              <option value="" className="text-slate-900">Select Your Role</option>
              <option value="STUDENT" className="text-slate-900">Student</option>
              <option value="COORDINATOR" className="text-slate-900">Coordinator</option>
            </select>
            {/* Custom Dropdown Arrow */}
            <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/70">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
            </div>
          </div>

          {/* Interactive Button */}
          <button 
            onClick={handleRegister} 
            className="w-full mt-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-purple-500/30 transform hover:-translate-y-1 transition-all duration-300 active:translate-y-0 active:shadow-none border border-white/10"
          >
            Create Account
          </button>

        </div>

        {/* Return to Login Link */}
        <div className="mt-8 text-center text-sm text-indigo-100/70">
          Already have an account?{' '}
          <Link to="/" className="text-white font-bold hover:text-purple-300 hover:underline transition-colors drop-shadow-md">
            Log in here
          </Link>
        </div>

      </div>
    </div>
  );
}