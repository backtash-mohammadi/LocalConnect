import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import {apiGet, apiPost, apiPut} from "../lib/apiClient";
import chooseButton from "../assets/chooseButton.svg";

export default function CommentSection({ postId, embedded = false, className = "", status }) {
    const { token, benutzer } = useAuth();
    const [comments, setComments] = useState([]);
    const [erstellerId, setErstellerId] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [text, setText] = useState("");
    const [anfrageStatus, setAnfrageStatus] = useState("");

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
        if (postId) ladeKommentare();

        if (postId && token) ladeAnfrage();
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

    // **********  Bereich für Bearbeitung-Status und helferId Einsetzung  *********************

    // set the status only when the status received by paren is not empty.
    useEffect(() => {
        status && setAnfrageStatus(status);
    }, [status]);

    // set post status to "bearbeitung", so the buttons get deactivated.
    // call the api function.
    function onAlsBearbeitungMarkiert(comment, e) {
        e.preventDefault();
        setAnfrageStatus("bearbeitung");
        const helferId = comment.user.id;
        // console.log("test - function "  + postId + " " + helferId);
        markiereAlsBearbeitung( postId, helferId);
    }

    // Call the backend api to set Anfragestatus to "bearbeitung" and set the helferId to the user who wrote the comment.
    async function markiereAlsBearbeitung(anfrageId, helferId){
        try {
            await apiPut(`/anfrage/bearbeitung/${anfrageId}/${helferId}`);
            // console.log("helfer id nach api call " + res);
        } catch (err) {
            console.log(err);
        }
    }
    // ****************************************************************************

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
                            <div className="mt-2 flex w-full items-center gap-2">
                                <button
                                    onClick={() => startePrivatchat(c.id)}
                                    aria-label="Privatchat"
                                    title="Privatchat"
                                    className="rounded-xl bg-blue-700 px-3 py-1 text-white disabled:opacity-50"
                                >
                                    Privatchat

                                {/* Button aktiviert nur mit "open" status und nur für andere Benutzern (nicht für Ersteller)) */}
                                </button>
                                {(anfrageStatus === "open" && erstellerId !== c.user.id) ?
                                <button
                                    onClick={(e) => onAlsBearbeitungMarkiert(c, e)}
                                    className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl  hover:bg-blue-800 disabled:opacity-50">
                                    <img src={chooseButton} alt="" aria-hidden className="h-11 w-11" /><span></span>
                                </button>
                                 :
                                <button
                                    disabled
                                    className="ml-auto inline-flex h-10 w-10 items-center justify-center rounded-xl  hover:bg-blue-800 disabled:opacity-50">
                                    <img src={chooseButton} alt="" aria-hidden className="h-11 w-11" /><span></span>
                                </button>
                            }
                            </div>
                        )}
                    </li>
                ))}
                {comments.length === 0 && !loading && <li className="text-sm text-gray-500">Keine Kommentare.</li>}
                {loading && <li className="text-sm text-gray-500">Laden…</li>}
            </ul>

            {(benutzer && token) ? (
                <form onSubmit={sendeKommentar} className={"mt-4 flex items-center gap-2" + (embedded ? " hidden" : "")}>
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
            </form>) : (
                <div className={"mt-4 text-sm text-gray-600" + (embedded ? " hidden" : "")}>
                    Bitte <a href="/login" className="underline">einloggen</a>, um einen Kommentar zu schreiben.
                </div>
            )}
        </div>
    );
}
