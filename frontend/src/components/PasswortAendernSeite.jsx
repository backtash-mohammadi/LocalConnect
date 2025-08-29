import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { useNavigate } from "react-router-dom";

export default function PasswortAendernSeite() {
    const { token, ausloggen } = useAuth();
    const navigate = useNavigate();
    const LOGIN_PFAD = "/login"; // при необходимости поменяй

    // Felder & UI
    const [felder, setFelder] = useState({
        aktuellesPasswort: "",
        neuesPasswort: "",
        neuesPasswortWdh: "",
    });
    const [ok, setOk] = useState("");
    const [fehler, setFehler] = useState("");
    const [lade, setLade] = useState(false);

    // Auto-Logout nach Erfolg
    const [logoutSekunden, setLogoutSekunden] = useState(0);
    const timerRef = useRef({ intervalId: null, timeoutId: null });

    // Timer aufräumen
    useEffect(() => {
        return () => {
            if (timerRef.current.intervalId) clearInterval(timerRef.current.intervalId);
            if (timerRef.current.timeoutId) clearTimeout(timerRef.current.timeoutId);
        };
    }, []);

    function starteAutoLogoutCountdown(sekunden = 5) {
        if (timerRef.current.intervalId) clearInterval(timerRef.current.intervalId);
        if (timerRef.current.timeoutId) clearTimeout(timerRef.current.timeoutId);

        setLogoutSekunden(sekunden);

        timerRef.current.intervalId = setInterval(() => {
            setLogoutSekunden((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current.intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        timerRef.current.timeoutId = setTimeout(() => {
            try { ausloggen(); } catch {}
            navigate(LOGIN_PFAD, { replace: true });
        }, sekunden * 1000);
    }

    async function absenden(e) {
        e.preventDefault();
        setOk(""); setFehler("");

        if (felder.neuesPasswort.length < 8) {
            setFehler("Neues Passwort muss mindestens 8 Zeichen haben.");
            return;
        }
        if (felder.neuesPasswort !== felder.neuesPasswortWdh) {
            setFehler("Neue Passwörter stimmen nicht übereин.");
            return;
        }

        setLade(true);
        try {
            const headers = { "Content-Type": "application/json" };
            if (token) headers.Authorization = `Bearer ${token}`;

            const res = await fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/api/benutzer/me/passwort`,
                {
                    method: "PATCH",
                    headers,
                    body: JSON.stringify({
                        aktuellesPasswort: felder.aktuellesPasswort,
                        neuesPasswort: felder.neuesPasswort,
                    }),
                }
            );
            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }

            setOk("Passwort wurde geändert. Du wirst automatisch abgemeldet.");
            starteAutoLogoutCountdown(5);
        } catch (err) {
            setFehler(err.message || "Ändern fehlgeschlagen.");
        } finally {
            setLade(false);
        }
    }

    return (
        <div className="mx-auto max-w-xl px-4 py-8">
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-xl font-bold">Passwort ändern</h1>
            </div>

            <form onSubmit={absenden} className="grid gap-4 rounded-2xl border bg-white p-4">
                <div>
                    <label className="block text-sm mb-1">Aktuelles Passwort</label>
                    <input
                        type="password"
                        className="w-full rounded border px-3 py-2"
                        value={felder.aktuellesPasswort}
                        onChange={(e) => setFelder({ ...felder, aktuellesPasswort: e.target.value })}
                        required
                        disabled={lade || logoutSekunden > 0}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Neues Passwort</label>
                    <input
                        type="password"
                        className="w-full rounded border px-3 py-2"
                        value={felder.neuesPasswort}
                        onChange={(e) => setFelder({ ...felder, neuesPasswort: e.target.value })}
                        required
                        minLength={8}
                        disabled={lade || logoutSekunden > 0}
                    />
                </div>

                <div>
                    <label className="block text-sm mb-1">Neues Passwort (Wiederholung)</label>
                    <input
                        type="password"
                        className="w-full rounded border px-3 py-2"
                        value={felder.neuesPasswortWdh}
                        onChange={(e) => setFelder({ ...felder, neuesPasswortWdh: e.target.value })}
                        required
                        minLength={8}
                        disabled={lade || logoutSekunden > 0}
                    />
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={lade || logoutSekunden > 0}
                        type="submit"
                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-60 hover:bg-indigo-700"
                    >
                        {lade ? "Speichere..." : "Passwort speichern"}
                    </button>

                    {ok && (
                        <span className="text-sm text-green-700">
              {ok}
                            {logoutSekunden > 0 ? ` (Weiterleitung in ${logoutSekunden}s)` : ""}
            </span>
                    )}
                    {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                </div>
            </form>
        </div>
    );
}
