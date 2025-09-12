import { clearAccessToken } from "../api";

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
            <button onClick={doLogout}>Logout</button>
        </div>
    );
}