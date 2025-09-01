import { useEffect, useState } from "react";
import { apiGet, baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";

/** Titel nur aus Titel-ähnlichen Feldern; niemals aus Beschreibung */
function leseTitel(a) {
    if (!a) return "-";
    const kandidaten = [a.title, a.titel, a.name, a.ueberschrift, a.anzeigeTitel].filter(Boolean);
    if (kandidaten.length > 0) return String(kandidaten[0]);
    return `Beitrag #${a.id}`;
}

/** Farb- und Textstil für Status-Badge */
function statusKlasse(status) {
    const s = String(status || "").toUpperCase();
    if (["ABGESCHLOSSEN", "ERLEDIGT", "DONE"].includes(s)) {
        return "bg-green-100 text-green-700 border-green-200";
    }
    if (["ABGELEHNT", "STORNIERT", "CLOSED"].includes(s)) {
        return "bg-red-100 text-red-700 border-red-200";
    }
    if (["IN_ARBEIT", "IN_PROGRESS", "AKTIV"].includes(s)) {
        return "bg-blue-100 text-blue-700 border-blue-200";
    }
    return "bg-gray-100 text-gray-700 border-gray-200";
}

/** Admin – Liste aller Anzeigen/Anfragen (schön & schlicht) */
export default function AdminAnzeigenSeite() {
    const { token } = useAuth();
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Zustand
    const [liste, setListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    // Paging
    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);

    // Modal
    const [zeigeModal, setZeigeModal] = useState(false);
    const [loeschEintrag, setLoeschEintrag] = useState(null);

    // Toast
    const [toast, setToast] = useState("");

    async function lade() {
        setLaden(true);
        setFehler("");
        try {
            const q = baueQuery({ seite, groesse });
            const res = await apiGet(`/api/admin/anzeigen${q}`, token);
            setListe(res.inhalte || []);
            setGesamtSeiten(res.gesamtSeiten ?? 0);
            setGesamtElemente(res.gesamtElemente ?? 0);
        } catch (e) {
            setFehler(e.message || String(e));
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        lade();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seite, groesse]);

    function bestaetigungOeffnen(eintrag) {
        setLoeschEintrag(eintrag);
        setZeigeModal(true);
    }
    function bestaetigungSchliessen() {
        setZeigeModal(false);
        setLoeschEintrag(null);
    }

    async function loescheAnfrageEndgueltig() {
        if (!loeschEintrag) return;
        try {
            const resp = await fetch(`${BASIS_URL}/api/admin/anzeigen/${loeschEintrag.id}`, {
                method: "DELETE",
                headers: { Authorization: token ? `Bearer ${token}` : "" },
            });
            if (!resp.ok) {
                const payload = await (async () => {
                    try { return await resp.json(); } catch (_) { return null; }
                })();
                const msg = payload?.nachricht || payload?.fehler || resp.statusText;
                throw new Error(msg || "Löschen fehlgeschlagen");
            }
            setListe(prev => prev.filter(a => a.id !== loeschEintrag.id));
            bestaetigungSchliessen();
            setToast("Anzeige gelöscht");
        } catch (e) {
            setFehler(e.message || "Fehler beim Löschen");
            bestaetigungSchliessen();
        }
    }

    // Auto-Toast-Verbergen
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 2500);
        return () => clearTimeout(t);
    }, [toast]);

    // Skeleton-Reihe für Ladezustand
    const SkelettZeile = () => (
        <tr className="border-t animate-pulse">
            {Array.from({ length: 10 }).map((_, i) => (
                <td key={i} className="px-3 py-3">
                    <div className="h-3 w-24 rounded bg-gray-200" />
                </td>
            ))}
        </tr>
    );

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Toast */}
            <div
                className={`fixed right-4 top-4 z-50 transform transition-all ${
                    toast ? "opacity-100 translate-y-0" : "pointer-events-none opacity-0 -translate-y-2"
                }`}
                role="status"
                aria-live="polite"
            >
                <div className="rounded-xl bg-green-600 px-4 py-2 text-white shadow-lg">{toast}</div>
            </div>

            {/* Kopf */}
            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Admin · Anzeigen</h1>
                    <p className="text-sm text-gray-600">Verwalten, prüfen und entfernen.</p>
                </div>


            </div>

            {fehler && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {fehler}
                </div>
            )}

            {/* Karte/Box */}
            <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Tabelle (responsive) */}
                <div className="max-h-[70vh] overflow-auto">
                    <table className="min-w-full text-sm">
                        <thead className="sticky top-0 z-10 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-600">
                        <tr>
                            <th className="px-3 py-3">ID</th>
                            <th className="px-3 py-3">Titel</th>
                            <th className="px-3 py-3">Kategorie</th>
                            {/*<th className="px-3 py-3">Beschreibung</th>*/}
                            <th className="px-3 py-3">Stadt</th>
                            <th className="px-3 py-3">PLZ</th>
                            <th className="px-3 py-3">Status</th>
                            <th className="px-3 py-3">Ersteller</th>
                            <th className="px-3 py-3">Helfer</th>
                            <th className="px-3 py-3">Aktion</th>
                        </tr>
                        </thead>

                        <tbody className="align-top">
                        {laden && (
                            <>
                                <SkelettZeile />
                                <SkelettZeile />
                                <SkelettZeile />
                                <SkelettZeile />
                                <SkelettZeile />
                            </>
                        )}

                        {!laden && liste.length === 0 && (
                            <tr>
                                <td className="px-3 py-8 text-center text-gray-500" colSpan={10}>
                                    Keine Anzeigen gefunden.
                                </td>
                            </tr>
                        )}

                        {!laden && liste.map((a, idx) => (
                            <tr key={a.id} className={idx % 2 ? "border-t bg-gray-50/40" : "border-t"}>
                                <td className="px-3 py-2 whitespace-nowrap">{a.id}</td>

                                <td className="px-3 py-2">
                                    <div className="max-w-[12rem] truncate font-medium" title={leseTitel(a)}>
                                        {leseTitel(a)}
                                    </div>
                                </td>

                                <td className="px-3 py-2 whitespace-nowrap">{a.kategorie || "-"}</td>

                                {/*<td className="px-3 py-2">*/}
                                {/*    <div*/}
                                {/*        className="max-w-[20rem] truncate text-gray-700"*/}
                                {/*        title={a.beschreibung}*/}
                                {/*    >*/}
                                {/*        {a.beschreibung || "-"}*/}
                                {/*    </div>*/}
                                {/*</td>*/}

                                <td className="px-3 py-2 whitespace-nowrap">{a.stadt || "-"}</td>
                                <td className="px-3 py-2 whitespace-nowrap">{a.plz || "-"}</td>

                                <td className="px-3 py-2">
                    <span className={`inline-block rounded border px-2 py-0.5 text-[11px] ${statusKlasse(a.status)}`}>
                      {a.status || "-"}
                    </span>
                                </td>

                                <td className="px-3 py-2">
                                    <div className="max-w-[16rem] truncate" title={a.erstellerName ? `${a.erstellerName} (#${a.erstellerId})` : undefined}>
                                        {a.erstellerName ? `${a.erstellerName} (#${a.erstellerId})` : "-"}
                                    </div>
                                </td>

                                <td className="px-3 py-2">
                                    <div className="max-w-[16rem] truncate" title={a.helferName ? `${a.helferName} (#${a.helferId})` : undefined}>
                                        {a.helferName ? `${a.helferName} (#${a.helferId})` : "-"}
                                    </div>
                                </td>

                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => bestaetigungOeffnen(a)}
                                        className="rounded-xl border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50"
                                        title="Löschen"
                                    >
                                        Löschen
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Fußleiste mit Paging (дублируем снизу) */}
                <div className="flex items-center justify-between border-t bg-gray-50 px-3 py-2">
                    <span className="text-xs text-gray-600">Gesamt: {gesamtElemente}</span>
                    <div className="flex items-center gap-2">
                        <button
                            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                            disabled={seite <= 0}
                            onClick={() => setSeite(s => Math.max(0, s - 1))}
                        >
                            Zurück
                        </button>
                        <span className="text-xs text-gray-600">
              Seite {seite + 1} / {Math.max(1, gesamtSeiten)}
            </span>
                        <button
                            className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
                            disabled={seite >= gesamtSeiten - 1}
                            onClick={() => setSeite(s => s + 1)}
                        >
                            Weiter
                        </button>
                        <select
                            className="rounded-lg border px-2 py-1 text-sm"
                            value={groesse}
                            onChange={e => { setSeite(0); setGroesse(parseInt(e.target.value, 10)); }}
                            title="Seitengröße"
                        >
                            {[10, 20, 50].map(n => <option key={n} value={n}>{n} / Seite</option>)}
                        </select>
                    </div>
                </div>
            </div>

            {/* Modal */}
            {zeigeModal && loeschEintrag && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/40 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-3 text-lg font-semibold">Löschung bestätigen</h3>

                        <div className="mb-4 rounded-xl border border-gray-200 bg-gray-50 p-3">
                            <div className="text-xs uppercase text-gray-500">Titel</div>
                            <div className="truncate font-medium text-gray-900" title={leseTitel(loeschEintrag)}>
                                {leseTitel(loeschEintrag)}
                            </div>

                            {loeschEintrag.beschreibung && (
                                <>
                                    <div className="mt-3 text-xs uppercase text-gray-500">Beschreibung</div>
                                    <div className="max-h-60 overflow-y-auto whitespace-pre-line break-words text-gray-800">
                                        {loeschEintrag.beschreibung}
                                    </div>
                                </>
                            )}
                        </div>

                        <p className="mb-6 text-sm text-gray-700">
                            Willst du diese Anzeige wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={bestaetigungSchliessen}
                                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Abbrechen
                            </button>
                            <button
                                onClick={loescheAnfrageEndgueltig}
                                className="rounded-xl border border-red-200 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700"
                            >
                                Endgültig löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
