import { useEffect, useState } from "react";
// CHANGED: use same auth + api client as in Anfrage* pages
import { useAuth } from "../context/AuthKontext";            // from your app
import { apiGet, apiPost } from "../lib/apiClient";          // from your app

// OLD: export default function CommentSection({ postId, userId, onBack, embedded = false, className = "" }) {
export default function CommentSection({ postId, onBack, embedded = false, className = "" }) { // CHANGED: we read user from context
                                                                                               // OLD: const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8080";
                                                                                               // CHANGED: apiClient handles base URL, tokens, cookies, CSRF (like Anfrage*).
    const { token, benutzer } = useAuth(); // CHANGED: this is how your other pages get userId/token

    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                setLoading(true);
                setError("");

                // OLD:
                // const res = await fetch(`${API_BASE}/comments/post/${postId}`, { headers:{Accept:"application/json"} , credentials:"include"});
                // if (!res.ok) throw new Error("Fehler beim Laden der Kommentare");
                // const raw = await res.json();

                // CHANGED: same style as AnfrageBearbeiten -> apiGet(path, token)
                const raw = await apiGet(`/comments/post/${postId}`, token);

                const normalized = (Array.isArray(raw) ? raw : []).map((d) => ({
                    id: d.id,
                    text: d.text,
                    createdAt: d.createdAt,
                    author: { id: d.userId, name: d.userName },
                }));
                if (alive) setComments(normalized);
            } catch (e) {
                if (alive) setError(e.message || "Unbekannter Fehler");
            } finally {
                if (alive) setLoading(false);
            }
        })();
        return () => { alive = false; };
    }, [postId, token]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim() || submitting) return;

        setSubmitting(true);
        setError("");

        // CHANGED: allow userId === 0; only block when we truly have no numeric id
        const userIdIsValidNumber = typeof benutzer?.id === "number" && Number.isFinite(benutzer.id);
        if (!userIdIsValidNumber) {
            setError("Du musst angemeldet sein, um zu kommentieren.");
            return setSubmitting(false);
        }

        const tempId = `tmp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            text: text.trim(),
            createdAt: new Date().toISOString(),
            author: { id: benutzer.id, name: benutzer.name ?? "Du" },
        };
        setComments((prev) => [optimistic, ...prev]);

        try {
            const payload = { userId: benutzer.id, postId: Number(postId), text: optimistic.text };

            // OLD:
            // const res = await fetch(`${API_BASE}/comments`, { method:"POST", headers:{...}, credentials:"include", body: JSON.stringify(payload) });
            // const savedRaw = await res.json();

            // CHANGED: same pattern as AnfrageErstellen -> apiPost(path, body, token)
            const savedRaw = await apiPost(`/comments`, payload, token); // uses token/cookies/CSRF like other screens :contentReference[oaicite:2]{index=2}

            const saved = {
                id: savedRaw.id,
                text: savedRaw.text,
                createdAt: savedRaw.createdAt,
                author: { id: savedRaw.userId, name: savedRaw.userName },
            };
            setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
            setText("");
            setTimeout(() => window.location.reload(), 100);

        } catch (e) {
            setError(e.message || "Kommentar konnte nicht gespeichert werden");
            setComments((prev) => prev.filter((c) => c.id !== tempId)); // rollback
        } finally {
            setSubmitting(false);
        }
    }

    // NEW: always render newest first
    const sortedComments = [...comments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));


    const header = embedded ? null : (
        <div className="mb-4 flex  items-center justify-between">
            <h2 className="text-xl text-red-400 font-semibold">Kommentare</h2>
            {onBack && (
                <button onClick={onBack} className="px-3 py-1.5 rounded-lg border hover:bg-gray-50 transition">
                    Zurück
                </button>
            )}
        </div>
    );

    const form = (
        <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
            <input
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Schreibe einen Kommentar…"
                className="flex-1 overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
            />
            <button
                type="submit"
                // OLD: disabled={submitting || !text.trim()}
                disabled={submitting || !text.trim() || !(typeof benutzer?.id === "number" && Number.isFinite(benutzer.id))} // CHANGED: only enable when we truly have a numeric id (0 allowed)
                className="rounded-lg bg-black text-white px-4 py-2 disabled:opacity-50"
            >
                {submitting ? "Senden…" : "Senden"}
            </button>
        </form>
    );

    const content = (

        <>
            {header}
            {!benutzer && (
                <div className="mb-3 rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800">
                    Bitte einloggen, um zu kommentieren. {/* CHANGED: mirrors Anfrage* gating */} :contentReference[oaicite:3]  {index=3}
                </div>
            )}
            {error && (
                <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
            {form}
            {loading ? (
                <div>Lade…</div>
            ) : (
                <ul className="space-y-3">
                    {sortedComments.map((c) => (

                        /* Comment component inside the comment section */
                        <li key={c.id} className="relative overflow-hidden rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60">
                        <div className="text-sm text-gray-600 flex items-center ">
                                <span className="font-medium">{c.author?.name ?? "Unbekannt"}</span> ·{" "}

                                <span className={"ml-auto"}>{formatDateTime(c.createdAt)}</span>

                                {String(c.id).startsWith("tmp-") && <span className="ml-2">⏳</span>}
                            </div>
                            <p className="mt-1 font-light whitespace-pre-wrap">{c.text}</p>

                        </li>
                    ))}
                    {!comments.length && <li className="text-gray-500">Keine Kommentare.</li>}
                </ul>
            )}
        </>
    );

    return embedded ? content : <div className={`max-w-4xl mx-auto p-4 ${className}`}>{content}</div>;
}

function formatDateTime(iso) {
    try { return new Date(iso).toLocaleString(
        'de-DE', { day: '2-digit', month: '2-digit', year: '2-digit', hour: '2-digit', minute: '2-digit' });
    } catch { return String(iso ?? "");}

}
