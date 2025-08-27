import { useEffect, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { apiDelete, apiPatch } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";

/** Einfache Admin-Seite: Benutzerliste mit Sperren/Entsperren und Löschen. */
export default function AdminBenutzerSeite() {
    const { token } = useAuth();
    const [benutzerListe, setBenutzerListe] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    async function lade() {
        try {
            setFehler("");
            setLaden(true);
            const daten = await apiGet("/api/admin/benutzer", token);
            setBenutzerListe(daten);
        } catch (e) {
            setFehler(e.message || "Fehler");
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => { lade(); }, []);

    async function wechsleSperre(id, gesperrtNeu) {
        try {
            await apiPatch(`/api/admin/benutzer/${id}/sperren`, { gesperrt: gesperrtNeu }, token);
            setBenutzerListe(liste => liste.map(b => b.id === id ? { ...b, gesperrt: gesperrtNeu } : b));
        } catch (e) {
            alert(e.message);
        }
    }

    async function loeschen(id) {
        if (!confirm("Benutzer wirklich löschen?")) return;
        try {
            await apiDelete(`/api/admin/benutzer/${id}`, token);
            setBenutzerListe(liste => liste.filter(b => b.id !== id));
        } catch (e) {
            alert(e.message);
        }
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            <h1 className="mb-6 text-2xl font-semibold">Admin – Benutzerverwaltung</h1>

            {fehler && <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">{fehler}</div>}
            {laden ? (
                <div className="text-gray-600">Lade Benutzer…</div>
            ) : (
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
                        {benutzerListe.map(b => (
                            <tr key={b.id} className="hover:bg-gray-50">
                                <td className="px-4 py-2 text-sm">{b.id}</td>
                                <td className="px-4 py-2 text-sm">{b.name}</td>
                                <td className="px-4 py-2 text-sm">{b.emailAdresse}</td>
                                <td className="px-4 py-2 text-sm">{b.karma}</td>
                                <td className="px-4 py-2 text-sm">
                                    {b.gesperrt ? <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700">gesperrt</span> :
                                        <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-700">aktiv</span>}
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
                                            onClick={() => loeschen(b.id)}
                                            className="rounded-xl border px-3 py-1.5 text-red-600 hover:bg-red-50"
                                            title="Löschen"
                                        >
                                            Löschen
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {benutzerListe.length === 0 && (
                            <tr>
                                <td colSpan={6} className="px-4 py-8 text-center text-sm text-gray-500">
                                    Keine Benutzer gefunden.
                                </td>
                            </tr>
                        )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
