import { Route, Routes, Link, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import { getAccessToken } from "./api";
import CrweateMicroservice from "./pages/CreateMicroservice";

export default function App() {
    return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
        <Link to="/dashboard">Dashboard</Link>
      </nav>


      <Routes>
        <Route path="/" 
          element={getAccessToken() ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />} 
        />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        <Route path="/dashboard" 
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } 
        />

        <Route path="create" element={
          <ProtectedRoute>
            <CrweateMicroservice />
          </ProtectedRoute>
        } />
      </Routes>
    </div>
    );
}