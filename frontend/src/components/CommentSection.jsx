import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPost } from "../lib/apiClient";

export default function CommentSection({ postId, embedded = false, className = "" }) {
    const { token, benutzer } = useAuth();
    const [comments, setComments] = useState([]);
    const [erstellerId, setErstellerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [text, setText] = useState("");

    async function ladeKommentare() {
        try {
            setLoading(true);
            setError("");
            const raw = await apiGet(`/comments/post/${postId}`, token);
            const normalized = (Array.isArray(raw) ? raw : []).map((d) => ({
                id: d.id,
                text: d.text,
                createdAt: d.createdAt || d.created_at || d.erstelltAm || d.datum || null,
                user: d.user ? { id: d.user.id, name: d.user.name } : { id: d.userId ?? d.benutzerId ?? null, name: d.userName ?? d.benutzerName ?? "Nutzer" }
            }));
            setComments(normalized);
        } catch (e) {
            setError(e?.message || "Fehler beim Laden der Kommentare");
        } finally {
            setLoading(false);
        }
    }

    // Hole Ersteller der Anfrage (nur um Sichtbarkeit der Chat-Schaltfläche zu bestimmen)
    useEffect(() => {
        let aktiv = true;
        async function ladeAnfrage() {
            try {
                const a = await apiGet(`/anfrage/${postId}`, token);
                const id = a?.userId ?? a?.erstellerId ?? null;
                if (aktiv && id != null) setErstellerId(Number(id));
            } catch { /* ignorieren */ }
        }
        if (postId && token) ladeAnfrage();
        // Kommentare gleich тоже laden
        if (postId && token) ladeKommentare();
        return () => { aktiv = false; };
    }, [postId, token]);

    async function sendeKommentar(e) {
        e?.preventDefault?.();
        const t = text.trim();
        if (!t) return;
        const optimistic = {
            id: `tmp_${Date.now()}`,
            text: t,
            createdAt: new Date().toISOString(),
            user: { id: benutzer?.id, name: benutzer?.name || "Ich" }
        };
        setComments((alt) => [...alt, optimistic]);
        setText("");

        try {
            const payload = { userId: benutzer.id, postId: Number(postId), text: optimistic.text };
            const savedRaw = await apiPost(`/comments`, payload, token);
            const saved = {
                id: savedRaw.id,
                text: savedRaw.text,
                createdAt: savedRaw.createdAt || savedRaw.erstelltAm || optimistic.createdAt,
                user: optimistic.user
            };
            setComments((alt) => alt.map((c) => (c.id === optimistic.id ? saved : c)));
        } catch (e) {
            setComments((alt) => alt.filter((c) => c.id !== optimistic.id));
            setError(e?.message || "Fehler beim Senden des Kommentars");
        }
    }

    async function startePrivatchat(kommentarId) {
        try {
            const res = await apiPost(`/privatchats/von-kommentar/${kommentarId}`, {}, token);
            const kId = res?.konversationId;
            if (kId != null) {
                window.location.href = `/chat/${kId}`;
            }
        } catch (e) {
            alert(e?.message || "Privatchat konnte nicht gestartet werden");
        }
    }

    function formatDateTime(iso) {
        try {
            return new Date(iso).toLocaleString("de-DE", { day: "2-digit", month: "2-digit", year: "2-digit", hour: "2-digit", minute: "2-digit" });
        } catch {
            return String(iso ?? "");
        }
    }

    return (
        <div className={"" + (className || "")}>
            {error && <div className="mb-2 rounded-lg border border-red-200 bg-red-50 p-2 text-red-700 text-sm">{error}</div>}

            <ul className="space-y-3">
                {comments.map((c) => (
                    <li key={c.id} className="rounded-xl border bg-white p-3 shadow-sm">
                        <div className="flex items-center justify-between text-sm text-gray-600">
                            <div className="font-medium">{c.user?.name || "Nutzer"}</div>
                            <div>{formatDateTime(c.createdAt)}</div>
                        </div>
                        <div className="mt-2 whitespace-pre-wrap break-words">{c.text}</div>

                        {(erstellerId != null && benutzer?.id === erstellerId) && (
                            <div className="mt-2">
                                <button
                                    onClick={() => startePrivatchat(c.id)}
                                    className="rounded-lg border px-2 py-1 text-xs hover:bg-gray-50">
                                    Privatchat
                                </button>
                            </div>
                        )}
                    </li>
                ))}
                {comments.length === 0 && !loading && <li className="text-sm text-gray-500">Keine Kommentare.</li>}
                {loading && <li className="text-sm text-gray-500">Laden…</li>}
            </ul>

            <form onSubmit={sendeKommentar} className="mt-3 flex gap-2">
                <input
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Einen Kommentar schreiben…"
                    className="flex-1 rounded-xl border px-3 py-2 outline-none"
                />
                <button
                    type="submit"
                    disabled={!text.trim()}
                    className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50">
                    Senden
                </button>
            </form>
        </div>
    );
}
