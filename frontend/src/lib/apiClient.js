const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function handleAntwort(resp) {
    let payload = null;
    try { payload = await resp.json(); } catch (_) { /* kann leer sein */ }
    if (!resp.ok) {
        const msg = payload?.nachricht || payload?.message || payload?.fehler || "Unbekannter Fehler";
        const felder = payload?.felder ? Object.entries(payload.felder).map(([k,v]) => `${k}: ${v}`).join("; ") : "";
        throw new Error([msg, felder].filter(Boolean).join(" – "));
    }
    return payload;
}

export async function apiPost(pfad, daten, token) {
    const resp = await fetch(`${BASIS_URL}${pfad}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(daten),
    });
    return handleAntwort(resp);
}

export async function apiGet(pfad, token) {
    const resp = await fetch(`${BASIS_URL}${pfad}`, {
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return handleAntwort(resp);
}

export async function apiPut(pfad, daten, token) {
    const resp = await fetch(`${BASIS_URL}${pfad}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(daten),
    });
    return handleAntwort(resp);
}

export async function apiDelete(pfad, token) {
    const resp = await fetch(`${BASIS_URL}${pfad}`, {
        method: "DELETE",
        headers: {
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    });
    return handleAntwort(resp);
}

export async function apiPatch(pfad, daten, token) {
    const resp = await fetch(`${BASIS_URL}${pfad}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(daten),
    });
    return handleAntwort(resp);
}
