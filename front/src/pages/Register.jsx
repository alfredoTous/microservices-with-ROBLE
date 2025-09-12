import { useState } from "react";

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [log, setLog] = useState("");

    async function doRegister(e){
        e.preventDefault();
        setLog("Registering...");
        const res = await fetch("http://localhost:8000/register", {
            method: "POST",
            headers: {"Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ name, email, password })
        });

        const data = await res.json();
        if (!res.ok) {
            setLog(`Register error: ${res.status} ${JSON.stringify(data)}`);
            return;
        }
        setLog("Registration successful");
    }

    return (
        <div>
            <h2>Register</h2>
            <form onSubmit={doRegister} style={{ display: "grid", gap: 8 }}>
                <input placeholder="name" value={name} onChange={e => setName(e.target.value)} />
                <input placeholder="email" value={email} onChange={e => setEmail(e.target.value)} />
                <input placeholder="password" type="password" value={password} onChange={e => setPassword(e.target.value)} />
                <button type="submit">Create account</button>
            </form>
            <pre style={{ background:"#111", color:"#0f0", padding:10, marginTop:12, whiteSpace:"pre-wrap" }}>{log}</pre>
        </div>
    );

}