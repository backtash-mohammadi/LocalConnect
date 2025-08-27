import { useEffect, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";

/** Admin – Liste aller Anzeigen/Anfragen (einfach) mit Modal-Löschbestätigung. */
export default function AdminAnzeigenSeite() {
    const { token } = useAuth();
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Zustand
    const [liste, setListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    // Paging (behalte deine deutschen Param-Namen)
    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);

    // Modal-Zustand
    const [zeigeModal, setZeigeModal] = useState(false);
    const [loeschId, setLoeschId] = useState(null);

    async function lade() {
        setLaden(true);
        setFehler("");
        try {
            const q = baueQuery({ seite, groesse }); // <-- bleiben wie у тебя
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

    // Открыть модалку с выбранным id
    function bestaetigungOeffnen(id) {
        setLoeschId(id);
        setZeigeModal(true);
    }

    function bestaetigungSchliessen() {
        setZeigeModal(false);
        setLoeschId(null);
    }

    // Удаление по подтверждению из модалки
    async function loescheAnfrageEndgueltig() {
        if (!loeschId) return;
        try {
            const resp = await fetch(`${BASIS_URL}/api/admin/anzeigen/${loeschId}`, {
                method: "DELETE",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });
            if (!resp.ok) {
                const payload = await (async () => {
                    try {
                        return await resp.json();
                    } catch (_) {
                        return null;
                    }
                })();
                const msg = payload?.nachricht || payload?.fehler || resp.statusText;
                throw new Error(msg || "Löschen fehlgeschlagen");
            }
            // локально обновить список
            setListe((prev) => prev.filter((a) => a.id !== loeschId));
            bestaetigungSchliessen();
        } catch (e) {
            setFehler(e.message || "Fehler beim Löschen");
            bestaetigungSchliessen();
        }
    }

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin · Alle Anzeigen</h1>

            {/* Kopfzeile mit Paging */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600">Gesamt: {gesamtElemente}</span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={seite <= 0}
                    onClick={() => setSeite((s) => Math.max(0, s - 1))}
                >
                    ← Zurück
                </button>
                <span className="text-sm">
          Seite {seite + 1} / {Math.max(1, gesamtSeiten)}
        </span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={seite >= gesamtSeiten - 1}
                    onClick={() => setSeite((s) => s + 1)}
                >
                    Weiter →
                </button>

                <select
                    className="ml-auto border rounded px-2 py-1"
                    value={groesse}
                    onChange={(e) => {
                        setSeite(0);
                        setGroesse(parseInt(e.target.value, 10));
                    }}
                >
                    {[10, 20, 50].map((n) => (
                        <option key={n} value={n}>
                            {n} / Seite
                        </option>
                    ))}
                </select>
            </div>

            {fehler && <div className="text-red-600 mb-4">{fehler}</div>}

            {laden ? (
                <div className="text-gray-500">Lade…</div>
            ) : (
                <div className="overflow-x-auto border rounded">
                    <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="text-left px-3 py-2">ID</th>
                            <th className="text-left px-3 py-2">Kategorie</th>
                            <th className="text-left px-3 py-2">Beschreibung</th>
                            <th className="text-left px-3 py-2">Stadt</th>
                            <th className="text-left px-3 py-2">PLZ</th>
                            <th className="text-left px-3 py-2">Status</th>
                            <th className="text-left px-3 py-2">Ersteller</th>
                            <th className="text-left px-3 py-2">Helfer</th>
                            <th className="text-left px-3 py-2">Aktion</th>
                        </tr>
                        </thead>
                        <tbody>
                        {liste.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.id}</td>
                                <td className="px-3 py-2">{a.kategorie || "-"}</td>
                                <td
                                    className="px-3 py-2 max-w-[28rem] truncate"
                                    title={a.beschreibung}
                                >
                                    {a.beschreibung || "-"}
                                </td>
                                <td className="px-3 py-2">{a.stadt || "-"}</td>
                                <td className="px-3 py-2">{a.plz || "-"}</td>
                                <td className="px-3 py-2">
                    <span className="inline-block px-2 py-0.5 rounded bg-gray-100 border">
                      {a.status || "-"}
                    </span>
                                </td>
                                <td className="px-3 py-2">
                                    {a.erstellerName ? `${a.erstellerName} (#${a.erstellerId})` : "-"}
                                </td>
                                <td className="px-3 py-2">
                                    {a.helferName ? `${a.helferName} (#${a.helferId})` : "-"}
                                </td>
                                <td className="px-3 py-2">
                                    <button
                                        onClick={() => bestaetigungOeffnen(a.id)}
                                        className="rounded-xl border border-red-300 px-2 py-1 text-sm text-red-700 hover:bg-red-50"
                                    >
                                        Löschen
                                    </button>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Modal */}
            {zeigeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-3 text-lg font-semibold">Löschung bestätigen</h3>
                        <p className="mb-6 text-sm text-gray-700">
                            Willst du diese Anzeige wirklich löschen? Diese Aktion kann nicht
                            rückgängig gemacht werden.
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
