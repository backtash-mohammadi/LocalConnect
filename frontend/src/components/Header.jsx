import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { useEffect, useState } from "react";
import { apiGet } from "../lib/apiClient";

export default function Header() {
    const { benutzer, ausloggen, token } = useAuth();
    const [istAdmin, setIstAdmin] = useState(false);

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
                    <span className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">LC</span>
                    <span className="text-lg font-semibold">LocalConnect</span>
                </Link>

                <div className="flex flex-wrap items-center gap-3">
                    {istAdmin && (
                        <Link to="/admin" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                            Admin
                        </Link>
                    )}

                    {benutzer ? (
                        <>
                            <Link to="/profil" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Profil</Link>
                            <button onClick={ausloggen} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Abmelden</button>
                        </>
                    ) : (
                        <Link to="/login" className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">Login / Registrierung</Link>
                    )}
                </div>
            </div>
        </header>
    );
}
