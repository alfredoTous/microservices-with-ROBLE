import { useState } from "react";
import { apiFetch, setAccessToken } from "../api";

export default function Login() { 
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [log, setLog] = useState("");

    // Login function to authenticate user and store Access Token
    async function doLogin(e){
        e.preventDefault();
        setLog("Logging in...");
        const res = await fetch("http://localhost:8000/login", { // Backend listening on port 8000
           method: "POST",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            setLog(`Login error: ${res.status} ${JSON.stringify(data)}`);
            return;
        }

        setAccessToken(data.accessToken || null);
        setLog("Login successful");
    }

    // Verify function to check if Access Token is valid
    async function doVerify(){
        setLog("Verifying Token...");
        const res = await apiFetch("/verify-token");
        const data = await res.json();
        setLog(`Verify response: ${res.status} ${JSON.stringify(data)}`);
    }
    // Refresh function to get a new Access Token using the Refresh Token in HttpOnly cookie
    async function doRefresh(){
        setLog("Refreshing Token...");
        const res = await fetch("http://localhost:8000/refresh-token", {
            method: "POST",
            credentials: "include"
        });
        const data = await res.json();
        if (!res.ok) {
            setLog(`Refresh error: ${res.status} ${JSON.stringify(data)}`);
            return;
        }
        setAccessToken(data.accessToken || null);
        setLog("Token refreshed successfully");
    }
    // Simple UI for login, verify, and refresh
    return (
        <div style={{ maxWidth: 420, margin: "30px auto", fontFamily: "sans-serif" }}>
            <h2>Auth Front</h2>

            <form onSubmit={doLogin} style={{ display: "grid", gap: 8}}>
                <input placeholder="email" value={email} onChange={(e) => setEmail(e.target.value)}/>
                <input placeholder="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}/>
                <button type="submit">Login</button>
            </form>

            <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                <button onClick={doVerify}>Verify Token</button>
                <button onClick={doRefresh}>Refresh Token</button>
            </div>

            <pre style={{ background: "#111", color: "#0f0", padding: 10, marginTop: 12, whiteSpace: "pre-wrap" }}>
                {log}
            </pre>

        </div>
        
    );

}