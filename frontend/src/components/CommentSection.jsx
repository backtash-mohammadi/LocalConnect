import { useEffect, useState } from "react";

/**
 * CommentSection – Kommentar-Komponente für einen Post/Anfrage
 *
 * Props:
 *  - postId: string | number – ID der Anfrage
 *  - onBack?: () => void – optionaler Zurück-Handler (nur wenn nicht embedded)
 *  - embedded?: boolean – wenn true, ohne eigenen Außen-Wrapper/Überschrift (für Detailseite)
 *  - className?: string – zusätzliche Klassen (nur wenn !embedded)
 */
export default function CommentSection({ postId, onBack, embedded = false, className = "" }) {
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
                    headers: { Accept: "application/json" },
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
        return () => { isMounted = false; };
    }, [postId]);

    async function handleSubmit(e) {
        e.preventDefault();
        if (!text.trim()) return;

        setSubmitting(true);
        setError("");

        const tempId = `tmp-${Date.now()}`;
        const optimistic = {
            id: tempId,
            text: text.trim(),
            createdAt: new Date().toISOString(),
            author: { id: "me", name: "Ich" },
        };
        setComments((prev) => [optimistic, ...prev]);
        setText("");

        try {
            const res = await fetch(`/api/posts/${postId}/comments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Accept: "application/json" },
                credentials: "include",
                body: JSON.stringify({ text: optimistic.text }),
            });
            if (!res.ok) throw new Error("Kommentar konnte nicht gespeichert werden");
            const saved = await res.json();
            setComments((prev) => prev.map((c) => (c.id === tempId ? saved : c)));
        } catch (e) {
            setError(e.message || "Unerwarteter Fehler");
            setComments((prev) => prev.filter((c) => c.id !== tempId));
            setText(optimistic.text);
        } finally {
            setSubmitting(false);
        }
    }

    // --- Inhalt der Section (ohne äußeren Wrapper) ---
    const content = (
        <>
            {/* Header nur zeigen, wenn nicht embedded UND es einen Zurück-Button gibt */}
            {!embedded && (
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
            )}

            {loading ? (
                <p className="text-sm text-gray-600">Kommentarliste wird geladen…</p>
            ) : (
                <>
                    {error && (
                        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-800">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="mb-4">
                        {!embedded && (
                            <label htmlFor="comment" className="block text-sm font-medium mb-1">
                                Neuen Kommentar schreiben
                            </label>
                        )}
                        <textarea
                            id="comment"
                            className="w-full rounded-xl border px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            rows={4}
                            placeholder="Schreibe etwas…"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                        />
                        <div className="mt-2 flex items-center gap-3">
                            <button
                                type="submit"
                                disabled={submitting || !text.trim()}
                                className="px-4 py-2 rounded-xl bg-indigo-600 text-white disabled:opacity-50 hover:bg-indigo-700"
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
                            <li key={c.id} className="rounded-xl border p-3 bg-white/60">
                                <div className="mb-1 text-xs text-gray-500">
                                    <span className="font-medium">{c.author?.name || "Unbekannt"}</span>{" "}
                                    · {formatDateTime(c.createdAt)}
                                </div>
                                <p className="whitespace-pre-wrap text-sm">{c.text}</p>
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </>
    );

    // --- Wrapper nur, wenn nicht embedded (keine Inline-Komponente mehr!) ---
    return embedded ? (
        content
    ) : (
        <div className={`max-w-3xl mx-auto p-4 ${className}`}>{content}</div>
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
