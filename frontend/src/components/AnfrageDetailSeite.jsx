// src/components/AnfrageDetailSeite.jsx
// THE STYLING FOR COMMENT SECTION HAPPENS HERE

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { apiGet } from "../lib/apiClient";
import CommentSection from "./CommentSection";

export default function AnfrageDetailSeite() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();

    const [post, setPost] = useState(null);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [postStatus, setPostStatus] = useState("");

    useEffect(() => {
        let on = true;
        async function load() {
            setFehler("");
            setLaden(true);
            try {
                const data = await apiGet(`/anfrage/${id}`, token); // ggf. Endpoint anpassen
                if (on) {
                    setPost(data || null);
                }
            } catch (e) {
                if (on) setFehler(e.message || "Fehler beim Laden");
            } finally {
                if (on) setLaden(false);
            }
        }
        load();
        return () => { on = false; };
    }, [id, token]);

    useEffect(() => {

        post && setPostStatus(post.status);
    }, [post]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            {/* EIN Zurück-Button */}
            <div className="mb-4 flex items-center gap-3">
                <button
                    // onClick={() => navigate(-1)}  //

                    // 29.08 - diese Version ist für die Tabs, die von der KarteSeite geöffnet werden.
                    onClick={() => {
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate("/meine-anfragen");
                        }
                    }}

                    className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                >
                    ← Zurück
                </button>
                <h1 className="text-3xl font-thin">Anfrage</h1>
            </div>

            {laden && <div className="rounded-2xl border bg-white p-4 text-sm">Lade…</div>}
            {fehler && (
                <div className="rounded-2xl border bg-white p-4 text-sm text-red-700">
                    {fehler}
                </div>
            )}

            {/* Karte 1: Post */}
            {post && (
                // Anfrage Details...
                <div className="relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-30 via-blue-200 to-sky-100 p-5 shadow-sm ring-1 ring-sky-100/60">
                    <h2 className="text-lg font-semibold">
                        {post.titel ?? post.title ?? "Ohne Titel"}
                    </h2>
                    <p className="mt-2 text-sm text-gray-700">
                        {post.beschreibung ?? post.description ?? ""}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2 text-xs text-gray-600">
                        {(post.kategorie ?? post.category) && (
                            <span className="rounded-full border px-2 py-0.5">
                {post.kategorie ?? post.category}
              </span>
                        )}
                        {post.status && (
                            <span className="rounded-full border px-2 py-0.5">Status: {post.status}</span>
                        )}
                        {([post.strasse ?? post.street, post.plz ?? post.postal_code, post.stadt ?? post.city]
                            .filter(Boolean).length > 0) && (
                            <span className="rounded-full border px-2 py-0.5">
                {[post.strasse ?? post.street, post.plz ?? post.postal_code, post.stadt ?? post.city]
                    .filter(Boolean).join(" • ")}
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Karte 2: Kommentare – gleiche Breite/Optik */}
            <div className="mt-6 relative overflow-hidden rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-30 via-blue-200 to-sky-100 p-5 shadow-sm ring-1 ring-sky-100/60">
                <div className="mb-3">
                    <h2 className="text-2xl font-thin text-gray-900 ">Kommentare</h2>
                </div>
                {/* embedded=true => CommentSection rendert ohne eigenen Außen-Wrapper */}
                <CommentSection postId={id} embedded status={postStatus}/>
            </div>
        </div>
    );
}
