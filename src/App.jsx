import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Users from "./pages/Users"; // The User Management Page
import Reports from "./pages/Reports"; // The New Analytics Page
import MainLayout from "./layouts/MainLayout";
import Approvals from "./pages/Approvals";
import Profile from "./pages/Profile";

const PrivateRoute = ({ children }) => {
  const user = JSON.parse(localStorage.getItem("user"));
  return user ? <MainLayout>{children}</MainLayout> : <Navigate to="/" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* All Protected Routes go inside the MainLayout */}
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        
        {/* Admin Routes */}
        <Route path="/users" element={<PrivateRoute><Users /></PrivateRoute>} />
        <Route path="/reports" element={<PrivateRoute><Reports /></PrivateRoute>} />

        <Route path="/approvals" element={<PrivateRoute><Approvals /></PrivateRoute>} />

        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}