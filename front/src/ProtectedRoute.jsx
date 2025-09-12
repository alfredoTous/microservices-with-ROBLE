import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { getAccessToken } from "./api";

// Protect a route, ensuring user is authenticated
// If not authenticated try to refresh token, then redirect to login if that fails
export default function ProtectedRoute({ children }) {
    const [status, setStatus] = useState("checking"); // "checking", "ok", "not_logged_in"

    // On mount, ensure we are authenticated or redirect to login  
    useEffect(() => {
        async function ensureAuth() {
        const access_token = getAccessToken();
        if (!access_token) { setStatus("not_logged_in"); return; } // No AT, not logged in

        // Validate access token with backend
        try {
            const res = await fetch("http://localhost:8000/guard", {
            method: "GET",
            headers: { Authorization: `Bearer ${access_token}` },
            credentials: "include",
            });
            setStatus(res.ok ? "ok" : "not_logged_in");
        } catch {
            setStatus("not_logged_in");
        }
    } 
        ensureAuth();
    }, []);

    if (status === "checking") {
        return (
        <div style={{ padding: 16, border: "1px solid #ddd", borderRadius: 8 }}>
            Checking authentication...
        </div>
        );
    }

    if (status === "not_logged_in") {
        return (
        <div style={{ padding: 16, border: "1px solid #f5c2c7", background: "#f8d7da", color: "#842029", borderRadius: 8 }}>
            <b>Not Authenticated</b>
            <div style={{ marginTop: 8 }}>
            Must be logged in to view this page{" "}
            <Link to="/login" style={{ textDecoration: "underline" }}>Go to login</Link>
            </div>
        </div>
        );
    }

    return children;
    }
