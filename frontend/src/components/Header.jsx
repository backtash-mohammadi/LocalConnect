import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { useEffect, useRef, useState } from "react";
import { apiGet, baueQuery } from "../lib/apiClient";
import { FaMapMarkedAlt } from "react-icons/fa";
import mailIcon from "../assets/mailIcon.svg";
import {
    FiChevronDown,
    FiLogOut,
    FiUser,
    FiSettings,
    FiList,
    FiPlusCircle,
    FiClipboard,
    FiKey,
    FiSearch,
    FiHelpCircle,
    FiMail,
} from "react-icons/fi";

export default function Header() {
    // Basis-URL (für Avatar-Download)
    const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

    // Auth-Kontext
    const { benutzer, ausloggen, token } = useAuth();

    // Zustände
    const [istAdmin, setIstAdmin] = useState(false);
    const [menueOffen, setMenueOffen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState("");            // blob: URL für <img>
    const [hatKeinAvatar, setHatKeinAvatar] = useState(false); // Merker für 404
    const navigate = useNavigate();
    const dropdownRef = useRef(null);

    // Suche + Statistik
    const [suchtext, setSuchtext] = useState("");
    const [anzahlAnzeigenGesamt, setAnzahlAnzeigenGesamt] = useState(null);
    const [anzahlMeine, setAnzahlMeine] = useState(null);


    async function ladeAvatar() {
        if (!token) {
              if (avatarUrl) URL.revokeObjectURL(avatarUrl);
              setAvatarUrl("");
              return;
            }
        try {
              const headers = { Authorization: `Bearer ${token}` };
              const res = await fetch(`${BASIS_URL}/api/benutzer/me/avatar?ts=${Date.now()}`, { headers });
              if (res.status === 404) { setHatKeinAvatar(true); setAvatarUrl(""); return; }
              if (!res.ok) { setAvatarUrl(""); return; }
              const blob = await res.blob();
              const url = URL.createObjectURL(blob);
              setAvatarUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
            } catch {
              setAvatarUrl("");
            }
        }

    /// Ungelesen-Badge
    const [ungelesen, setUngelesen] = useState(0);
    useEffect(() => {
        let aktiv = true;
        async function poll() {
            try {
                if (!token) { setUngelesen(0); return; }
                const d = await apiGet(`/privatchats/unread-count`, token);
                const n = (typeof d?.anzahl === "number") ? d.anzahl : (typeof d === "number" ? d : 0);
                if (aktiv) setUngelesen(n);
            } catch {}
        }
        poll();
        const iv = setInterval(poll, 10000);
        return () => { aktiv = false; clearInterval(iv); };
    }, [token]);

    // Admin-Prüfung
    useEffect(() => {
        let abbruch = false;
        async function check() {
            if (!token) { setIstAdmin(false); return; }
            try {
                const r = await apiGet("/api/admin/ping", token);
                if (!abbruch) setIstAdmin(!!r?.ok);
            } catch {
                if (!abbruch) setIstAdmin(false);
            }
        }
        check();
        return () => { abbruch = true; };
    }, [token]);

    // Avatar laden
    useEffect(() => {
          ladeAvatar();
        }, [token, benutzer?.id]);

        useEffect(() => {
              function onAvatarChanged() {
                    setHatKeinAvatar(false);
                    ladeAvatar();
                  }
              window.addEventListener("avatar:changed", onAvatarChanged);
              return () => window.removeEventListener("avatar:changed", onAvatarChanged);
            }, [token]);

    // Schließen bei Klick außerhalb
    useEffect(() => {
        function onDocClick(e) {
            if (!menueOffen) return;
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setMenueOffen(false);
            }
        }
        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [menueOffen]);

    // Initialen als Fallback
    function initialen() {
        const s = (benutzer?.name || benutzer?.emailAdresse || "").trim();
        if (!s) return "?";
        const parts = s.split(/\s+/);
        const a = parts[0]?.[0] || "";
        const b = parts[1]?.[0] || "";
        return (a + b).toUpperCase();
    }

    // --- Suche → /karte?q=... ---
    function sucheAbsenden(e) {
        e.preventDefault();
        const q = (suchtext || "").trim();
        if (!q) return;
        setMenueOffen(false);
        navigate(`/karte?q=${encodeURIComponent(q)}`);
    }

    // --- Statistik laden ---
    useEffect(() => {
        let abbruch = false;

        async function ladeAdminAnzeigenGesamt() {
            if (!token || !istAdmin) { setAnzahlAnzeigenGesamt(null); return; }
            try {
                const q = baueQuery({ seite: 0, groesse: 1 });
                const res = await apiGet(`/api/admin/anzeigen${q}`, token);
                if (!abbruch) setAnzahlAnzeigenGesamt(
                    res?.gesamtElemente != null ? Number(res.gesamtElemente) : null
                );
            } catch {
                if (!abbruch) setAnzahlAnzeigenGesamt(null);
            }
        }

        // async function ladeMeine() {
        //     if (!token) { setAnzahlMeine(null); return; }
        //     try {
        //         const res = await apiGet(`/meine-anfragen`, token);
        //         if (!abbruch) setAnzahlMeine(Array.isArray(res) ? res.length : null);
        //     } catch {
        //         if (!abbruch) setAnzahlMeine(null);
        //     }
        // }

        ladeAdminAnzeigenGesamt();
        // ladeMeine();
        return () => { abbruch = true; };
    }, [token, istAdmin]);

    return (
        <header className="sticky top-0 z-40 w-full rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60">
            <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3">
                {/* Marke / Logo — снова на главную */}
                <Link to="/" className="group flex shrink-0 items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="LocalConnect Logo"
                        className="h-10 w-10 rounded-xl shadow-sm transition-transform group-hover:scale-105"
                    />
                    <span className="text-3xl font-thin tracking-tight text-indigo-700">
            LocalConnect
          </span>
                </Link>

                {/* Mitte: Karte-Link + Suche */}
                <div className="flex min-w-0 flex-1 items-center justify-center gap-3">
                    <nav className="flex items-center gap-2">
                        <Link
                            to="/karte"
                            className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-lg font-thin text-gray-700 hover:bg-gray-100"
                        >
                            <FaMapMarkedAlt className="opacity-80" />
                            Karte
                        </Link>
                    </nav>

                    {/* Suche */}
                    <form onSubmit={sucheAbsenden} className="relative w-44 sm:w-60 md:w-72 lg:w-80">
                        <FiSearch className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 opacity-60" />
                        <input
                            value={suchtext}
                            onChange={(e) => setSuchtext(e.target.value)}
                            placeholder="Suche (Stadt)…"
                            className="w-full rounded-xl border border-gray-300 bg-white pl-9 pr-3 py-2 text-sm outline-none transition focus:border-gray-400 focus:ring-2 focus:ring-gray-200"
                            aria-label="Globale Suche"
                        />
                    </form>

                    {/* Statistik */}
                    <div className="flex flex-wrap items-center gap-2">
                        {istAdmin && anzahlAnzeigenGesamt != null && (
                            <span className="rounded-full border border-indigo-200 bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-800">
                Anzeigen gesamt: {anzahlAnzeigenGesamt}
              </span>
                        )}
                        {anzahlMeine != null && (
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-800">
                Meine Anfragen: {anzahlMeine}
              </span>
                        )}
                    </div>
                </div>

                {/* Rechts: Badge + Profil / Login */}
                <div className="ml-auto flex items-center gap-2">
                    {/* 🔔 Nachrichten-Badge → /chats */}
                    {benutzer && (
                        <button
                            onClick={() => navigate("/chats")}
                            className="relative inline-flex  cursor-pointer px-2 py-1.5 text-xl hover:bg-gray-90"
                            aria-label="Nachrichten"
                            title="Nachrichten"
                        >
                            <img src={mailIcon} alt="" className="w-10 h-10" />


                            {ungelesen > 0 && (
                                <span className="ml-2 inline-flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                  {ungelesen}
                </span>
                            )}
                        </button>
                    )}

                    {benutzer ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setMenueOffen((v) => !v)}
                                className="inline-flex items-center gap-2 rounded-xl border-sky-200 px-2.5 py-1.5 text-md font-thin hover:bg-gray-50 cursor-pointer "
                            >
                                {avatarUrl ? (
                                    <img
                                        src={avatarUrl}
                                        alt="Avatar"
                                        className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                                    />
                                ) : (
                                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-white ring-2 ring-indigo-500/30">
                    {initialen()}
                  </span>
                                )}
                                <span className="max-w-[10rem] truncate font-medium text-gray-800">
                  {benutzer.name || benutzer.emailAdresse}
                </span>
                                {istAdmin && (
                                    <span className="ml-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    Admin
                  </span>
                                )}
                                <FiChevronDown className={`transition ${menueOffen ? "rotate-180" : ""}`} />
                            </button>

                            {menueOffen && (
                                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border-sky-200 bg-white shadow-lg ring-1 ring-black/5">
                                    <div className="px-3 py-2 text-xs text-gray-500">
                                        Angemeldet als
                                        <div className="truncate font-medium text-gray-800">
                                            {benutzer.emailAdresse}
                                        </div>
                                        {istAdmin && (
                                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                Aktive Rolle: Admin
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px bg-gray-100" />
                                    <Link to="/hilfe" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm  hover:bg-gray-50">
                                        <FiHelpCircle className="opacity-80" /> Hilfe
                                    </Link>

                                    <Link to="/profil" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FiUser className="opacity-80" /> Mein Profil
                                    </Link>
                                    <Link to="/profil/passwort" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FiKey className="opacity-80" /> Passwort ändern
                                    </Link>
                                    <Link to="/karte" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FaMapMarkedAlt className="opacity-80" /> Karte
                                    </Link>
                                    <Link to="/erstellen" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FiPlusCircle className="opacity-80" /> Anfrage erstellen
                                    </Link>
                                    <Link to="/chats" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FiMail className="opacity-80" /> Nachrichten
                                    </Link>
                                    <Link to="/meine-anfragen" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                        <FiClipboard className="opacity-80" /> Meine Anfragen
                                    </Link>

                                    {istAdmin && (
                                        <>
                                            <div className="h-px bg-gray-100" />
                                            <Link to="/admin" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                                <FiSettings className="opacity-80" /> Admin-Dashboard
                                            </Link>
                                            <Link to="/admin/anzeigen" onClick={() => setMenueOffen(false)} className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50">
                                                <FiList className="opacity-80" /> Admin · Anzeigen
                                            </Link>
                                        </>
                                    )}

                                    <div className="h-px bg-gray-100" />

                                    <button
                                        onClick={() => { setMenueOffen(false); ausloggen(); navigate("/"); }}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <FiLogOut /> Abmelden
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link to="/login" className="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50">
                            Login / Registrierung
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
