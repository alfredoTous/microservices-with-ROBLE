import { clearAccessToken } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
    // Function to handle logout
    async function doLogout() {
        clearAccessToken();
        try {
            await fetch("http://localhost:8000/logout", {
                method: "POST",
                credentials: "include"
            });
        } catch {}
        window.location.href = "/login"; // Redirect to login page
    }
    
    return (
        <div>
            <h2>Dashboard</h2>
            <p>Only visible if logged in</p> 
            <div style={{ marginTop: 16, display: "flex", gap: 12 }}>
                <Link to="/create">
                <button>➕ Agregar microservicio</button>
                </Link>
                <button onClick={doLogout}>Logout</button>
            </div>
        </div>
    );
}