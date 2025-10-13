import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function EditMicroservice() {
  const { name } = useParams();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [log, setLog] = useState("Loading...");

  // Get microservice code on load
  useEffect(() => {
    fetch(`http://localhost:8000/edit-microservice?name=${name}`)
      .then(res => res.json())
      .then(data => {
        if (data.code) {
          setCode(data.code);
          setLog(`Editing ${data.name}`);
        } else {
          setLog("❌ Error loading microservice code");
        }
      })
      .catch(err => setLog(`❌ ${err.message}`));
  }, [name]);

  // Save changes
  async function saveChanges() {
    setLog("Saving...");
    try {
      const res = await fetch("http://localhost:8000/edit-microservice", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, code }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || "Error at saving microservice");
      setLog(`✅ ${data.message}`);
    } catch (err) {
      setLog(`❌ ${err.message}`);
    }
  }

  return (
    <div style={{ padding: 20, color: "#eee", fontFamily: "monospace" }}>
      <h2>✏️ Edit Microservice: {name}</h2>
      <textarea
        value={code}
        onChange={e => setCode(e.target.value)}
        style={{
          width: "100%",
          height: "70vh",
          background: "#111",
          color: "#0f0",
          border: "1px solid #333",
          borderRadius: 6,
          padding: 10,
          fontFamily: "monospace",
          fontSize: 14,
          lineHeight: "1.4em",
          resize: "none",
        }}
      />
      <div style={{ marginTop: 10, display: "flex", gap: 8 }}>
        <button
          onClick={saveChanges}
          style={{
            background: "#00e676",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          💾 Save
        </button>
        <button
          onClick={() => navigate("/dashboard")}
          style={{
            background: "#555",
            border: "none",
            padding: "8px 12px",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          🔙 Back
        </button>
      </div>
      <div style={{ marginTop: 10, color: "#aaa" }}>{log}</div>
    </div>
  );
}
