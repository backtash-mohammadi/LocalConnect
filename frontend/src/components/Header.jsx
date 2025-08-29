import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { useEffect, useRef, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { FaMapMarkedAlt } from "react-icons/fa";
import {
    FiChevronDown,
    FiLogOut,
    FiUser,
    FiSettings,
    FiList,
    FiPlusCircle,
    FiClipboard,
    FiKey
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

    // Avatar laden: fetch mit Authorization → blob URL
    useEffect(() => {
        if (!token || hatKeinAvatar) {
            if (avatarUrl) URL.revokeObjectURL(avatarUrl);
            setAvatarUrl("");
            return;
        }
        let abbruch = false;
        (async () => {
            try {
                const headers = { Authorization: `Bearer ${token}` };
                const res = await fetch(`${BASIS_URL}/api/benutzer/me/avatar?ts=${Date.now()}`, { headers });
                if (res.status === 404) { if (!abbruch) { setHatKeinAvatar(true); setAvatarUrl(""); } return; }
                if (!res.ok) { if (!abbruch) setAvatarUrl(""); return; }
                const blob = await res.blob();
                if (abbruch) return;
                const url = URL.createObjectURL(blob);
                setAvatarUrl((old) => { if (old) URL.revokeObjectURL(old); return url; });
            } catch {
                if (!abbruch) setAvatarUrl("");
            }
        })();
        return () => { abbruch = true; };
    }, [token, benutzer?.name]);

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

    // Initialen als Fallback (wenn kein Avatar)
    function initialen() {
        const s = (benutzer?.name || benutzer?.emailAdresse || "").trim();
        if (!s) return "?";
        const parts = s.split(/\s+/);
        const a = parts[0]?.[0] || "";
        const b = parts[1]?.[0] || "";
        return (a + b).toUpperCase();
    }

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/70 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-3">
                {/* Marke / Logo */}
                <Link to="/" className="group flex items-center gap-3">
                    <img
                        src="/logo.png"
                        alt="LocalConnect Logo"
                        className="h-10 w-10 rounded-xl shadow-sm transition-transform group-hover:scale-105"
                    />
                    <span className="text-xl font-bold tracking-tight text-indigo-700">
            LocalConnect
          </span>
                </Link>

                {/* Haupt-Navigation */}
                <nav className="hidden sm:flex items-center gap-2">
                    <Link
                        to="/karte"
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100"
                    >
                        <FaMapMarkedAlt className="opacity-80" />
                        Karte
                    </Link>

                    {istAdmin && (
                        <div className="ml-2 inline-flex items-center gap-2">
                            <Link
                                to="/admin"
                                className="rounded-xl border px-3 py-2 text-sm font-medium hover:bg-gray-50"
                            >
                                Admin-Dashboard
                            </Link>
                            <Link
                                to="/admin/anzeigen"
                                className="rounded-xl px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                            >
                                Admin · Anzeigen
                            </Link>
                        </div>
                    )}
                </nav>

                {/* Rechts: Auth / Profil */}
                <div className="flex items-center gap-2">
                    {benutzer ? (
                        <div className="relative" ref={dropdownRef}>
                            <button
                                onClick={() => setMenueOffen((v) => !v)}
                                className="inline-flex items-center gap-2 rounded-xl border px-2.5 py-1.5 text-sm hover:bg-gray-50"
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

                                {/* Admin-Badge neben dem Namen */}
                                {istAdmin && (
                                    <span className="ml-1 rounded-full border border-amber-300 bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                    Admin
                  </span>
                                )}

                                <FiChevronDown className={`transition ${menueOffen ? "rotate-180" : ""}`} />
                            </button>

                            {/* Dropdown-Menü */}
                            {menueOffen && (
                                <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border bg-white shadow-lg ring-1 ring-black/5">
                                    <div className="px-3 py-2 text-xs text-gray-500">
                                        Angemeldet als
                                        <div className="truncate font-medium text-gray-800">
                                            {benutzer.emailAdresse}
                                        </div>
                                        {/* Aktive Rolle */}
                                        {istAdmin && (
                                            <div className="mt-2 inline-flex items-center gap-1 rounded-full border border-amber-300 bg-amber-50 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                                                Aktive Rolle: Admin
                                            </div>
                                        )}
                                    </div>

                                    <div className="h-px bg-gray-100" />

                                    <Link
                                        to="/profil"
                                        onClick={() => setMenueOffen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                    >
                                        <FiUser className="opacity-80" />
                                        Mein Profil
                                    </Link>

                                    {/* NEU: Passwort ändern */}
                                    <Link
                                        to="/profil/passwort"
                                        onClick={() => setMenueOffen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                    >
                                        <FiKey className="opacity-80" />
                                        Passwort ändern
                                    </Link>

                                    {/* Karte */}
                                    <Link
                                        to="/karte"
                                        onClick={() => setMenueOffen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                    >
                                        <FaMapMarkedAlt className="opacity-80" />
                                        Karte
                                    </Link>

                                    {/* Anfrage erstellen */}
                                    <Link
                                        to="/erstellen"
                                        onClick={() => setMenueOffen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                    >
                                        <FiPlusCircle className="opacity-80" />
                                        Anfrage erstellen
                                    </Link>

                                    {/* Meine Anfragen */}
                                    <Link
                                        to="/meine-anfragen"
                                        onClick={() => setMenueOffen(false)}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                    >
                                        <FiClipboard className="opacity-80" />
                                        Meine Anfragen
                                    </Link>

                                    {/* Admin-Einträge */}
                                    {istAdmin && (
                                        <>
                                            <div className="h-px bg-gray-100" />
                                            <Link
                                                to="/admin"
                                                onClick={() => setMenueOffen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                            >
                                                <FiSettings className="opacity-80" />
                                                Admin-Dashboard
                                            </Link>
                                            <Link
                                                to="/admin/anzeigen"
                                                onClick={() => setMenueOffen(false)}
                                                className="flex items-center gap-2 px-4 py-2.5 text-sm hover:bg-gray-50"
                                            >
                                                <FiList className="opacity-80" />
                                                Admin · Anzeigen
                                            </Link>
                                        </>
                                    )}

                                    <div className="h-px bg-gray-100" />

                                    <button
                                        onClick={() => { setMenueOffen(false); ausloggen(); navigate("/"); }}
                                        className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50"
                                    >
                                        <FiLogOut />
                                        Abmelden
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-xl border px-3 py-1.5 text-sm font-medium hover:bg-gray-50"
                        >
                            Login / Registrierung
                        </Link>
                    )}
                </div>
            </div>

            {/* Mobile Subnav (Admin) */}
            {istAdmin && (
                <div className="sm:hidden border-t bg-white/80">
                    <div className="mx-auto max-w-6xl px-4 py-2 flex gap-2">
                        <Link
                            to="/admin"
                            className="rounded-lg border px-3 py-1.5 text-xs font-medium hover:bg-gray-50"
                        >
                            Admin-Dashboard
                        </Link>
                        <Link
                            to="/admin/anzeigen"
                            className="rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
                        >
                            Admin · Anzeigen
                        </Link>
                    </div>
                </div>
            )}
        </header>
    );
}
