import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { useNavigate } from "react-router-dom";
import { FaMapMarkedAlt } from "react-icons/fa";

export default function Header() {
    const { benutzer, ausloggen, token } = useAuth();
    const [istAdmin, setIstAdmin] = useState(false);
    const navigate = useNavigate();

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

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
                <Link to="/" className="flex items-center gap-2">
                    <div className="flex items-center">
                        <img
                            src="/logo.png"
                            alt="LocalConnect Logo"
                            className="h-16 w-16 mb-4"
                        />
                        <h1 className="text-3xl font-bold text-indigo-700">LocalConnect</h1>
                    </div>
                </Link>
                <Link to="/karte" className="flex items-center gap-2">
                    <div className="flex items-center">
                        <h2 className="text-2xl font-bold text-indigo-700">Karte <FaMapMarkedAlt /></h2>
                    </div>
                </Link>

                {/* Admin-Navigation */}
                {istAdmin && (
                    <div className="flex items-center gap-4">
                        <Link
                            to="/admin"
                            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            Admin-Dashboard
                        </Link>
                        <Link
                            to="/admin/anzeigen"
                            className="font-semibold text-red-600 hover:text-red-700"
                        >
                            Admin · Anzeigen
                        </Link>
                    </div>
                )}

                <div className="flex flex-wrap items-center gap-3">
                    {benutzer ? (
                        <>
                            <Link
                                to="/profil"
                                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Profil
                            </Link>
                            <button
                                onClick={() => {
                                    ausloggen();
                                    navigate("/");
                                }}
                                className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                            >
                                Abmelden
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
                        >
                            Login / Registrierung
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
}
