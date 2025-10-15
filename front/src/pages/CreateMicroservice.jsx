import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAccessToken } from "../api"; 

export default function CreateMicroservice() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState(`# Microservice Example
def hello():
    return {"message": "Hello, World!"}
`);
  const [log, setLog] = useState("");
  const navigate = useNavigate();

  // Get Access Token from front memory
  function handleGetAccessToken() {
    const token = getAccessToken();
    if (!token) {
      setLog("⚠️ No AccessToken");
    } else {
      setLog(`AccessToken:\n${token}`);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const microservice = { title, desc, code };

    try {
      const res = await fetch("http://localhost:8000/create-microservice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(microservice),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Unknown error");
      setLog(data.message);
      setTimeout(() => navigate("/dashboard"), 2000);
    } catch (err) {
      setLog(`Error: ${err.message}`);
    }
  }

  return (
    <div
      style={{
        maxWidth: 700,
        margin: "40px auto",
        fontFamily: "system-ui, sans-serif",
        color: "#f5f5f5",
        background: "#121212",
        padding: 30,
        borderRadius: 12,
        boxShadow: "0 0 15px rgba(0,0,0,0.5)",
      }}
    >
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>
        🧩 Create New Microservice
      </h2>

      <form
        onSubmit={handleSubmit}
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: hello"
            required
            style={{
              background: "#1e1e1e",
              color: "#fff",
              border: "1px solid #333",
              borderRadius: 6,
              padding: "8px 10px",
              fontSize: 15,
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Description</span>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={3}
            placeholder="Describe microservice"
            style={{
              background: "#1e1e1e",
              color: "#ddd",
              border: "1px solid #333",
              borderRadius: 6,
              padding: 10,
              fontSize: 15,
              resize: "vertical",
            }}
          />
        </label>

        <label style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <span style={{ fontWeight: 600 }}>Python Code</span>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            rows={12}
            spellCheck="false"
            style={{
              background: "#0d1117",
              color: "#00ff9f",
              fontFamily: "monospace",
              border: "1px solid #333",
              borderRadius: 8,
              padding: 12,
              lineHeight: 1.4,
              resize: "vertical",
            }}
          />
        </label>

        <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
          <button
            type="button"
            onClick={handleGetAccessToken}
            style={{
              flex: 1,
              background: "#ffa500",
              color: "#000",
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              cursor: "pointer",
              fontSize: 15,
              transition: "all 0.2s ease",
            }}
          >
            🔑 Get AccessToken
          </button>

          <button
            type="submit"
            style={{
              flex: 1,
              background: "#000",
              color: "#fff",
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              padding: "12px 0",
              cursor: "pointer",
              fontSize: 16,
              transition: "all 0.2s ease",
            }}
          >
            Save Microservice
          </button>
        </div>
      </form>

      {log && (
  <div
    style={{
      background: "#111",
      color: "#0f0",
      padding: 12,
      marginTop: 18,
      borderRadius: 8,
      fontFamily: "monospace",
      whiteSpace: "pre-wrap",
      wordBreak: "break-all",     
      overflowWrap: "anywhere",    
      maxHeight: "200px",          
      overflowY: "auto",          
      lineHeight: 1.4,
      textAlign: "left",           
      transition: "max-height 0.3s ease",
    }}
  >
    {log}
  </div>
)}
    </div>
  );
}
