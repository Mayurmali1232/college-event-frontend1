import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API } from "../api/axios";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async () => {
    setErrorMessage("");
    try {
      const res = await API.post("/users/login", form);
      localStorage.setItem("user", JSON.stringify(res.data));
      toast.success("Login Successful");
      navigate("/dashboard");
    } catch (err) {
      const msg = err.response?.data?.error || "Invalid Credentials";
      setErrorMessage(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center font-sans px-4"
         style={{ paddingTop: "env(safe-area-inset-top)", paddingBottom: "env(safe-area-inset-bottom)" }}>

      {/* 1. BACKGROUND */}
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: "url('/images/Collpht.jpg')",
          backgroundSize: "cover",
          backgroundPosition: "center"
        }}
      >
        <div className="absolute inset-0 bg-slate-900/60 mix-blend-multiply"></div>
      </div>

      {/* 2. LOGIN CARD */}
      <div className="relative z-10 w-full max-w-md bg-slate-900/70 backdrop-blur-xl border border-slate-700/50 rounded-[2rem] shadow-2xl
                      p-6 sm:p-10 my-6">

        {/* Logo mark */}
        <div className="flex justify-center mb-6 sm:mb-8">
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600
                          flex items-center justify-center shadow-lg shadow-blue-500/30">
            <span className="text-white font-black text-xl sm:text-2xl">E</span>
          </div>
        </div>

        <div className="text-center mb-7 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-1.5 sm:mb-2">
            Welcome Back
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm font-medium">
            Please enter your details to sign in.
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">

          {/* Email Input */}
          <div className="relative">
            <input
              type="email"
              className="peer w-full px-4 pt-6 pb-2 bg-slate-800/50 border border-slate-600 rounded-xl
                         text-white text-sm sm:text-base outline-none focus:border-cyan-400 transition-all
                         autofill:bg-slate-800/50"
              placeholder=" "
              onChange={e => {
                setForm({ ...form, email: e.target.value });
                setErrorMessage("");
              }}
            />
            <label className="absolute left-4 top-4 text-slate-400 text-xs sm:text-sm transition-all
                              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                              peer-focus:scale-75 peer-focus:-translate-y-2.5">
              Email Address
            </label>
          </div>

          {/* Password Input */}
          <div className="relative">
            <input
              type="password"
              className="peer w-full px-4 pt-6 pb-2 bg-slate-800/50 border border-slate-600 rounded-xl
                         text-white text-sm sm:text-base outline-none focus:border-cyan-400 transition-all"
              placeholder=" "
              onChange={e => {
                setForm({ ...form, password: e.target.value });
                setErrorMessage("");
              }}
            />
            <label className="absolute left-4 top-4 text-slate-400 text-xs sm:text-sm transition-all
                              peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0
                              peer-focus:scale-75 peer-focus:-translate-y-2.5">
              Password
            </label>
          </div>

          {/* ERROR BLOCK */}
          {errorMessage && (
            <div className="bg-red-500/10 border border-red-500/50 text-red-400 p-3 rounded-xl
                            text-center text-xs sm:text-sm font-bold animate-bounce">
              ⚠️ {errorMessage}
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleLogin}
            className="w-full py-3.5 rounded-xl font-bold text-white text-sm sm:text-base
                       bg-gradient-to-r from-blue-600 to-cyan-500
                       hover:shadow-[0_0_20px_rgba(6,182,212,0.4)]
                       active:scale-[0.98] active:shadow-none
                       transition-all"
          >
            Sign In
          </button>
        </div>

        <p className="text-center text-slate-400 mt-6 sm:mt-8 text-xs sm:text-sm font-medium">
          Don't have an account?{" "}
          <Link to="/register" className="text-cyan-400 hover:underline ml-1 font-semibold">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}