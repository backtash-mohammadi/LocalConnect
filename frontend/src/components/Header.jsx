import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import BenutzerBadge from "./BenutzerBadge.jsx";

export default function Header() {
    const [menueGeoeffnet, setMenueGeoeffnet] = useState(false);
    const { benutzer, ausloggen } = useAuth();

    const verweise = [
        { pfad: "/", beschriftung: "Anzeigen" },
        { pfad: "/erstellen", beschriftung: "Anzeige erstellen" },
        { pfad: "/profil", beschriftung: "Profil" },
    ];

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                <Link to="/" className="flex items-center gap-2">
                    <span className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">LC</span>
                    <span className="text-lg font-semibold">LocalConnect</span>
                </Link>

                <nav className="hidden items-center gap-6 md:flex">
                    {verweise.map((verweis) => (
                        <Link key={verweis.pfad} to={verweis.pfad} className="text-sm text-gray-700 hover:text-indigo-700">
                            {verweis.beschriftung}
                        </Link>
                    ))}

                    {/* Sichtbarer Status */}
                    <BenutzerBadge />

                    {benutzer ? (
                        <button onClick={ausloggen} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                            Abmelden
                        </button>
                    ) : (
                        <Link to="/login" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                            Login / Registrierung
                        </Link>
                    )}
                </nav>

                {/* Mobile */}
                <div className="flex items-center md:hidden">
                    {/* Mobile: Logout/Login als Mini-Button immer sichtbar */}
                    {benutzer ? (
                        <button
                            onClick={ausloggen}
                            className="mr-2 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                            Abmelden
                        </button>
                    ) : (
                        <Link
                            to="/login"
                            className="mr-2 rounded-lg border px-2 py-1 text-xs hover:bg-gray-50"
                        >
                            Login
                        </Link>
                    )}

                    <button
                        aria-label="Menü öffnen"
                        onClick={() => setMenueGeoeffnet(!menueGeoeffnet)}
                        className="grid h-9 w-9 place-items-center rounded-lg border"
                    >
                        <span className="i-lucide-menu" />
                        <span className="sr-only">Menü</span>
                    </button>
                </div>
            </div>

            {menueGeoeffnet && (
                <div className="md:hidden">
                    <nav className="mx-4 mb-3 grid gap-2 rounded-xl border bg-white p-3">
                        <BenutzerBadge />
                        {verweise.map((verweis) => (
                            <Link
                                key={verweis.pfad}
                                to={verweis.pfad}
                                className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => setMenueGeoeffnet(false)}
                            >
                                {verweis.beschriftung}
                            </Link>
                        ))}
                        {benutzer ? (
                            <button
                                onClick={() => {
                                    ausloggen();
                                    setMenueGeoeffnet(false);
                                }}
                                className="rounded-lg px-3 py-2 text-left text-sm hover:bg-gray-50"
                            >
                                Abmelden
                            </button>
                        ) : (
                            <Link
                                to="/login"
                                className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                                onClick={() => setMenueGeoeffnet(false)}
                            >
                                Login / Registrierung
                            </Link>
                        )}
                    </nav>
                </div>
            )}
        </header>
    );
}
