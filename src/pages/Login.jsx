import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState(""); // UI var error dakhvnyasathi

  const handleLogin = async () => {
    setErrorMessage(""); 
    try {
      const res = await API.post("/users/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      // Backend message UI var dakhvne
      const msg = err.response?.data?.error || "Invalid Credentials";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans">
      {/* 1. BACKGROUND */}
      <div 
        className="absolute inset-0 z-0"
        style={{ 
          backgroundImage: "url('/images/Collpht.jpg')", 
          backgroundSize: 'cover', 
          backgroundPosition: 'center' 
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
      </div>

      {/* 2. LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md p-8 sm:p-10 bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl">
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white tracking-tight mb-2">Welcome Back</h2>
          <p className="text-slate-300 text-sm font-medium">Please enter your details to sign in.</p>
        </div>

        <div className="space-y-6">
          {/* Email Input */}
          <div className="relative">
            <input 
              type="email" 
              className="peer w-full px-4 pt-6 pb-2 bg-slate-800/50 border border-slate-600 rounded-xl text-white outline-none focus:border-cyan-400 transition-all"
              placeholder=" "
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                setErrorMessage(""); // Type karayla laglyavar error kadha
              }} 
            />
            <label className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5">Email Address</label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input 
              type="password" 
              className="peer w-full px-4 pt-6 pb-2 bg-slate-800/50 border border-slate-600 rounded-xl text-white outline-none focus:border-cyan-400 transition-all"
              placeholder=" "
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                setErrorMessage("");
              }} 
            />
            <label className="absolute left-4 top-4 text-slate-400 text-sm transition-all peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-2.5">Password</label>
          </div>

          {/* ⚠️ ERROR UI BLOCK */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl text-center text-sm font-bold animate-bounce">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button 
            onClick={handleLogin} 
            className="w-full py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-blue-600 to-cyan-500 hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-slate-400 mt-8 text-sm font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline ml-1">Register here</Link>
        </p>
      </div>
    </div>
  );
}