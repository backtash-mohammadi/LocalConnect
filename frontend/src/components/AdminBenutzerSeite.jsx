import { useEffect, useMemo, useRef, useState } from "react";
import { apiDelete, apiGet, apiPatch } from "../lib/apiClient";
import { baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";
import BestaetigungModal from "./BestaetigungModal";

/** Admin – Benutzerliste mit Suche, Pagination und Lösch-Bestätigung. */
export default function AdminBenutzerSeite() {
    const { token } = useAuth();
    const [liste, setListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);
    const [suchtext, setSuchtext] = useState("");
    const [eingabe, setEingabe] = useState(""); // kontrollируемое поле ввода
    const [zuLoeschen, setZuLoeschen] = useState(null); // {id, name} für Modal

    // Debounce für Suche (einfach)
    const timerRef = useRef(null);
    useEffect(() => {
        // wenn Eingabe ändert → 400ms warten → setSuchtext
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setSeite(0);           // bei neuer Suche zurück auf Seite 0
            setSuchtext(eingabe);  // trigger lade()
        }, 400);
        return () => clearTimeout(timerRef.current);
    }, [eingabe]);

    async function lade() {
        try {
            setFehler("");
            setLaden(true);
            const qs = baueQuery({ page: seite, size: groesse, q: suchtext });
            const daten = await apiGet(`/api/admin/benutzer${qs}`, token);
            setListe(daten.inhalte || []);
            setGesamtSeiten(daten.gesamtSeiten || 0);
            setGesamtElemente(daten.gesamtElemente || 0);
        } catch (e) {
            setFehler(e.message || "Fehler");
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => { lade(); /* eslint-disable-next-line */ }, [seite, groesse, suchtext]);

    async function wechsleSperre(id, neu) {
        try {
            await apiPatch(`/api/admin/benutzer/${id}/sperren`, { gesperrt: neu }, token);
            setListe(l => l.map(b => b.id === id ? { ...b, gesperrt: neu } : b));
        } catch (e) {
            alert(e.message);
        }
    }

    async function bestaetigtLoeschen() {
        if (!zuLoeschen) return;
        try {
            await apiDelete(`/api/admin/benutzer/${zuLoeschen.id}`, token);
            setZuLoeschen(null);
            // если удалили последний элемент страницы – откатиться на предыдущую страницу
            setListe(l => l.filter(b => b.id !== zuLoeschen.id));
            setGesamtElemente(x => x - 1);
            if (liste.length === 1 && seite > 0) setSeite(s => s - 1);
            else await lade();
        } catch (e) {
            alert(e.message);
        }
    }

    const kannZurueck = seite > 0;
    const kannWeiter  = seite + 1 < gesamtSeiten;
    const seitenAnzeige = useMemo(() => {
        // sehr einfache Paginierung: max 7 Buttons um die aktuelle Seite
        const max = 7;
        const start = Math.max(0, Math.min(seite - 3, gesamtSeiten - max));
        const ende = Math.min(gesamtSeiten, start + max);
        return Array.from({ length: Math.max(ende - start, 0) }, (_, i) => start + i);
    }, [seite, gesamtSeiten]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-semibold">Admin – Benutzerverwaltung</h1>

            {/* Suche & Größe */}
            <div className="mb-4 flex flex-wrap items-center gap-3">
                <input
                    value={eingabe}
                    onChange={(e) => setEingabe(e.target.value)}
                    placeholder="Suche nach Name oder E-Mail…"
                    className="w-72 rounded-xl border px-3 py-2 text-sm"
                />
                {eingabe && (
                    <button
                        onClick={() => setEingabe("")}
                        className="rounded-xl border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Zurücksetzen
                    </button>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-sm text-gray-600">Pro Seite:</span>
                    <select
                        value={groesse}
                        onChange={(e) => { setSeite(0); setGroesse(Number(e.target.value)); }}
                        className="rounded-xl border px-2 py-1 text-sm"
                    >
                        {[5,10,20,50].map(g => <option key={g} value={g}>{g}</option>)}
                    </select>
                </div>
            </div>

            {fehler && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{fehler}</div>}

            {laden ? (
                <div className="text-gray-600">Lade…</div>
            ) : (
                <>
                    <div className="overflow-x-auto rounded-2xl border bg-white">
                        <table className="min-w-full divide-y">
                            <thead className="bg-gray-50">
                            <tr>
                                <th className="px-4 py-2 text-left text-sm font-medium">ID</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Name</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">E-Mail</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Karma</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Status</th>
                                <th className="px-4 py-2 text-left text-sm font-medium">Aktionen</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y">
                            {liste.map(b => (
                                <tr key={b.id} className="hover:bg-gray-50">
                                    <td className="px-4 py-2 text-sm">{b.id}</td>
                                    <td className="px-4 py-2 text-sm">{b.name}</td>
                                    <td className="px-4 py-2 text-sm">{b.emailAdresse}</td>
                                    <td className="px-4 py-2 text-sm">{b.karma}</td>
                                    <td className="px-4 py-2 text-sm">
                                        {b.gesperrt ? (
                                            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">gesperrt</span>
                                        ) : (
                                            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">aktiv</span>
                                        )}
                                    </td>
                                    <td className="px-4 py-2 text-sm">
                                        <div className="flex gap-2">
                                            {b.gesperrt ? (
                                                <button
                                                    onClick={() => wechsleSperre(b.id, false)}
                                                    className="rounded-xl border px-3 py-1.5 hover:bg-gray-50"
                                                    title="Entsperren"
                                                >
                                                    Entsperren
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => wechsleSperre(b.id, true)}
                                                    className="rounded-xl border px-3 py-1.5 hover:bg-gray-50"
                                                    title="Sperren"
                                                >
                                                    Sperren
                                                </button>
                                            )}
                                            <button
                                                onClick={() => setZuLoeschen({ id: b.id, name: b.name })}
                                                className="rounded-xl border px-3 py-1.5 text-red-600 hover:bg-red-50"
                                                title="Löschen"
                                            >
                                                Löschen
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {liste.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                        Keine Benutzer gefunden.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-gray-600">
                            {gesamtElemente} {gesamtElemente === 1 ? "Eintrag" : "Einträge"} • Seite {seite + 1} von {Math.max(gesamtSeiten,1)}
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                disabled={!kannZurueck}
                                onClick={() => setSeite(s => Math.max(0, s - 1))}
                                className={`rounded-xl border px-3 py-1.5 text-sm ${kannZurueck ? "hover:bg-gray-50" : "opacity-50"}`}
                            >
                                ← Zurück
                            </button>

                            {seitenAnzeige.map(nr => (
                                <button
                                    key={nr}
                                    onClick={() => setSeite(nr)}
                                    className={`rounded-xl border px-3 py-1.5 text-sm ${nr === seite ? "bg-gray-900 text-white" : "hover:bg-gray-50"}`}
                                >
                                    {nr + 1}
                                </button>
                            ))}

                            <button
                                disabled={!kannWeiter}
                                onClick={() => setSeite(s => s + 1)}
                                className={`rounded-xl border px-3 py-1.5 text-sm ${kannWeiter ? "hover:bg-gray-50" : "opacity-50"}`}
                            >
                                Weiter →
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Lösch-Bestätigung */}
            <BestaetigungModal
                offen={!!zuLoeschen}
                titel="Benutzer löschen?"
                text={zuLoeschen ? `Möchtest du den Benutzer „${zuLoeschen.name ?? zuLoeschen.id}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.` : ""}
                bestaetigenText="Ja, löschen"
                onBestaetigen={bestaetigtLoeschen}
                onAbbrechen={() => setZuLoeschen(null)}
            />
        </div>
    );
}
