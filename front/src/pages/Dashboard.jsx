import { useEffect, useState } from "react";
import { clearAccessToken } from "../api";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const [microservices, setMicroservices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [log, setLog] = useState("");

  // At load time, fetch microservices on backend
  async function fetchMicroservices() {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:8000/list-microservices");
      const data = await res.json();
      setMicroservices(data.microservices || []);
    } catch (err) {
      console.error("Error obteniendo microservicios:", err);
      setLog("Error cargando microservicios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchMicroservices();
  }, []);

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
    
  // ▶️ Turn on microservice
  async function startService(name) {
    setLog(`Starting microservice: ${name}...`);
    try {
      const res = await fetch("http://localhost:8000/start-microservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error at loading microservice");
      setLog(`✅ ${data.message}`);
      fetchMicroservices(); // Refresh list
    } catch (err) {
      setLog(`❌ Error: ${err.message}`);
    }
  }

  // ⛔ Turn off microservice
  async function stopService(name) {
    setLog(`Stopping Microservice ${name}...`);
    try {
      const res = await fetch("http://localhost:8000/stop-microservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error stopping microservice");
      setLog(`🛑 ${data.message}`);
      fetchMicroservices(); // Refresh list
    } catch (err) {
      setLog(`❌ Error: ${err.message}`);
    }
  }

  return (
    <div
      style={{
        maxWidth: 900,
        margin: "40px auto",
        fontFamily: "system-ui, sans-serif",
        color: "#f5f5f5",
        background: "#121212",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2>📦 Microservicios activos</h2>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/create">
            <button
              style={{
                background: "#00bfa5",
                border: "none",
                color: "white",
                padding: "8px 14px",
                borderRadius: 6,
                cursor: "pointer",
              }}
            >
              ➕ Add
            </button>
          </Link>
          <button
            onClick={doLogout}
            style={{
              background: "#c62828",
              border: "none",
              color: "white",
              padding: "8px 14px",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            🚪 Logout
          </button>
        </div>
      </div>

      {loading ? (
        <p style={{ textAlign: "center", color: "#888" }}>Loading...</p>
      ) : microservices.length === 0 ? (
        <p style={{ textAlign: "center", color: "#888" }}>
          No microservices created yet.
        </p>
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: 16,
          }}
        >
          {microservices.map((m) => (
            <div
              key={m.name}
              style={{
                background: "#1e1e1e",
                border: "1px solid #333",
                borderRadius: 10,
                padding: 18,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 0 8px rgba(0,0,0,0.4)",
              }}
            >
              <h3 style={{ marginBottom: 4 }}>{m.name}</h3>

              <p style={{ color: "#bbb", fontSize: 14 }}>
                📄 app.py: {m.has_app ? "✅" : "❌"} <br />
                🐳 Dockerfile: {m.has_dockerfile ? "✅" : "❌"} <br />
                🌐 Port: {m.port ? m.port : "—"} <br />
                Status:{" "}
                <span
                  style={{
                    color: m.running ? "#00e676" : "#ff5252",
                    fontWeight: "bold",
                  }}
                >
                  {m.running ? "On" : "Off"}
                </span>
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 10,
                  flexWrap: "wrap",
                  gap: 6,
                }}
              >
                <button
                  onClick={() =>
                    m.running ? stopService(m.name) : startService(m.name)
                  }
                  style={{
                    flex: 1,
                    background: m.running ? "#ff5252" : "#00e676",
                    border: "none",
                    color: "#fff",
                    borderRadius: 6,
                    padding: "6px 0",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  {m.running ? "⛔ Turn Off" : "▶️ Turn On"}
                </button>

                <button
                  onClick={() => alert(`Edit ${m.name}`)}
                  style={actionBtn("#039be5")}
                >
                  ✏️ Edit
                </button>

                <button
                  onClick={() => {
                    if (m.running && m.port) {
                      window.open(`http://localhost:${m.port}/test`, "_blank");
                    } else {
                      alert("Mircroservice is not running");
                    }
                  }}
                  style={actionBtn("#f9a825")}
                >
                  🧪 Test
                </button>

                <button
                  onClick={() => alert(`Delete ${m.name}`)}
                  style={actionBtn("#d32f2f")}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {log && (
        <pre
          style={{
            background: "#111",
            color: "#0f0",
            padding: 10,
            marginTop: 16,
            borderRadius: 8,
            whiteSpace: "pre-wrap",
          }}
        >
          {log}
        </pre>
      )}
    </div>
  );
}

function actionBtn(color) {
  return {
    flex: 1,
    background: color,
    border: "none",
    color: "white",
    borderRadius: 6,
    padding: "6px 0",
    cursor: "pointer",
    fontWeight: 600,
  };
}