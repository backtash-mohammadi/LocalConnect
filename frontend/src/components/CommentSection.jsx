import { useEffect, useState } from "react";

/**
 * CommentSection – einfache Kommentar-Komponente für einen Post/Anfrage
 *
 * Erwartete Props:
 *  - postId: string | number – ID der Anfrage
 *  - onBack?: () => void – optionaler Zurück-Handler (z.B. zur Liste)
 *
 * Backend-Endpoints (anpassbar):
 *  GET    /api/posts/:postId/comments           -> Liste der Kommentare
 *  POST   /api/posts/:postId/comments           -> neuen Kommentar anlegen { text }
 */
export default function CommentSection({ postId, onBack }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [text, setText] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        let isMounted = true;
        async function load() {
            setLoading(true);
            setError("");
            try {
                const res = await fetch(`/api/posts/${postId}/comments`, {
                    headers: { "Accept": "application/json" },
                    credentials: "include",
                });
                if (!res.ok) throw new Error("Fehler beim Laden der Kommentare");
                const data = await res.json();
                if (isMounted) setComments(Array.isArray(data) ? data : []);
            } catch (e) {
                if (isMounted) setError(e.message || "Unerwarteter Fehler");
            } finally {
                if (isMounted) setLoading(false);
            }
        }
        load();
        return () => {
            isMounted = false;
        };
    }, [postId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        setError("");

        // Optimistisches Update (fühlt sich schneller an)
        const tempId = `tmp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            text: text.trim(),
            createdAt: new Date().toISOString(),
            author: { id: "me", name: "Ich" }, // ggf. vom Backend ersetzen lassen
        };
        setComments((prev) => [optimistic, ...prev]);
        setText("");

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Accept": "application/json" },
                credentials: "include",
                body: JSON.stringify({ text: optimistic.text }),
            });
            if (!res.ok) throw new Error("Kommentar konnte nicht gespeichert werden");
            const saved = await res.json();
            // Temp durch echten Kommentar ersetzen
            setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
        } catch (e) {
            setError(e.message || "Unerwarteter Fehler");
            // Optimistisches wieder zurückrollen
            setComments((prev) => prev.filter((c) => c.id !== tempId));
            setText(optimistic.text);
        } finally {
            setSubmitting(false);
        }
    }

    return (
        <div className="max-w-2xl mx-auto p-4">
            <div className="flex items-center gap-2 mb-4">
                {onBack && (
                    <button
                        onClick={onBack}
                        className="px-3 py-1.5 rounded-lg border hover:bg-gray-50"
                    >
                        ← Zurück
                    </button>
                )}
                <h2 className="text-xl font-semibold">Kommentare</h2>
            </div>

            {loading ? (
                <p>Kommentarliste wird geladen…</p>
            ) : (
                <>
                    {error && (
                        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium mb-1">
                            Neuen Kommentar schreiben
                        </label>
                        <textarea
                            id="comment"
                            className="w-full rounded-lg border p-3 focus:outline-none focus:ring"
                            rows={3}
                            placeholder="Schreibe etwas…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="mt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || !text.trim()}
                                className="px-4 py-2 rounded-lg bg-blue-600 text-white disabled:opacity-50"
                            >
                                {submitting ? "Senden…" : "Senden"}
                            </button>
                            <span className="text-sm text-gray-500">{comments.length} Kommentare</span>
                        </div>
                    </form>

                    <ul className="space-y-3">
                        {comments.length === 0 && (
                            <li className="text-sm text-gray-600">Noch keine Kommentare vorhanden.</li>
                        )}
                        {comments.map((c) => (
                            <li key={c.id} className="rounded-lg border p-3">
                                <div className="mb-1 text-sm text-gray-500">
                                    <span className="font-medium">{c.author?.name || "Unbekannt"}</span>{" "}
                                    · {formatDateTime(c.createdAt)}
                                </div>
                                <p className="whitespace-pre-wrap">{c.text}</p>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
}

function formatDateTime(iso) {
    try {
        const d = new Date(iso);
        return d.toLocaleString();
    } catch {
        return "" + iso;
    }
}

/**
 * Beispiel: wie man die Seite für eine einzelne Anfrage über React Router anzeigen kann.
 *
 * In eurem Router z.B. eine Route wie /anfrage/:id anlegen und von
 * /meine-anfragen aus per Link dorthin navigieren.
 *
 * // Router-Snippet (einfach, optional):
 * import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
 * import CommentSection from "./CommentSection";
 *
 * function AnfragePage() {
 *   const { id } = useParams();
 *   const navigate = useNavigate();
 *   return <CommentSection postId={id} onBack={() => navigate(-1)} />;
 * }
 *
 * // In eurem App-Router:
 * <BrowserRouter>
 *   <Routes>
 *     <Route path="/meine-anfragen" element={<MeineAnfragen />} />
 *     <Route path="/anfrage/:id" element={<AnfragePage />} />
 *   </Routes>
 * </BrowserRouter>
 */
