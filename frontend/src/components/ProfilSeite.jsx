import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPut } from "../lib/apiClient";

export default function ProfilSeite() {
    // Basis-URL des Backends
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Auth-Kontext
    const { token, benutzer, aktualisiereBenutzer } = useAuth();

    // UI-Zustände
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [ok, setOk] = useState("");

    // Avatar-Zustände
    const [avatarDatei, setAvatarDatei] = useState(null);     // ausgewählte Datei
    const [avatarUrl, setAvatarUrl] = useState("");           // blob: URL für <img>
    const [avatarVorschau, setAvatarVorschau] = useState(""); // Vorschau der neuen Datei
    const [avatarTs, setAvatarTs] = useState(0);              // Trigger, um Avatar erneut zu laden
    const [hatKeinAvatar, setHatKeinAvatar] = useState(false);// Merker: Avatar existiert (noch) nicht
    const fileInputRef = useRef(null);                        // zum Auslösen des Datei-Dialogs

    // Profil-Formular
    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });

    // Profil laden
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

    // Feldänderung
    function change(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    // Profil speichern (ohne Foto-URL)
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

            // Kontext/Badges sofort aktualisieren
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

    // Avatar vom Server laden (geschützt: erst mit Token holen → blob → <img src=blob>)
    useEffect(() => {
        if (!token || hatKeinAvatar) {
            // kein Token oder bereits bekannt, dass kein Avatar existiert
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
                    // Avatar ist (noch) nicht vorhanden → nicht weiter versuchen, bis Upload erfolgt
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
                // altes blob freigeben, um Leaks zu vermeiden
                setAvatarUrl((old) => {
                    if (old) URL.revokeObjectURL(old);
                    return url;
                });
            } catch {
                setAvatarUrl("");
            }
        })();

        return () => {
            abbruch = true;
        };
    }, [token, avatarTs, hatKeinAvatar, BASIS_URL]);

    // Datei gewählt → lokale Vorschau setzen
    function onAvatarWahl(e) {
        const file = e.target.files?.[0] || null;
        setAvatarDatei(file);
        if (avatarVorschau) URL.revokeObjectURL(avatarVorschau);
        if (file) {
            setAvatarVorschau(URL.createObjectURL(file));
        } else {
            setAvatarVorschau("");
        }
    }

    // Avatar hochladen
    async function avatarSpeichern(e) {
        e.preventDefault();
        if (!avatarDatei) return;
        setFehler("");
        setOk("");

        const fd = new FormData();
        fd.append("datei", avatarDatei);

        try {
            const headers = {};
            if (token) headers.Authorization = `Bearer ${token}`;
            // WICHTIG: KEIN Content-Type setzen (Browser setzt boundary selbst)
            const res = await fetch(`${BASIS_URL}/api/benutzer/me/avatar`, {
                method: "POST",
                headers,
                body: fd,
            });

            if (!res.ok) {
                const t = await res.text();
                throw new Error(t || `HTTP ${res.status}`);
            }

            setOk("Avatar gespeichert");

            // Vorschau und Dateiauswahl zurücksetzen
            if (avatarVorschau) {
                URL.revokeObjectURL(avatarVorschau);
                setAvatarVorschau("");
            }
            setAvatarDatei(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            // Jetzt existiert der Avatar → Flag zurücksetzen und Neu-Laden triggern
            setHatKeinAvatar(false);
            setAvatarTs(Date.now());

            // Optional: Kontext anstupsen, falls Avatar in Header/Badge angezeigt wird
            if (typeof aktualisiereBenutzer === "function") {
                aktualisiereBenutzer({ ...(benutzer || {}) });
            }
        } catch (err) {
            setFehler(err.message || "Hochladen fehlgeschlagen.");
        }
    }

    // Quelle für <img>: lokale Vorschau > geladener blob > sonst Platzhalter
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
                                <label className="block text-sm font-medium text-gray-900">
                                    Name
                                </label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={change}
                                    required
                                    className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">
                                    E-Mail
                                </label>
                                <input
                                    value={form.emailAdresse}
                                    readOnly
                                    className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">
                                    Avatar
                                </label>
                                <div className="mt-2 flex flex-wrap items-center gap-4">
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

                                    {/* Verstecktes File-Input + stilisierte Buttons */}
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
                                        disabled={!avatarDatei}
                                        className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
                                    >
                                        Avatar speichern
                                    </button>

                                    {/* Dateiname kurz anzeigen */}
                                    <span className="text-sm text-gray-600">
                    {avatarDatei ? `Ausgewählt: ${avatarDatei.name}` : "Keine Datei ausgewählt"}
                  </span>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">
                                    Fähigkeiten (kommasepariert)
                                </label>
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
                            {fehler && (
                                <span className="text-sm text-red-700">{fehler}</span>
                            )}
                        </div>

                        <div className="mt-6 grid gap-3 text-sm text-gray-600">
                            <div>
                                Aktuelles Karma: <strong>{form.karma}</strong>
                            </div>
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

// --- Unterkomponente: Passwort ändern ---
function PasswortAendernForm() {
    const { token } = useAuth();
    const [felder, setFelder] = useState({
        aktuellesPasswort: "",
        neuesPasswort: "",
        neuesPasswortWdh: "",
    });
    const [ok, setOk] = useState("");
    const [fehler, setFehler] = useState("");
    const [lade, setLade] = useState(false);

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
            setOk("Passwort wurde geändert. Bitte melde dich neu an.");
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
                />
            </div>
            <div className="flex items-center gap-3">
                <button
                    disabled={lade}
                    type="submit"
                    className="rounded-2xl bg-indigo-600 px-4 py-2 text-white disabled:opacity-60"
                >
                    {lade ? "Speichere..." : "Passwort speichern"}
                </button>
                {ok && <span className="text-sm text-green-700">{ok}</span>}
                {fehler && <span className="text-sm text-red-700">{fehler}</span>}
            </div>
        </form>
    );
}
