import { useEffect, useMemo, useRef, useState } from "react";
import { apiDelete, apiGet, apiPatch, baueQuery } from "../lib/apiClient";
import { useAuth } from "../context/AuthKontext";


const AVATAR_CACHE = new Map();   // key: string(id) -> blobURL
const AVATAR_404 = new Set();     // key: string(id) 404

export default function AdminBenutzerSeite() {
    const { token } = useAuth();
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // ---------- Zustand ----------
    const [liste, setListe] = useState([]);
    const [gesamtSeiten, setGesamtSeiten] = useState(0);
    const [gesamtElemente, setGesamtElemente] = useState(0);

    const [seite, setSeite] = useState(0);
    const [groesse, setGroesse] = useState(10);

    const [suchtext, setSuchtext] = useState("");
    const [eingabe, setEingabe] = useState("");
    const timerRef = useRef(null);

    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    const [sortSchluessel, setSortSchluessel] = useState("name");
    const [sortAuf, setSortAuf] = useState(true);

    const [zuLoeschen, setZuLoeschen] = useState(null);
    const [busy, setBusy] = useState(false);

    const [avatarVersion, setAvatarVersion] = useState(0);

    // ---------- Suche (entprellt) ----------
    useEffect(() => {
        if (timerRef.current) clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
            setSuchtext(eingabe.trim());
            setSeite(0);
        }, 300);
        return () => clearTimeout(timerRef.current);
    }, [eingabe]);

    // ---------- Laden ----------
    useEffect(() => {
        lade();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [seite, groesse, suchtext]);

    async function lade() {
        try {
            setFehler("");
            setLaden(true);
            const qs = baueQuery({ page: seite, size: groesse, q: suchtext || undefined });
            const daten = await apiGet(`/api/admin/benutzer${qs}`, token);
            const inhalte = Array.isArray(daten.inhalte) ? daten.inhalte : [];
            setListe(inhalte);
            setGesamtSeiten(daten.gesamtSeiten || 0);
            setGesamtElemente(daten.gesamtElemente || 0);
        } catch (e) {
            setFehler(e?.message || "Fehler");
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        if (!token || !Array.isArray(liste) || liste.length === 0) return;
        let abbruch = false;

        (async () => {
            const headers = { Authorization: `Bearer ${token}` };
            let changed = false;

            for (const b of liste) {
                const key = String(b?.id ?? "");
                if (!key) continue;

                if (AVATAR_CACHE.has(key) || AVATAR_404.has(key)) {
                    continue;
                }

                try {
                    const res = await fetch(`${BASIS_URL}/api/admin/benutzer/${key}/avatar?ts=${Date.now()}`, { headers });
                    if (abbruch) return;

                    if (res.status === 404) {
                        AVATAR_404.add(key);
                        changed = true;
                        continue;
                    }
                    if (!res.ok) {

                        continue;
                    }

                    const blob = await res.blob();
                    if (abbruch) return;
                    const url = URL.createObjectURL(blob);

                    const alt = AVATAR_CACHE.get(key);
                    if (alt) URL.revokeObjectURL(alt);

                    AVATAR_CACHE.set(key, url);
                    changed = true;
                } catch {
                }
            }

            if (!abbruch && changed) {
                setAvatarVersion((v) => v + 1);
            }
        })();

        return () => { abbruch = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [liste, token]);

    // ---------- Sortierung (clientseitig) ----------
    const sortierteListe = useMemo(() => {
        const kopie = [...liste];
        kopie.sort((a, b) => {
            const A = a?.[sortSchluessel];
            const B = b?.[sortSchluessel];
            let cmp = 0;
            if (A == null && B == null) cmp = 0;
            else if (A == null) cmp = 1;
            else if (B == null) cmp = -1;
            else cmp = String(A).localeCompare(String(B), "de", { sensitivity: "base" });
            return sortAuf ? cmp : -cmp;
        });
        return kopie;
    }, [liste, sortSchluessel, sortAuf]);

    function wechsleSort(s) {
        if (s === sortSchluessel) setSortAuf(!sortAuf);
        else {
            setSortSchluessel(s);
            setSortAuf(true);
        }
    }

    // ---------- Aktionen ----------
    async function wechsleSperre(id, neu) {
        if (busy) return;
        setBusy(true);
        try {
            await apiPatch(`/api/admin/benutzer/${id}/sperren`, { gesperrt: neu }, token);
            setListe((l) => l.map((b) => (b.id === id ? { ...b, gesperrt: neu } : b)));
        } catch (e) {
            alert(e?.message || "Fehler beim Sperren/Entsperren");
        } finally {
            setBusy(false);
        }
    }

    async function bestaetigtLoeschen() {
        if (!zuLoeschen || busy) return;
        setBusy(true);
        try {
            await apiDelete(`/api/admin/benutzer/${zuLoeschen.id}`, token);
            const key = String(zuLoeschen.id);
            const alt = AVATAR_CACHE.get(key);
            if (alt) URL.revokeObjectURL(alt);
            AVATAR_CACHE.delete(key);
            AVATAR_404.delete(key);

            setZuLoeschen(null);
            setListe((l) => l.filter((b) => b.id !== zuLoeschen.id));
            if (liste.length === 1 && seite > 0) setSeite((s) => s - 1);
            else await lade();
        } catch (e) {
            alert(e?.message || "Fehler beim Löschen");
        } finally {
            setBusy(false);
        }
    }

    function seitenText() {
        const von = gesamtElemente === 0 ? 0 : seite * groesse + 1;
        const bis = Math.min((seite + 1) * groesse, gesamtElemente);
        return `${von}–${bis} von ${gesamtElemente}`;
    }

    // ---------- Darstellung ----------
    return (
        <div className="admin-benutzer-seite mx-auto max-w-6xl px-4 py-6">
            {/* Kopf */}
            <div className="kopf mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Benutzerverwaltung</h1>
                    <p className="text-sm text-gray-600">Suchen, sortieren, sperren/entsperren und löschen.</p>
                </div>
                <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
                    <div className="suche relative grow sm:grow-0">
                        <input
                            value={eingabe}
                            onChange={(e) => setEingabe(e.target.value)}
                            placeholder="Nach Name oder E-Mail suchen…"
                            className="block w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm outline-none ring-0 transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                        />
                        {eingabe && (
                            <button
                                onClick={() => setEingabe("")}
                                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md px-2 text-xs text-gray-500 hover:bg-gray-100"
                                aria-label="Suche leeren"
                            >
                                ×
                            </button>
                        )}
                    </div>
                    <select
                        value={groesse}
                        onChange={(e) => {
                            setGroesse(Number(e.target.value));
                            setSeite(0);
                        }}
                        className="rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm"
                        title="Seitengröße"
                    >
                        {[10, 20, 50].map((n) => (
                            <option key={n} value={n}>
                                {n}/Seite
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Karte */}
            <div className="karte overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
                {/* Kopf der Tabelle */}
                <div className="tabelle-kopf grid grid-cols-12 gap-3 border-b bg-gray-50 px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-600">
                    <button onClick={() => wechsleSort("name")} className="col-span-4 text-left hover:underline">
                        Name
                    </button>
                    <button onClick={() => wechsleSort("emailAdresse")} className="col-span-3 text-left hover:underline">
                        E-Mail
                    </button>
                    <button onClick={() => wechsleSort("karma")} className="col-span-2 text-left hover:underline">
                        Karma
                    </button>
                    <button onClick={() => wechsleSort("gesperrt")} className="col-span-1 text-left hover:underline">
                        Status
                    </button>
                    <div className="col-span-2 text-right">Aktionen</div>
                </div>

                {/* Zustände */}
                {laden && <div className="px-4 py-6 text-sm text-gray-500">Lade Benutzer…</div>}
                {fehler && !laden && <div className="px-4 py-6 text-sm text-red-600">Fehler: {fehler}</div>}
                {!laden && !fehler && sortierteListe.length === 0 && (
                    <div className="px-4 py-6 text-sm text-gray-500">Keine Benutzer gefunden.</div>
                )}

                {/* Zeilen */}
                {!laden && !fehler && sortierteListe.map((b) => {
                    const key = String(b?.id ?? "");
                    const avatarUrl = key ? AVATAR_CACHE.get(key) : null;

                    return (
                        <div key={b.id} className="zeile grid grid-cols-12 items-center gap-3 border-t px-4 py-3 text-sm hover:bg-gray-50 first:border-t-0">
                            {/* Name + Avatar */}
                            <div className="col-span-4 flex items-center gap-3">
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="avatar"
                                        className="h-9 w-9 rounded-full object-cover"
                                        loading="lazy"
                                    />
                                ) : (
                                    <div className="avatar grid h-9 w-9 place-items-center rounded-full bg-gray-200 text-xs font-semibold text-gray-700">
                                        {initialen(b?.name || b?.emailAdresse)}
                                    </div>
                                )}
                                <div className="min-w-0">
                                    <div className="truncate font-medium">{b?.name || "—"}</div>
                                    <div className="truncate text-xs text-gray-500">{b?.emailAdresse || "—"}</div>
                                </div>
                            </div>

                            {/* E-Mail */}
                            <div className="col-span-3 truncate">{b?.emailAdresse || "—"}</div>

                            {/* Karma */}
                            <div className="col-span-2">
                                <span className="inline-flex min-w-[3ch] justify-end rounded border border-gray-200 px-2 py-0.5 text-xs">
                                    {b?.karma ?? 0}
                                </span>
                            </div>

                            {/* Status */}
                            <div className="col-span-1">
                                {b?.gesperrt ? (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-100 px-2 py-0.5 text-[11px] text-red-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> gesperrt
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 rounded-full border border-green-200 bg-green-100 px-2 py-0.5 text-[11px] text-green-700">
                                        <span className="h-1.5 w-1.5 rounded-full bg-current" /> aktiv
                                    </span>
                                )}
                            </div>

                            {/* Aktionen */}
                            <div className="col-span-2 flex justify-end gap-2">
                                <button
                                    onClick={() => wechsleSperre(b.id, !b.gesperrt)}
                                    disabled={busy}
                                    className="btn klein rounded-lg border border-gray-300 px-2 py-1 text-xs hover:bg-gray-50 disabled:opacity-50"
                                    title={b.gesperrt ? "Entsperren" : "Sperren"}
                                >
                                    {b.gesperrt ? "Entsperren" : "Sperren"}
                                </button>
                                <button
                                    onClick={() => setZuLoeschen({ id: b.id, name: b.name })}
                                    disabled={busy}
                                    className="btn klein rounded-lg border border-red-300 px-2 py-1 text-xs text-red-700 hover:bg-red-50 disabled:opacity-50"
                                    title="Löschen"
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>
                    );
                })}

                {/* Fuß: Pagination */}
                <div className="border-t bg-gray-50 px-4 py-3">
                    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
                        <div className="text-xs text-gray-600">{seitenText()}</div>
                        <div className="flex items-center gap-2">
                            <button onClick={() => setSeite((s) => Math.max(0, s - 1))} disabled={seite === 0} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">
                                Zurück
                            </button>
                            <span className="text-xs text-gray-600">
                                Seite {seite + 1} / {Math.max(1, gesamtSeiten)}
                            </span>
                            <button onClick={() => setSeite((s) => Math.min(gesamtSeiten - 1, s + 1))} disabled={gesamtSeiten === 0 || seite >= gesamtSeiten - 1} className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50">
                                Weiter
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lösch-Bestätigung */}
            {zuLoeschen && (
                <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                        <h3 className="mb-3 text-lg font-semibold">Benutzer löschen?</h3>
                        <p className="mb-6 text-sm text-gray-700">
                            Möchtest du den Benutzer „{zuLoeschen.name}“ wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setZuLoeschen(null)} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                                Abbrechen
                            </button>
                            <button onClick={bestaetigtLoeschen} className="rounded-xl border border-red-200 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                                Ja, löschen
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// -------- Hilfsfunktion --------
function initialen(nameOderMail) {
    const s = String(nameOderMail || "").trim();
    if (!s) return "?";
    const teile = s.split(/[\s.@_-]+/).filter(Boolean);
    if (teile.length === 1) return teile[0].slice(0, 2).toUpperCase();
    return (teile[0][0] + (teile[1]?.[0] || "")).toUpperCase();
}
