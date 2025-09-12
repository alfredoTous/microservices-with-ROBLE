import { Route, Routes, Link } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";

export default function App() {
    return (
    <div style={{ maxWidth: 520, margin: "30px auto", fontFamily: "sans-serif" }}>
      <nav style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <Link to="/login">Login</Link>
        <Link to="/register">Register</Link>
      </nav>

      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
    );
}