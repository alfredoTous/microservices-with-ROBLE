import { useState } from "react";
import { Link } from "react-router-dom";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [log, setLog] = useState("");

  async function doRegister(e) {
    e.preventDefault();
    setLog("🧩 Registering...");
    const res = await fetch("http://localhost:8000/register", {
      method: "POST",
      headers: {"Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      setLog(`❌ Register error: ${res.status} ${JSON.stringify(data)}`);
      return;
    }
    setLog("✅ Registration successful");
  }

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
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>🧩 Register</h2>

      <form
        onSubmit={doRegister}
        style={{ display: "flex", flexDirection: "column", gap: 12 }}
      >
        <input
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={inputStyle}
        />
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
        <button type="submit" style={mainButton("#0078ff")}>
          Create account
        </button>
      </form>

      <p style={{ textAlign: "center", marginTop: 15, color: "#888" }}>
        Already have an account?{" "}
        <Link to="/login" style={{ color: "#58a6ff", textDecoration: "none" }}>
          Login
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

const logBox = {
  background: "#0c0c0c",
  color: "#00ff9f",
  padding: 12,
  borderRadius: 8,
  marginTop: 16,
  whiteSpace: "pre-wrap",
  wordBreak: "break-all",
};
