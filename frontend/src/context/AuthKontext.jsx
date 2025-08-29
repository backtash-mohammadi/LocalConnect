import { createContext, useContext, useMemo, useState } from "react";
import { apiGet, apiPost } from "../lib/apiClient";
import { holeOderErzeugeGeraeteId, geraeteName } from "../lib/geraeteId";

const AuthKontext = createContext(null);

export function AuthProvider({ children }) {
    const [benutzer, setBenutzer] = useState(() => {
        try { return JSON.parse(localStorage.getItem("lc_benutzer")); } catch { return null; }
    });
    const [token, setToken] = useState(() => localStorage.getItem("lc_token"));
    const [laden, setLaden] = useState(false);

    async function ladeMich() {
        if (token && !benutzer && !laden) {
            setLaden(true);
            try {
                const b = await apiGet("/api/auth/me", token);
                setBenutzer(b);
                localStorage.setItem("lc_benutzer", JSON.stringify(b));
            } catch {
                // токен протух/невалиден
                setBenutzer(null);
                setToken(null);
                localStorage.removeItem("lc_benutzer");
                localStorage.removeItem("lc_token");
            } finally {
                setLaden(false);
            }
        }
    }
    if (token && !benutzer && !laden) { ladeMich(); }

    function setzeAngemeldet(neuesToken, b) {
        setToken(neuesToken);
        setBenutzer(b);
        localStorage.setItem("lc_token", neuesToken);
        localStorage.setItem("lc_benutzer", JSON.stringify(b));
    }

    // === Registrierung ===
    async function registrieren(daten) {
        // Ожидаем, что бэкенд вернёт 202 + {status:"VERIFIKATION_ERFORDERLICH"} или просто 202
        const r = await apiPost("/api/auth/registrierung/start", daten);
        return { verifikationErforderlich: true, ...r };
    }

    async function bestaetigeRegistrierung(emailAdresse, code) {
        await apiPost("/api/auth/registrierung/bestaetigen", { emailAdresse, code });
    }

    // === Login mit 2FA per neuem Gerät ===
    async function starteLogin(emailAdresse, passwort) {
        const geraeteHash = holeOderErzeugeGeraeteId();
        try {
            // 200 => сразу получаем token, 202 => требуется 2FA
            const resp = await apiPost("/api/auth/login/start", {
                emailAdresse, passwort,
                geraeteHash, geraeteName: geraeteName()
            });

            // Если сервер вернул сразу токен/пользователя
            if (resp?.token && resp?.benutzer) {
                setzeAngemeldet(resp.token, resp.benutzer);
                return { zweiFaktor: false };
            }

            // 202 Accepted (или просто тело без токена) => требуется код
            return { zweiFaktor: true, emailAdresse, geraeteHash };

        } catch (err) {
            // Если почта не подтверждена – сервер отдаёт 403
            if (err.status === 403 && ("" + err.message).toLowerCase().includes("bestätigt")) {
                // Пусть компонент решит, что делать (переход на /verifizieren)
                const e = new Error("E-Mail ist noch nicht bestätigt");
                e.status = 403;
                throw e;
            }
            throw err;
        }
    }

    async function bestaetigeLogin(emailAdresse, code) {
        const geraeteHash = holeOderErzeugeGeraeteId();
        const resp = await apiPost("/api/auth/login/bestaetigen", {
            emailAdresse, code, geraeteHash, geraeteName: geraeteName()
        });
        setzeAngemeldet(resp.token, resp.benutzer);
    }

    function ausloggen() {
        setBenutzer(null);
        setToken(null);
        localStorage.removeItem("lc_token");
        localStorage.removeItem("lc_benutzer");
    }

    function aktualisiereBenutzer(neueDaten) {
        setBenutzer((alt) => {
            const gemischt = { ...(alt || {}), ...(neueDaten || {}) };
            try { localStorage.setItem("lc_benutzer", JSON.stringify(gemischt)); } catch {}
            return gemischt;
        });
    }

    const wert = useMemo(() => ({
        benutzer, token, laden,
        registrieren, bestaetigeRegistrierung,
        starteLogin, bestaetigeLogin,
        ausloggen, aktualisiereBenutzer,
    }), [benutzer, token, laden]);

    return <AuthKontext.Provider value={wert}>{children}</AuthKontext.Provider>;
}

export function useAuth() {
    const ctx = useContext(AuthKontext);
    if (!ctx) throw new Error("useAuth muss innerhalb von <AuthProvider> genutzt werden");
    return ctx;
}

