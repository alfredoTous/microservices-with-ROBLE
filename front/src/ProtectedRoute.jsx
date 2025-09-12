import { useState, useEffect } from "react";
import { Navigate } from "react-router-dom";
import { getAccessToken, setAccessToken } from "./api";

// Protect a route, ensuring user is authenticated
// If not authenticated try to refresh token, then redirect to login if that fails
export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking..."); // "checking", "ok", "not_logged_in"

    // On mount, ensure we are authenticated or redirect to login           
    useEffect(() => {
        async function ensureAuth() {
            // If we have an Access Token, allow access to dashboard
            if (getAccessToken()) {
                setStatus("ok");
                return;
            }
        // No AccessToken, try using RefreshToken to get a new one
            try {
                const res = await fetch("http://localhost:8000/refresh-token", {
                    method: "POST",
                    credentials: "include"
                });
                if (!res.ok) {
                    setStatus("not_logged_in");
                    return;
                }
                const data = await res.json();
                setAccessToken(data.accessToken || null);
                setStatus("ok");
            } catch {
                setStatus("not_logged_in");
            }
        }
        ensureAuth();
    }, []);

    if (status === "checking") return null; 
    if (status === "not_logged_in") return <Navigate to="/login" replace />;

    return children;

}