let ACCESS_TOKEN = null;

// Setter for Access Token
export const setAccessToken = (t) => {
  ACCESS_TOKEN = t;
}

// Function to refresh Access Token using the Refresh Token stored in HttpOnly cookie
async function refreshAccessToken() {
    const res = await fetch("http://localhost:8000/auth/refresh-token", {
        method: "POST",
        credentials: "include"
    });
    if (!res.ok) throw new Error("Failed to refresh access token");
    const data = await res.json();
    setAccessToken(data.accessToken ?? null);
    return ACCESS_TOKEN;
}


// Function to make authenticated API requests including Access Token and handle token refresh
export async function apiFetch(path, options = {}, retry = true) {
    const headers = new Headers(options.headers || {});

    if (ACCESS_TOKEN) {
        headers.set("Authorization", `Bearer ${ACCESS_TOKEN}`);
    }

    const res = await fetch(`http://localhost:8000${path}`, {
        ...options,
        headers,
        credentials: "include" // Include cookies for refresh token
    });

    // If unauthorized, try to refresh the token once
    if (res.status === 401 && retry) {  
        try {
            await refreshAccessToken();
            } catch {
            throw new Error("not_logged_in"); 
            }
            return apiFetch(path, options, false);
        }
    
    return res;
}
