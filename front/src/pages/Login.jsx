import { useState } from "react";
import { apiFetch, setAccessToken } from "../api";
import { useNavigate, Link } from "react-router-dom";

export default function Login() { 
    const nav = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [log, setLog] = useState("");

    // Login function to authenticate user and store Access Token
    async function doLogin(e){
        e.preventDefault();
        setLog("🔐 Logging in...");
        const res = await fetch("http://localhost:8000/login", { // Backend listening on port 8000
           method: "POST",
           headers: { "Content-Type": "application/json" },
           credentials: "include",
           body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            setLog(`❌ Login error: ${res.status} ${JSON.stringify(data)}`);
            return;
        }

        setAccessToken(data.accessToken || null);
        setLog("✅ Login successful");
        await new Promise(resolve => setTimeout(resolve, 600)); // Small delay to show success message
        nav("/dashboard", { replace: true }); // Redirect to protected dashboard
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
        <div
          style={{
            background: "#161b22",
            padding: 30,
            borderRadius: 12,
            boxShadow: "0 0 25px rgba(0,0,0,0.4)",
            width: "100%",
            maxWidth: 420,
            color: "#eee",
            margin: "80px auto",
            fontFamily: "system-ui, sans-serif",
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: 20 }}>🔑 Login</h2>
    
          <form
            onSubmit={doLogin}
            style={{ display: "flex", flexDirection: "column", gap: 12 }}
          >
            <input
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={inputStyle}
            />
            <input
              placeholder="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={inputStyle}
            />
            <button type="submit" style={mainButton("#238636")}>
              Sign in
            </button>
          </form>
    
          <div
            style={{
              display: "flex",
              gap: 8,
              justifyContent: "space-between",
              marginTop: 12,
            }}
          >
            <button onClick={doVerify} style={miniBtn("#1e88e5")}>
              Verify
            </button>
            <button onClick={doRefresh} style={miniBtn("#f9a825")}>
              Refresh
            </button>
          </div>
    
          <p style={{ textAlign: "center", marginTop: 15, color: "#888" }}>
            Don’t have an account?{" "}
            <Link to="/register" style={{ color: "#58a6ff", textDecoration: "none" }}>
              Register
            </Link>
          </p>
    
          {log && (
            <pre style={logBox}>{log}</pre>
          )}
        </div>
      );
    }
    
    const inputStyle = {
      background: "#0d1117",
      color: "#eee",
      border: "1px solid #30363d",
      borderRadius: 8,
      padding: "10px",
      fontSize: 15,
      outline: "none",
      transition: "border 0.2s",
    };
    
    const mainButton = (color) => ({
      background: color,
      border: "none",
      borderRadius: 8,
      padding: "10px 0",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
      transition: "background 0.3s",
    });
    
    const miniBtn = (color) => ({
      background: color,
      border: "none",
      borderRadius: 6,
      padding: "8px 12px",
      color: "#fff",
      fontWeight: 600,
      cursor: "pointer",
    });
    
    const logBox = {
      background: "#0c0c0c",
      color: "#00ff9f",
      padding: 12,
      borderRadius: 8,
      marginTop: 16,
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",
    };