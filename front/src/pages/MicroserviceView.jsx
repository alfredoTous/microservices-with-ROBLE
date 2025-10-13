import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";

export default function MicroserviceView() {
  const { name } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch(`http://localhost:8000/microservices/${name}`);
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err.detail || `Error ${res.status}`);
        }
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err.message);
      }
    }
    fetchData();
  }, [name]);

  if (error)
    return (
      <div style={{ color: "#f55", padding: 20 }}>
        ❌ {error} <br />
        <Link to="/dashboard" style={{ color: "#0af" }}>
          ← back
        </Link>
      </div>
    );

  if (!data)
    return (
      <div style={{ color: "#ccc", padding: 20 }}>
        Loading results of {name}...
      </div>
    );

  return (
    <div
      style={{
        background: "#111",
        color: "#0f0",
        minHeight: "100vh",
        padding: 20,
        fontFamily: "monospace",
        whiteSpace: "pre-wrap",
      }}
    >
      <h2 style={{ color: "#fff" }}>🚀 {name}</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
      <Link to="/dashboard" style={{ color: "#0af" }}>
        ← back to dashboard
      </Link>
    </div>
  );
}
