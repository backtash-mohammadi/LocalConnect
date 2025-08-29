import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPut } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

export default function ProfilSeite() {
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";
    const { token, benutzer, aktualisiereBenutzer } = useAuth();

    // UI
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [ok, setOk] = useState("");

    // Avatar
    const [avatarDatei, setAvatarDatei] = useState(null);
    const [avatarUrl, setAvatarUrl] = useState("");
    const [avatarVorschau, setAvatarVorschau] = useState("");
    const [avatarTs, setAvatarTs] = useState(0);
    const [hatKeinAvatar, setHatKeinAvatar] = useState(false);
    const [ladeProzent, setLadeProzent] = useState(0); // Upload-Fortschritt 0..100
    const fileInputRef = useRef(null);

    // Profil-Form
    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });

    // ---------- Hilfen (de) ----------
    const ERLAUBTE_TYPEN = new Set(["image/jpeg", "image/png", "image/webp"]);
    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

    function bytesToText(n) {
        if (n < 1024) return `${n} B`;
        if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`;
        return `${(n / (1024 * 1024)).toFixed(2)} MB`;
    }

    function nameKurz(name, max = 24) {
        if (!name) return "";
        if (name.length <= max) return name;
        const keep = Math.floor((max - 3) / 2);
        return `${name.slice(0, keep)}...${name.slice(-keep)}`;
    }

    // ---------- Profil laden ----------
    useEffect(() => {
        let alive = true;
        setLaden(true);
        apiGet("/api/benutzer/me", token)
            .then((data) => {
                if (!alive) return;
                setForm({
                    name: data.name || "",
                    emailAdresse: data.emailAdresse || "",
                    faehigkeiten: data.faehigkeiten || "",
                    karma: data.karma || 0,
                    erstelltAm: data.erstelltAm || "",
                });
            })
            .catch((e) => {
                if (!alive) return;
                setFehler(e.message || "Fehler beim Laden");
            })
            .finally(() => {
                if (!alive) return;
                setLaden(false);
            });
        return () => {
            alive = false;
        };
    }, [token]);

    function change(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    // ---------- Profil speichern ----------
    async function speichern(e) {
        e.preventDefault();
        setFehler("");
        setOk("");
        try {
            const payload = {
                name: form.name.trim(),
                faehigkeiten: form.faehigkeiten.trim() || null,
            };
            const updated = await apiPut("/api/benutzer/me", payload, token);
            setOk("Profil gespeichert");
            if (typeof aktualisiereBenutzer === "function") {
                aktualisiereBenutzer({
                    ...(benutzer || {}),
                    name: updated.name,
                    emailAdresse: updated.emailAdresse,
                    karma: updated.karma,
                });
            }
        } catch (err) {
            setFehler(err.message || "Fehler beim Speichern");
        }
    }

    // ---------- Avatar laden (geschützt per Token) ----------
    useEffect(() => {
        if (!token || hatKeinAvatar) {
            setAvatarUrl("");
            return;
        }
        let abbruch = false;
        (async () => {
            try {
                const headers = {};
                if (token) headers.Authorization = `Bearer ${token}`;
                const res = await fetch(`${BASIS_URL}/api/benutzer/me/avatar`, { headers });

                if (res.status === 404) {
                    setHatKeinAvatar(true);
                    setAvatarUrl("");
                    return;
                }
                if (!res.ok) {
                    setAvatarUrl("");
                    return;
                }

                const blob = await res.blob();
                if (abbruch) return;
                const url = URL.createObjectURL(blob);
                setAvatarUrl((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return url;
                });
            } catch {
                setAvatarUrl("");
            }
        })();
        return () => { abbruch = true; };
    }, [token, avatarTs, hatKeinAvatar, BASIS_URL]);

    // ---------- Datei gewählt ----------
    function onAvatarWahl(e) {
        const file = e.target.files?.[0] || null;
        setFehler("");
        setOk("");

        // alte Vorschau aufräumen
        if (avatarVorschau) URL.revokeObjectURL(avatarVorschau);

        if (!file) {
            setAvatarDatei(null);
            setAvatarVorschau("");
            return;
        }

        if (!ERLAUBTE_TYPEN.has(file.type)) {
            setFehler("Nur JPEG/PNG/WEBP erlaubt.");
            setAvatarDatei(null);
            setAvatarVorschau("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > MAX_BYTES) {
            setFehler(`Datei ist zu groß (${bytesToText(file.size)}). Max: ${bytesToText(MAX_BYTES)}.`);
            setAvatarDatei(null);
            setAvatarVorschau("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setAvatarDatei(file);
        setAvatarVorschau(URL.createObjectURL(file));
    }

    // ---------- Avatar hochladen (mit Fortschritt) ----------
    async function avatarSpeichern(e) {
        e.preventDefault();
        if (!avatarDatei) return;
        setFehler("");
        setOk("");
        setLadeProzent(0);

        const fd = new FormData();
        fd.append("datei", avatarDatei);

        try {
            // XMLHttpRequest verwenden, um Upload-Fortschritt zu bekommen
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${BASIS_URL}/api/benutzer/me/avatar`);

                if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);

                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return;
                    const pct = Math.min(100, Math.round((ev.loaded / ev.total) * 100));
                    setLadeProzent(pct);
                };

                xhr.onload = () => {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        resolve();
                    } else {
                        reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
                    }
                };
                xhr.onerror = () => reject(new Error("Netzwerkfehler beim Hochladen."));
                xhr.send(fd);
            });

            setOk("Avatar gespeichert");
            // Vorschau & Auswahl zurücksetzen
            if (avatarVorschau) {
                URL.revokeObjectURL(avatarVorschau);
                setAvatarVorschau("");
            }
            setAvatarDatei(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Avatar neu laden
            setHatKeinAvatar(false);
            setAvatarTs(Date.now());
        } catch (err) {
            setFehler(err.message || "Hochladen fehlgeschlagen.");
        } finally {
            // kleinen Delay, чтобы прогресс-бар успел показать 100%
            setTimeout(() => setLadeProzent(0), 350);
        }
    }

    const bildSrc = avatarVorschau || avatarUrl || null;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-4 text-xl font-bold">Profil</h1>

            {laden ? (
                <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">
                    Laden…
                </div>
            ) : (
                <>
                    <form onSubmit={speichern} className="space-y-5">
                        <div className="grid gap-4 rounded-2xl border bg-white p-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={change}
                                    required
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">E-Mail</label>
                                <input
                                    value={form.emailAdresse}
                                    readOnly
                                    className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">Avatar</label>
                                <div className="mt-2 flex flex-col gap-3">
                                    <div className="flex flex-wrap items-center gap-4">
                                        {bildSrc ? (
                                            <img
                                                src={bildSrc}
                                                alt="Avatar"
                                                className="h-16 w-16 rounded-full object-cover border"
                                            />
                                        ) : (
                                            <div
                                                className="h-16 w-16 rounded-full bg-gray-200 border flex items-center justify-center text-xs text-gray-500"
                                                aria-label="Kein Avatar"
                                            >
                                                kein Bild
                                            </div>
                                        )}

                                        {/* verstecktes Input + stilisierte Buttons */}
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            accept="image/png,image/jpeg,image/webp"
                                            onChange={onAvatarWahl}
                                            className="hidden"
                                        />

                                        <button
                                            type="button"
                                            onClick={() => fileInputRef.current?.click()}
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                                        >
                                            Datei wählen
                                        </button>

                                        <button
                                            type="button"
                                            onClick={avatarSpeichern}
                                            disabled={!avatarDatei || !!ladeProzent}
                                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                        >
                                            {ladeProzent ? `Lade ${ladeProzent}%` : "Avatar speichern"}
                                        </button>

                                        <span className="text-sm text-gray-600">
                      {avatarDatei
                          ? `Ausgewählt: ${nameKurz(avatarDatei.name)} (${bytesToText(avatarDatei.size)})`
                          : "Keine Datei ausgewählt"}
                    </span>
                                    </div>

                                    {/* Fortschrittsbalken */}
                                    {ladeProzent > 0 && (
                                        <div className="w-full max-w-md h-2 rounded bg-gray-200 overflow-hidden">
                                            <div
                                                className="h-2 bg-indigo-600 transition-all"
                                                style={{ width: `${ladeProzent}%` }}
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={ladeProzent}
                                                role="progressbar"
                                            />
                                        </div>
                                    )}

                                    {/* Hinweise zu erlaubten Formaten */}
                                    <div className="text-xs text-gray-500">
                                        Erlaubte Formate: JPEG, PNG, WEBP. Max: {bytesToText(MAX_BYTES)}.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">Fähigkeiten (kommasepariert)</label>
                                <textarea
                                    name="faehigkeiten"
                                    value={form.faehigkeiten}
                                    onChange={change}
                                    rows={3}
                                    placeholder="kann Fahrrad reparieren, hat Werkzeug"
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="submit"
                                className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
                            >
                                Speichern
                            </button>
                            {ok && <span className="text-sm text-green-700">{ok}</span>}
                            {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                        </div>

                        <div className="mt-6 grid gap-3 text-sm text-gray-600">
                            <div>Aktuelles Karma: <strong>{form.karma}</strong></div>
                            {form.erstelltAm && (
                                <div>
                                    Konto erstellt am:{" "}
                                    <time dateTime={form.erstelltAm}>
                                        {new Date(form.erstelltAm).toLocaleString()}
                                    </time>
                                </div>
                            )}
                        </div>
                    </form>

                    <hr className="my-8" />
                    <h2 className="text-lg font-semibold">Passwort ändern</h2>
                    <PasswortAendernForm />
                </>
            )}
        </div>
    );
}

// --- Unterkomponente: Passwort ändern (Auto-Logout + Redirect) ---
function PasswortAendernForm() {
    const { token, ausloggen } = useAuth();
    const navigate = useNavigate();
    const LOGIN_PFAD = "/login"; // <- при необходимости поменяй

    const [felder, setFelder] = useState({
        aktuellesPasswort: "",
        neuesPasswort: "",
        neuesPasswortWdh: "",
    });
    const [ok, setOk] = useState("");
    const [fehler, setFehler] = useState("");
    const [lade, setLade] = useState(false);

    // Countdown für Auto-Logout
    const [logoutSekunden, setLogoutSekunden] = useState(0);
    const timerRef = useRef({ intervalId: null, timeoutId: null });

    // Timer aufräumen beim Unmount
    useEffect(() => {
        return () => {
            if (timerRef.current.intervalId) clearInterval(timerRef.current.intervalId);
            if (timerRef.current.timeoutId) clearTimeout(timerRef.current.timeoutId);
        };
    }, []);

    function starteAutoLogoutCountdown(sekunden = 5) {
        // vorhandene Timer stoppen
        if (timerRef.current.intervalId) clearInterval(timerRef.current.intervalId);
        if (timerRef.current.timeoutId) clearTimeout(timerRef.current.timeoutId);

        setLogoutSekunden(sekunden);

        // 1-секундный тикер
        timerRef.current.intervalId = setInterval(() => {
            setLogoutSekunden((prev) => {
                if (prev <= 1) {
                    clearInterval(timerRef.current.intervalId);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // фактический логаут + редирект
        timerRef.current.timeoutId = setTimeout(() => {
            try { ausloggen(); } catch {}
            navigate(LOGIN_PFAD, { replace: true });
        }, sekunden * 1000);
    }

    async function absenden(e) {
        e.preventDefault();
        setOk("");
        setFehler("");

        if (felder.neuesPasswort.length < 8) {
            setFehler("Neues Passwort muss mindestens 8 Zeichen haben.");
            return;
        }
        if (felder.neuesPasswort !== felder.neuesPasswortWdh) {
            setFehler("Neue Passwörter stimmen nicht überein.");
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
            starteAutoLogoutCountdown(5); // авто-логаут и редирект через 5с
        } catch (err) {
            setFehler(err.message || "Ändern fehlgeschlagen.");
        } finally {
            setLade(false);
        }
    }

    return (
        <form onSubmit={absenden} className="mt-4 grid gap-4 max-w-md">
            <div>
                <label className="block text-sm mb-1">Aktuelles Passwort</label>
                <input
                    type="password"
                    className="w-full rounded border px-3 py-2"
                    value={felder.aktuellesPasswort}
                    onChange={(e) =>
                        setFelder({ ...felder, aktuellesPasswort: e.target.value })
                    }
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
                    onChange={(e) =>
                        setFelder({ ...felder, neuesPasswort: e.target.value })
                    }
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
                    onChange={(e) =>
                        setFelder({ ...felder, neuesPasswortWdh: e.target.value })
                    }
                    required
                    minLength={8}
                    disabled={lade || logoutSekunden > 0}
                />
            </div>

            <div className="flex items-center gap-3">
                <button
                    disabled={lade || logoutSekunden > 0}
                    type="submit"
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
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
    );
}
