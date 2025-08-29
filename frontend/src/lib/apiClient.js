const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

async function parseAntwort(res) {
    const text = await res.text();
    let data = null;
    try { data = text ? JSON.parse(text) : null; } catch {}
    return { status: res.status, ok: res.ok, data, text };
}

function buildError(ans) {
    // 🇩🇪 Bevorzugte Reihenfolge der Fehlermeldung:
    // 1) message (engl.), 2) nachricht (dt.), 3) error/fehler, 4) Rohtext/HTTP-Status
    const d = ans && ans.data ? ans.data : null;
    const kandidat =
        (d && typeof d.message === "string" && d.message.trim()) ||
        (d && typeof d.nachricht === "string" && d.nachricht.trim()) ||
        (d && typeof d.error === "string" && d.error.trim()) ||
        (d && typeof d.fehler === "string" && d.fehler.trim()) ||
        (ans && typeof ans.text === "string" && ans.text.trim()) ||
        `HTTP ${ans && typeof ans.status === "number" ? ans.status : 0}`;

    const err = new Error(kandidat);
    err.status = ans?.status;
    err.body = d ?? ans?.text;
    return err;
}

export async function apiGet(pfad, token) {
    const res = await fetch(BASIS_URL + pfad, {
        method: "GET",
        headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        credentials: "include"
    });
    const ans = await parseAntwort(res);
    if (!ans.ok) throw buildError(ans);
    return ans.data;
}

export async function apiPost(pfad, body, token) {
    const res = await fetch(BASIS_URL + pfad, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: body ? JSON.stringify(body) : null,
        credentials: "include"
    });
    const ans = await parseAntwort(res);
    if (ans.status === 204) return null;
    if (ans.status === 202) return ans.data || {};
    if (!ans.ok) throw buildError(ans);
    return ans.data;
}

export async function apiPut(pfad, body, token) {
    const res = await fetch(BASIS_URL + pfad, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: body ? JSON.stringify(body) : null,
        credentials: "include"
    });
    const ans = await parseAntwort(res);
    if (ans.status === 204) return null;
    if (!ans.ok) throw buildError(ans);
    return ans.data;
}

export async function apiDelete(pfad, token) {
    const res = await fetch(BASIS_URL + pfad, {
        method: "DELETE",
        headers: {
            "Accept": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        credentials: "include"
    });
    const ans = await parseAntwort(res);
    if (ans.status === 204) return null;
    if (!ans.ok) throw buildError(ans);
    return ans.data;
}

export async function apiPatch(pfad, body, token) {
    const res = await fetch(BASIS_URL + pfad, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...(token ? { "Authorization": "Bearer " + token } : {})
        },
        body: body ? JSON.stringify(body) : null,
        credentials: "include"
    });
    const ans = await parseAntwort(res);
    if (ans.status === 204) return null;
    if (!ans.ok) throw buildError(ans);
    return ans.data;
}

export function baueQuery(params) {
    const usp = new URLSearchParams();
    if (params && typeof params === "object") {
        Object.entries(params).forEach(([k, v]) => {
            if (v === undefined || v === null || v === "") return;
            if (Array.isArray(v)) {
                v.forEach((item) => {
                    if (item !== undefined && item !== null && item !== "")
                        usp.append(k, String(item));
                });
            } else {
                usp.append(k, String(v));
            }
        });
    }
    const qs = usp.toString();
    return qs ? `?${qs}` : "";
}