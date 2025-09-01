// src/components/MeineAnfragenSeite.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import {apiGet} from '../lib/apiClient';
import { FcOk } from "react-icons/fc";
import { VscStarEmpty } from "react-icons/vsc";

export default function MeineAkzeptierteAnfragen(){
    // State for list, loading & error (German names, English comments)
    const { token, benutzer } = useAuth();
    const [anfragen, setAnfragen] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState('');

    // Such-State
    const [suche, setSuche] = useState('');
    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        fotoUrl: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });
    const navigate = useNavigate();

    async function ladeDaten(){
        // Build query string with the current user's ID + posts_test table
        setFehler('');
        setLaden(true);
        try{
            // Try common user-id shapes from your auth context
            const benutzerId = benutzer?.id ?? benutzer?.user_id ?? benutzer?.userId;
            if(!benutzerId){
                throw new Error('Kein Benutzer-ID im Kontext');
            }

            const parameter = new URLSearchParams({
                userId: String(benutzerId)
            });

            const daten = await apiGet(`/akzeptierte-anfragen?${parameter.toString()}`, token);
            setAnfragen(Array.isArray(daten) ? daten : []);
        }catch(err){
            setFehler(err.message || 'Fehler beim Laden');
        }finally{
            setLaden(false);
        }
    }

    useEffect(() => {
            if(benutzer){
                ladeDaten();
            }
        }, [benutzer]
    );

    useEffect(()=>{
        let alive = true;
        setLaden(true);
        apiGet("/api/benutzer/me", token)
            .then((data)=>{ if(!alive) return; setForm({
                name: data.name || "",
                emailAdresse: data.emailAdresse || "",
                fotoUrl: data.fotoUrl || "",
                faehigkeiten: data.faehigkeiten || "",
                karma: data.karma || 0,
                erstelltAm: data.erstelltAm || "",
            }); })
            .catch((e)=>{ if(!alive) return; setFehler(e.message || "Fehler beim Laden"); })
            .finally(()=>{ if(!alive) return; setLaden(false); });
        return ()=>{ alive=false; };
    },[token]);



    if(!benutzer){
        // Redirect prompt for unauthenticated users
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
                    Bitte <a href="/login" className="text-indigo-700 underline">einloggen</a>, um deine Anfragen zu sehen.
                </div>
            </div>
        );
    }

    // Filterung
    const gefiltert = anfragen.filter((a) => {
        if (!suche.trim()) return true;
        const q = suche.toLowerCase();
        const titel = (a.titel ?? a.title ?? '').toLowerCase();
        const beschr = (a.beschreibung ?? a.description ?? '').toLowerCase();
        const kat = (a.kategorie ?? a.category ?? '').toLowerCase();
        const status = (a.status ?? '').toLowerCase();
        const addr = [a.strasse ?? a.street ?? '', a.plz ?? a.postal_code ?? '', a.stadt ?? a.city ?? '']
            .filter(Boolean).join(' ').toLowerCase();
        return [titel, beschr, kat, status, addr].some(s => s.includes(q));
    });

    return (
        <div className="mt-4 mx-auto max-w-3xl px-4 py-8 rounded-2xl bg-gradient-to-br from-sky-100 via-blue-180 to-sky-100 shadow-sm ring-1 ring-sky-100/60">
            <div className="mb-4 text-xl font-bold flex justify-between items-center">
                <div className="mb-4 flex items-center gap-3">
                    <span>
                    <button
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate("/meine-anfragen");
                            }
                        }}

                        className="rounded-xl border border-gray-400 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50"
                    >
                        ← Zurück
                    </button>
                    </span>
                    <span>Meine Akzeptierte Anfragen</span>

                </div>
                <div className="text-yellow-600 flex items-center mr-10">
                    <span className="mr-3 text-2xl">Karma:</span>
                    {(form.karma > 5)  &&
                        <>
                            <span className="text-2xl">{form.karma}</span> <VscStarEmpty className="text-4xl ml-2  text-yellow-500" />
                        </>
                    }
                    {(form.karma > 0 && form.karma < 6)  &&
                        Array.from({ length: form.karma }, (_, i) => (
                            <VscStarEmpty key={i} className="text-1xl ml-2  text-yellow-500" />
                        ))
                    }
                    {(form.karma < 0)  &&
                        <span className="text-2xl">{form.karma}</span>
                    }
                </div>

            </div>
            <div className="mb-4 flex items-center gap-3">
                <button onClick={ladeDaten} disabled={laden}
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {laden ? 'Aktualisiere…' : 'Aktualisieren'}
                </button>

                {/* NEU: Suchfeld neben „Aktualisieren“ */}
                <input
                    type="search"
                    placeholder="Suchen (Titel, Beschreibung, Kategorie)…"
                    value={suche}
                    onChange={(e) => setSuche(e.target.value)}
                    className="flex-1 rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                />

                {fehler && <span className="text-sm text-red-700">{fehler}</span>}
            </div>

            {laden && (
                <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">Lade…</div>
            )}

            {!laden && gefiltert.length === 0 && !fehler && (
                <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
                    Keine Anfragen gefunden{suche.trim() ? ' – Suchbegriff anpassen?' : '.'}
                </div>
            )}

            <ul className="space-y-4">
                {!laden && gefiltert.map((a) => {
                    // Defensive fields in case backend returns different property names

                    // const id = a.id ?? a.post_id;
                    // Normalize id field across shapes returned by backend
                    const id = a.id ?? a.post_id ?? a.postId ?? null;
                    // console.log("sch: " + a.id);

                    const titel = a.titel ?? a.title ?? 'Ohne Titel';
                    const beschreibung = a.beschreibung ?? a.description;
                    const kategorie = a.kategorie ?? a.category;
                    const status = a.status ?? 'open';
                    const istFertig = status === "fertig";
                    const stadt = a.stadt ?? a.city;
                    const strasse = a.strasse ?? a.street;
                    const plz = a.plz ?? a.postal_code;



                    return (
                        <li key={id} className="rounded-2xl border bg-white p-4">
                            {/*{console.log("schl:  " + schlussel)}*/}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    {/* Titel klickbar und er öffnet die DetailSeite */}
                                    <button
                                        onClick={() => navigate(`/anfrage/${id}`)}
                                        className="text-left text-base font-semibold text-indigo-700 underline underline-offset-2 hover:text-indigo-900"
                                        title="Details öffnen"
                                    >
                                        {titel}
                                    </button>

                                    <p className="mt-1 text-sm text-gray-700">{beschreibung}</p>
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                                        {kategorie && <span className="rounded-full border px-2 py-0.5">{kategorie}</span>}
                                        {status && <span className="rounded-full border px-2 py-0.5">Status: {status}</span>}
                                        {(stadt || strasse || plz) && (
                                            <span className="rounded-full border px-2 py-0.5">{[strasse, plz, stadt].filter(Boolean).join(' • ')}</span>
                                        )}
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">

                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
