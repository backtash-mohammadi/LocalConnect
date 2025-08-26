import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/apiClient";

const AuthKontext = createContext(null);

export function AuthProvider({ children }) {
    const [benutzer, setBenutzer] = useState(() => {
        try { return JSON.parse(localStorage.getItem("lc_benutzer")); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem("lc_token"));
    const [laden, setLaden] = useState(false);

    useEffect(() => {
        if (token && !benutzer) {
            apiGet("/api/auth/me", token)
                .then((b) => setBenutzer(b))
                .catch(() => ausloggen());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    function speichereSession(neuesToken, neuerBenutzer) {
        setToken(neuesToken);
        setBenutzer(neuerBenutzer);
        localStorage.setItem("lc_token", neuesToken);
        localStorage.setItem("lc_benutzer", JSON.stringify(neuerBenutzer));
    }

    function aktualisiereBenutzer(neuerBenutzer){
        setBenutzer(neuerBenutzer);
        localStorage.setItem("lc_benutzer", JSON.stringify(neuerBenutzer));
    }

    async function einloggen({ emailAdresse, passwort }) {
        setLaden(true);
        try {
            const res = await apiPost("/api/auth/login", { emailAdresse, passwort });
            speichereSession(res.token, res.benutzer);
            return res.benutzer;
        } finally {
            setLaden(false);
        }
    }

    async function registrieren({ name, emailAdresse, passwort }) {
        setLaden(true);
        try {
            const res = await apiPost("/api/auth/register", { name, emailAdresse, passwort });
            speichereSession(res.token, res.benutzer);
            return res.benutzer;
        } finally {
            setLaden(false);
        }
    }

    function ausloggen() {
        setBenutzer(null);
        setToken(null);
        localStorage.removeItem("lc_token");
        localStorage.removeItem("lc_benutzer");
    }

    const wert = useMemo(() => ({ benutzer, token, laden, einloggen, registrieren, ausloggen, aktualisiereBenutzer }), [benutzer, token, laden]);
    return <AuthKontext.Provider value={wert}>{children}</AuthKontext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthKontext);
    if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> genutzt werden");
    return ctx;
}