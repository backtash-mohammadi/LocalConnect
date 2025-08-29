import { useEffect, useRef, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPut } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";

export default function ProfilSeite() {
    // Basis-URL des Backends
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Auth-Kontext
    const { token, benutzer, aktualisiereBenutzer } = useAuth();
    const navigate = useNavigate();

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
    const [ladeProzent, setLadeProzent] = useState(0);        // Upload-Fortschritt 0..100
    const fileInputRef = useRef(null);

    // Profil-Formular
    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });

    // Hilfswerte (de)
    const ERLAUBTE_TYPEN = new Set(["image/jpeg", "image/png", "image/webp"]);
    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

    function bytesZuText(n) {
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
        return () => { alive = false; };
    }, [token]);

    function feldAendern(e) {
        const { name, value } = e.target;
        setForm((f) => ({ ...f, [name]: value }));
    }

    // Profil speichern (ohne Foto-URL)
    async function speichern(e) {
        e.preventDefault();
        setFehler(""); setOk("");
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

    // Avatar geschützt laden (Token → blob → <img>)
    useEffect(() => {
        if (!token || hatKeinAvatar) {
            setAvatarUrl("");
            return;
        }
        let abbruch = false;
        (async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await fetch(`${BASIS_URL}/api/benutzer/me/avatar?ts=${Date.now()}`, { headers });

                if (res.status === 404) { setHatKeinAvatar(true); setAvatarUrl(""); return; }
                if (!res.ok) { setAvatarUrl(""); return; }

                const blob = await res.blob();
                if (abbruch) return;
                const url = URL.createObjectURL(blob);
                setAvatarUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
            } catch {
                setAvatarUrl("");
            }
        })();
        return () => { abbruch = true; };
    }, [token, avatarTs, hatKeinAvatar, BASIS_URL]);

    // Datei gewählt → prüfen + Vorschau
    function onAvatarWahl(e) {
        const file = e.target.files?.[0] || null;
        setFehler(""); setOk("");

        if (avatarVorschau) URL.revokeObjectURL(avatarVorschau);

        if (!file) {
            setAvatarDatei(null);
            setAvatarVorschau("");
            return;
        }
        if (!ERLAUBTE_TYPEN.has(file.type)) {
            setFehler("Nur JPEG/PNG/WEBP erlaubt.");
            setAvatarDatei(null); setAvatarVorschau("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }
        if (file.size > MAX_BYTES) {
            setFehler(`Datei ist zu groß (${bytesZuText(file.size)}). Max: ${bytesZuText(MAX_BYTES)}.`);
            setAvatarDatei(null); setAvatarVorschau("");
            if (fileInputRef.current) fileInputRef.current.value = "";
            return;
        }

        setAvatarDatei(file);
        setAvatarVorschau(URL.createObjectURL(file));
    }

    // Avatar hochladen (mit Fortschritt)
    async function avatarSpeichern(e) {
        e.preventDefault();
        if (!avatarDatei) return;
        setFehler(""); setOk("");
        setLadeProzent(0);

        const fd = new FormData();
        fd.append("datei", avatarDatei);

        try {
            await new Promise((resolve, reject) => {
                const xhr = new XMLHttpRequest();
                xhr.open("POST", `${BASIS_URL}/api/benutzer/me/avatar`);
                if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
                xhr.upload.onprogress = (ev) => {
                    if (!ev.lengthComputable) return;
                    setLadeProzent(Math.min(100, Math.round((ev.loaded / ev.total) * 100)));
                };
                xhr.onload = () => (xhr.status >= 200 && xhr.status < 300) ? resolve() : reject(new Error(xhr.responseText || `HTTP ${xhr.status}`));
                xhr.onerror = () => reject(new Error("Netzwerkfehler beim Hochladen."));
                xhr.send(fd);
            });

            setOk("Avatar gespeichert");
            if (avatarVorschau) { URL.revokeObjectURL(avatarVorschau); setAvatarVorschau(""); }
            setAvatarDatei(null);
            if (fileInputRef.current) fileInputRef.current.value = "";

            setHatKeinAvatar(false);
            setAvatarTs(Date.now()); // neu laden
        } catch (err) {
            setFehler(err.message || "Hochladen fehlgeschlagen.");
        } finally {
            setTimeout(() => setLadeProzent(0), 350);
        }
    }

    // Bildquelle: lokale Vorschau > geladener blob > nichts
    const bildSrc = avatarVorschau || avatarUrl || null;

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-4 flex items-center justify-between">
                <h1 className="text-xl font-bold">Profil</h1>
            </div>

            {laden ? (
                <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">Laden…</div>
            ) : (
                <>
                    <form onSubmit={speichern} className="space-y-5">
                        <div className="grid gap-4 rounded-2xl border bg-white p-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-900">Name</label>
                                <input
                                    name="name"
                                    value={form.name}
                                    onChange={feldAendern}
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

                                        {/* Datei wählen (verstecktes Input + Button) */}
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
                          ? `Ausgewählt: ${nameKurz(avatarDatei.name)} (${bytesZuText(avatarDatei.size)})`
                          : "Keine Datei ausgewählt"}
                    </span>
                                    </div>

                                    {/* Fortschritt */}
                                    {ladeProzent > 0 && (
                                        <div className="w-full max-w-md h-2 rounded bg-gray-200 overflow-hidden">
                                            <div
                                                className="h-2 bg-indigo-600 transition-all"
                                                style={{ width: `${ladeProzent}%` }}
                                                role="progressbar"
                                                aria-valuemin={0}
                                                aria-valuemax={100}
                                                aria-valuenow={ladeProzent}
                                            />
                                        </div>
                                    )}

                                    <div className="text-xs text-gray-500">
                                        Erlaubte Formate: JPEG, PNG, WEBP. Max: {bytesZuText(MAX_BYTES)}.
                                    </div>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-900">Fähigkeiten (kommasepariert)</label>
                                <textarea
                                    name="faehigkeiten"
                                    value={form.faehigkeiten}
                                    onChange={feldAendern}
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
                </>
            )}
        </div>
    );
}
