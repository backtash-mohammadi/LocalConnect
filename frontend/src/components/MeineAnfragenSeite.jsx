// src/components/MeineAnfragenSeite.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import {apiDelete, apiGet, apiPut} from '../lib/apiClient';
import { FcOk } from "react-icons/fc";

export default function MeineAnfragenSeite(){
    // State for list, loading & error (German names, English comments)
    const { token, benutzer } = useAuth();
    const [anfragen, setAnfragen] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState('');

    // NEU: Such-State
    const [suche, setSuche] = useState('');

    const [karmaDialogId, setKarmaDialogId] = useState(null); // which row has the mini-menu open
    const [karmaPunkteInput, setKarmaPunkteInput] = useState(''); // input value

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
                userID: String(benutzerId)
            });

            const daten = await apiGet(`/meine-anfragen?${parameter.toString()}`, token);
            if(Array.isArray(daten)){
                daten.sort((a, b) => {
                    if (a.status === "fertig" && b.status !== "fertig") return 1;
                    if (b.status === "fertig" && a.status !== "fertig") return -1;
                    return 0;
                });
            }

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

    // Navigate to edit page for a specific request
    function bearbeitenAnfrage(id){
        // Navigate to an edit route (frontend); backend wiring can follow later
        navigate(`/anfrage/${id}/bearbeiten`);
    }

    // Delete a request then refresh the list
    async function loeschenAnfrage(id){
        // Confirm client-side, then call DELETE on backend and reload list
        const bestaetigt = window.confirm('Diese Anfrage wirklich löschen?');
        if(!bestaetigt) return;
        try{
            await apiDelete(`/meine-anfragen?id=${id}`, token);
            await ladeDaten();
        }catch(err){
            setFehler(err.message || 'Fehler beim Löschen');
        }
    }

    // mark request as completed in the backend, then go back to list
    async function markiereAlsFertig(id, karmaPunkte){

        try{
            await apiPut(`/anfrage/${id}/fertig/${karmaPunkte}`, {}, token);
            await ladeDaten();
            // navigate('/meine-anfragen');
        }catch(err){
            setFehler(err.message || 'Fehler beim Aktualisieren');
        }
    }

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

    // Clientseitige Filterung
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
        <div className="mt-4 mx-auto max-w-3xl px-4 py-8 rounded-2xl bg-gradient-to-br from-sky-30 via-blue-200 to-sky-100 shadow-sm ring-1 ring-sky-100/60">
            <h1 className="mb-4 text-xl font-bold">Meine Anfragen</h1>

            <div className="mb-4 flex items-center gap-3">
                <button onClick={ladeDaten} disabled={laden}
                        className="rounded-xl cursor-pointer bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                    {laden ? 'Aktualisiere…' : 'Aktualisieren'}
                </button>

                {/* Suchfeld neben „Aktualisieren“ */}
                <input
                    type="search"
                    placeholder="Suchen (Titel, Text, Kategorie, Adresse)…"
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
                                    {/* ⚠ Titel klickbar -> öffnet Detailseite */}
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
                                    <div className="relative">
                                        <button
                                            type="button"
                                            onClick={() => !istFertig && setKarmaDialogId(id)}
                                            disabled={istFertig}
                                            aria-disabled={istFertig}
                                            className={`rounded-xl font-medium cursor-pointer text-white ${
                                                istFertig
                                                    ? 'bg-green-300 text-xl cursor-not-allowed opacity-60'
                                                    : 'bg-green-500 hover:bg-green-700 px-3 py-1.5 text-xs'
                                            }`}
                                        >
                                            {istFertig ? <FcOk /> : 'Karma-Punkte & Fertig'}
                                        </button>

                                        {/* Mini menu / popover */}
                                        {karmaDialogId === id && !istFertig && (
                                            <div className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-3 shadow-lg z-10">
                                                <label htmlFor={`karma-${id}`} className="block text-lg text-center text-gray-800 mb-1">
                                                    Karma-Punkte
                                                </label>
                                                <input
                                                    id={`karma-${id}`}
                                                    type="number"
                                                    inputMode="numeric"
                                                    min="0"
                                                    step="1"
                                                    className="w-full rounded-md border px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                                                    value={karmaPunkteInput}
                                                    onChange={(e) => setKarmaPunkteInput(e.target.value.replace(/[^\d]/g, ''))}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter' && /^\d+$/.test(karmaPunkteInput)) {
                                                            markiereAlsFertig(id, parseInt(karmaPunkteInput, 10));
                                                            setKarmaDialogId(null);
                                                            setKarmaPunkteInput('');
                                                        }
                                                    }}
                                                />

                                                <div className="mt-2 flex justify-end gap-2">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setKarmaDialogId(null);
                                                            setKarmaPunkteInput('');
                                                        }}
                                                        className="rounded-xl border px-2 py-1 text-sm text-white cursor-pointer bg-red-500 hover:bg-red-600 disabled:opacity-60"
                                                    >
                                                        Abbrechen
                                                    </button>

                                                    <button
                                                        type="button"
                                                        disabled={!/^\d+$/.test(karmaPunkteInput)}
                                                        onClick={() => {
                                                            markiereAlsFertig(id, parseInt(karmaPunkteInput, 10));
                                                            setKarmaDialogId(null);
                                                            setKarmaPunkteInput('');
                                                        }}
                                                        className="rounded-xl bg-green-500 px-3 py-1.5 text-xs text-white hover:bg-green-700 cursor-pointer"
                                                    >
                                                        Speichern
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/*<button onClick={() => bearbeitenAnfrage(id)}*/}
                                    {/*        className="rounded-xl bg-amber-500 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-600">*/}
                                    {/*    Bearbeiten*/}
                                    {/*</button>*/}
                                    <button
                                        // Only trigger when not fertig
                                        onClick={() => !istFertig && bearbeitenAnfrage(id)}
                                        // Visually/semantically disable when fertig
                                        disabled={istFertig}
                                        aria-disabled={istFertig}
                                        className={`rounded-xl cursor-pointer px-3 py-1.5 text-xs font-medium text-white ${
                                            istFertig
                                                ? 'bg-amber-300 cursor-not-allowed opacity-60' // disabled look
                                                : 'bg-amber-500 hover:bg-amber-600'
                                        }`}
                                    >
                                        Bearbeiten
                                    </button>
                                    <button onClick={() => loeschenAnfrage(id)}
                                            className="rounded-xl cursor-pointer bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                                        Löschen
                                    </button>
                                </div>
                            </div>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
}
