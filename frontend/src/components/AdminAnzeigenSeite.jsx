import { useEffect, useState } from "react";
import { apiGet, baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";

/** Пытаемся достать название поста из разных возможных полей; НИКОГДА не берём описания */
function leseTitel(a) {
    if (!a) return "-";
    const kandidaten = [
        a.title,         // твоё поле в БД -> JSON
        a.titel,         // вдруг где-то приходит по-немецки
        a.name,
        a.ueberschrift,
        a.anzeigeTitel,
    ].filter(Boolean);
    if (kandidaten.length > 0) return String(kandidaten[0]);
    return `Beitrag #${a.id}`;
}

/** Admin – Liste aller Anzeigen/Anfragen (einfach) mit Modal & Toast */
export default function AdminAnzeigenSeite() {
    const { token } = useAuth();
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Zustand
    const [liste, setListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    // Paging (немецкие имена под твой бэкенд)
    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);

    // Modal: показываем выбранный пост целиком
    const [zeigeModal, setZeigeModal] = useState(false);
    const [loeschEintrag, setLoeschEintrag] = useState(null); // {id, title, beschreibung, ...}

    // Toast
    const [toast, setToast] = useState(""); // текст тоста

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

    // Открыть/закрыть модалку
    function bestaetigungOeffnen(eintrag) {
        setLoeschEintrag(eintrag);
        setZeigeModal(true);
    }
    function bestaetigungSchliessen() {
        setZeigeModal(false);
        setLoeschEintrag(null);
    }

    // Удаление с подтверждением
    async function loescheAnfrageEndgueltig() {
        if (!loeschEintrag) return;
        try {
            const resp = await fetch(`${BASIS_URL}/api/admin/anzeigen/${loeschEintrag.id}`, {
                method: "DELETE",
                headers: {
                    Authorization: token ? `Bearer ${token}` : "",
                },
            });
            if (!resp.ok) {
                const payload = await (async () => {
                    try { return await resp.json(); } catch (_) { return null; }
                })();
                const msg = payload?.nachricht || payload?.fehler || resp.statusText;
                throw new Error(msg || "Löschen fehlgeschlagen");
            }
            // локально обновить список
            setListe(prev => prev.filter(a => a.id !== loeschEintrag.id));
            bestaetigungSchliessen();

            // toast
            setToast("Anzeige gelöscht");
        } catch (e) {
            setFehler(e.message || "Fehler beim Löschen");
            bestaetigungSchliessen();
        }
    }

    // Авто-скрытие тоста
    useEffect(() => {
        if (!toast) return;
        const t = setTimeout(() => setToast(""), 3000);
        return () => clearTimeout(t);
    }, [toast]);

    return (
        <div className="p-6 max-w-6xl mx-auto relative">
            {/* Toast */}
            {toast && (
                <div
                    className="fixed right-4 top-4 z-50 rounded-xl bg-green-600 px-4 py-2 text-white shadow-lg"
                    role="status"
                    aria-live="polite"
                >
                    {toast}
                </div>
            )}

            <h1 className="text-2xl font-bold mb-4">Admin · Alle Anzeigen</h1>

            {/* Kopfzeile mit Paging */}
            <div className="flex items-center gap-3 mb-4">
                <span className="text-sm text-gray-600">Gesamt: {gesamtElemente}</span>
                <button
                    className="px-3 py-1 border rounded disabled:opacity-50"
                    disabled={seite <= 0}
                    onClick={() => setSeite(s => Math.max(0, s - 1))}
                >
                    ← Zurück
                </button>
                <span className="text-sm">
          Seite {seite + 1} / {Math.max(1, gesamtSeiten)}
        </span>
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
                            <th className="text-left px-3 py-2">Titel</th>
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
                        {liste.map(a => (
                            <tr key={a.id} className="border-t">
                                <td className="px-3 py-2">{a.id}</td>
                                <td className="px-3 py-2">{leseTitel(a)}</td>
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
                                        onClick={() => bestaetigungOeffnen(a)} // передаём весь объект
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
            {zeigeModal && loeschEintrag && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
                        <h3 className="mb-3 text-lg font-semibold">Löschung bestätigen</h3>

                        {/* Детали поста: ТОЛЬКО реальный Titel + описание со скроллом */}
                        <div className="mb-4 rounded-lg border bg-gray-50 p-3">
                            <div className="text-sm text-gray-500">Titel</div>
                            <div
                                className="font-medium text-gray-900 truncate"
                                title={leseTitel(loeschEintrag)}
                            >
                                {leseTitel(loeschEintrag)}
                            </div>

                            {loeschEintrag.beschreibung && (
                                <>
                                    <div className="mt-3 text-sm text-gray-500">Beschreibung</div>
                                    <div className="max-h-60 overflow-y-auto break-words whitespace-pre-line text-gray-800">
                                        {loeschEintrag.beschreibung}
                                    </div>
                                </>
                            )}
                        </div>

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
