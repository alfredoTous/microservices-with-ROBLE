import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function CreateMicroservice() {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [code, setCode] = useState(`# Microservice Example
def hello():
    return {"message": "Hello, World!"}
`);
  const [log, setLog] = useState("");
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    const microservice = { title, desc, code };
    setLog(`Microservicio "${title}" creado (simulado).`);
    setTimeout(() => navigate("/dashboard"), 1500);
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
          <span style={{ fontWeight: 600 }}>Tittle</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ej: Hello"
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

        <button
          type="submit"
          style={{
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
          }}
        >
          {log}
        </div>
      )}
    </div>
  );
}
