import { useState } from "react";
import { Link } from "react-router-dom";


export default function Header() {
    const [menueGeoeffnet, setMenueGeoeffnet] = useState(false);


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
                        <Link
                            key={verweis.pfad}
                            to={verweis.pfad}
                            className="text-sm text-gray-700 hover:text-indigo-700"
                        >
                            {verweis.beschriftung}
                        </Link>
                    ))}
                    <Link
                        to="/login"
                        className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                    >
                        Login / Registrierung
                    </Link>
                    <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-1.5 text-sm text-green-700">
                        <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
                        <span>Karma: <strong className="font-semibold">0</strong></span>
                    </div>
                </nav>


                {/* Mobile */}
                <button
                    aria-label="Menü öffnen"
                    onClick={() => setMenueGeoeffnet(!menueGeoeffnet)}
                    className="grid h-9 w-9 place-items-center rounded-lg border md:hidden"
                >
                    <span className="i-lucide-menu" />
                    <span className="sr-only">Menü</span>
                </button>
            </div>


            {menueGeoeffnet && (
                <div className="md:hidden">
                    <nav className="mx-4 mb-3 grid gap-2 rounded-xl border bg-white p-3">
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
                        <Link
                            to="/login"
                            className="rounded-lg px-3 py-2 text-sm hover:bg-gray-50"
                            onClick={() => setMenueGeoeffnet(false)}
                        >
                            Login / Registrierung
                        </Link>
                    </nav>
                </div>
            )}
        </header>
    );
}