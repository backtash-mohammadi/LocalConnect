import { useEffect, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";

/** Admin – Liste aller Anzeigen/Anfragen (einfach). */
export default function AdminAnzeigenSeite() {
    const { token } = useAuth();
    const [liste, setListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);

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

    useEffect(() => { lade(); /* eslint-disable-next-line */ }, [seite, groesse]);

    return (
        <div className="p-6 max-w-6xl mx-auto">
            <h1 className="text-2xl font-bold mb-4">Admin · Alle Anzeigen</h1>

            {/* Einfache Kopfzeile mit Paging */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600">Gesamt: {gesamtElemente}</span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={seite <= 0}
                    onClick={() => setSeite(s => Math.max(0, s - 1))}
                >
                    ← Zurück
                </button>
                <span className="text-sm">Seite {seite + 1} / {Math.max(1, gesamtSeiten)}</span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={seite >= gesamtSeiten - 1}
                    onClick={() => setSeite(s => s + 1)}
                >
                    Weiter →
                </button>

                <select
                    className="ml-auto border rounded px-2 py-1"
                    value={groesse}
                    onChange={e => { setSeite(0); setGroesse(parseInt(e.target.value, 10)); }}
                >
                    {[10, 20, 50].map(n => <option key={n} value={n}>{n} / Seite</option>)}
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
                        </tr>
                        </thead>
                        <tbody>
                        {liste.map((a) => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.id}</td>
                                <td className="px-3 py-2">{a.kategorie || "-"}</td>
                                <td className="px-3 py-2 max-w-[28rem] truncate" title={a.beschreibung}>{a.beschreibung || "-"}</td>
                                <td className="px-3 py-2">{a.stadt || "-"}</td>
                                <td className="px-3 py-2">{a.plz || "-"}</td>
                                <td className="px-3 py-2">
                                        <span className="inline-block px-2 py-0.5 rounded bg-gray-100 border">
                                            {a.status || "-"}
                                        </span>
                                </td>
                                <td className="px-3 py-2">{a.erstellerName ? `${a.erstellerName} (#${a.erstellerId})` : "-"}</td>
                                <td className="px-3 py-2">{a.helferName ? `${a.helferName} (#${a.helferId})` : "-"}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
