
import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiPost } from "../lib/apiClient";


const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || "support@example.com";

export default function KontaktSeite() {
    const { benutzer, token } = useAuth();

    // Formularzustände
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [kategorie, setKategorie] = useState("Frage");
    const [betreff, setBetreff] = useState("Allgemeine Anfrage");
    const [nachricht, setNachricht] = useState("");

    // UI-Zustände
    const [laedt, setLaedt] = useState(false);
    const [fehler, setFehler] = useState("");
    const [erfolg, setErfolg] = useState(false);

    // Praktisch: Benutzerdaten vorbefüllen
    useEffect(() => {
        if (benutzer) {
            if (!name && benutzer.name) setName(benutzer.name);
            if (!email && benutzer.emailAdresse) setEmail(benutzer.emailAdresse);
        }
    }, [benutzer]);

    async function sendeKontakt(e) {
        e?.preventDefault?.();
        setFehler("");
        setErfolg(false);

        // Kleine Validierung
        if (!email.trim() || !nachricht.trim()) {
            setFehler("Bitte E‑Mail und Nachricht angeben.");
            return;
        }

        const payload = {
            name: name.trim() || null,
            email: email.trim(),
            kategorie,
            betreff: betreff.trim(),
            nachricht: nachricht.trim(),
        };

        try {
            setLaedt(true);
            // Versuche an ein übliches Backend-Endpoint zu senden
            await apiPost("/kontakt", payload, token);
            setErfolg(true);
            setNachricht("");
        } catch (err) {
            // Fallback: freundlich Fehler zeigen + mailto-Vorschlag
            setFehler(err?.message || "Senden fehlgeschlagen. Bitte versuche es später erneut.");
        } finally {
            setLaedt(false);
        }
    }

    const mailtoHref = `mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent(betreff)}&body=${encodeURIComponent(nachricht ? nachricht : "Hallo Team,")}`;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <header className="mb-6 rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">Kontakt</h1>
                <p className="mt-2 text-gray-600">
                    Wir helfen gerne! Schicke uns deine Frage, Idee oder ein Problem.
                </p>
            </header>

            <form onSubmit={sendeKontakt} className="space-y-4 rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                {/* Name */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Name</label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Dein Name (optional)"
                    />
                </div>

                {/* E-Mail */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">E‑Mail-Adresse*</label>
                    <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="du@example.com"
                    />
                </div>

                {/* Kategorie + Betreff */}
                <div className="grid gap-4 md:grid-cols-2">
                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Kategorie</label>
                        <select
                            value={kategorie}
                            onChange={(e) => setKategorie(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                        >
                            <option>Frage</option>
                            <option>Idee</option>
                            <option>Problem</option>
                            <option>Sonstiges</option>
                        </select>
                    </div>

                    <div>
                        <label className="mb-1 block text-sm font-medium text-gray-700">Betreff</label>
                        <input
                            value={betreff}
                            onChange={(e) => setBetreff(e.target.value)}
                            className="w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                            placeholder="Kurz und knackig"
                        />
                    </div>
                </div>

                {/* Nachricht */}
                <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">Nachricht*</label>
                    <textarea
                        required
                        value={nachricht}
                        onChange={(e) => setNachricht(e.target.value)}
                        className="min-h-[140px] w-full rounded-xl border px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300"
                        placeholder="Beschreibe kurz dein Anliegen…"
                    />
                </div>

                {/* Fehler / Erfolg */}
                {fehler && (
                    <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                        {fehler}
                    </div>
                )}
                {erfolg && (
                    <div className="rounded-xl border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
                        Danke! Deine Nachricht wurde gesendet.
                    </div>
                )}

                {/* Aktionen */}
                <div className="flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={laedt || !email.trim() || !nachricht.trim()}
                        className="rounded-xl bg-indigo-600 px-4 py-2 font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                    >
                        {laedt ? "Senden…" : "Nachricht senden"}
                    </button>

                    <a href={mailtoHref} className="rounded-xl border px-4 py-2 text-gray-700 hover:bg-gray-50">
                        Per E‑Mail öffnen
                    </a>
                </div>
            </form>

            <section className="mt-8 text-sm text-gray-500">
                <p>
                    Hinweis: Falls das Formular nicht funktioniert, kannst du uns jederzeit per E‑Mail schreiben.
                </p>
            </section>
        </div>
    );
}
