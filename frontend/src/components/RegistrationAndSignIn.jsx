import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";

export default function RegistrationAndSignIn() {
    const [modus, setModus] = useState("login"); // "login" | "registrierung"
    const [fehler, setFehler] = useState("");
    const navigate = useNavigate();
    const { starteLogin, registrieren, laden } = useAuth();

    const [daten, setDaten] = useState({
        name: "",
        emailAdresse: "",
        passwort: "",
        passwortWiederholen: "",
    });

    function eingabeGeaendert(e) {
        const { name, value } = e.target;
        setDaten((d) => ({ ...d, [name]: value }));
    }

    async function formularAbschicken(e) {
        e.preventDefault();
        setFehler("");

        try {
            if (modus === "registrierung") {
                const name = daten.name.trim();
                const emailAdresse = daten.emailAdresse.trim();
                const passwort = daten.passwort;

                if (!name) throw new Error("Bitte gib deinen Namen ein.");
                if (passwort !== daten.passwortWiederholen)
                    throw new Error("Die Passwörter stimmen nicht überein.");

                // Schritt 1: Registrierung starten (отправляем код на почту)
                await registrieren({ name, emailAdresse, passwort });


                navigate("/verifizieren?email=" + encodeURIComponent(emailAdresse));
            } else {
                const emailAdresse = daten.emailAdresse.trim();
                const passwort = daten.passwort;


                let r;
                try {
                    r = await starteLogin(emailAdresse, passwort);
                    } catch (err) {
                    if (err.status === 403) {
                        setFehler("Deine E-Mail ist noch nicht bestätigt. Bitte gib den Code ein.");
                        navigate("/verifizieren?email=" + encodeURIComponent(emailAdresse));
                        return;
                        }
                    throw err;
                    }

                if (r?.zweiFaktor) {

                    navigate("/2fa", { state: { emailAdresse } });
                } else {

                    navigate("/");
                }
            }
            } catch (err) {
                // 🇩🇪 Nutzerfreundliche Meldungen nach Statuscode
                    if (err.status === 409) {
                        setFehler("Diese E-Mail ist bereits registriert. Bitte melde dich an oder benutze eine andere E-Mail-Adresse.");
                    } else if (err.status === 400) {
                        setFehler(err.message || "Eingabefehler. Bitte prüfe deine Angaben.");
                    } else if (err.status === 401) {
                        // Falls Security /error zuvor 401 lieferte, trotzdem eine klare Meldung zeigen
                            setFehler(err.message && err.message !== ("HTTP " + err.status) ? err.message : "Nicht autorisiert. Bitte erneut versuchen.");
                    } else {
                        setFehler(err.message || "Es ist ein Fehler aufgetreten.");
                    }
            }
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <div className="flex flex-col items-center">
                    <img src="/logo.png" alt="LocalConnect Logo" className="h-32 w-32 mb-4" />
                </div>
                <h2 className="mt-6 text-center text-2xl font-bold tracking-tight text-gray-900">
                    {modus === "login" ? "Anmelden" : "Registrieren"}
                </h2>

                {/* Umschalter */}
                <div className="mt-6 inline-flex w-full rounded-xl bg-gray-100 p-1">
                    <button
                        type="button"
                        onClick={() => setModus("login")}
                        className={`w-1/2 rounded-lg px-3 py-2 text-sm font-medium ${
                            modus === "login" ? "bg-white shadow" : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Anmelden
                    </button>
                    <button
                        type="button"
                        onClick={() => setModus("registrierung")}
                        className={`w-1/2 rounded-lg px-3 py-2 text-sm font-medium ${
                            modus === "registrierung" ? "bg-white shadow" : "text-gray-600 hover:text-gray-900"
                        }`}
                    >
                        Registrieren
                    </button>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-sm">
                <form className="space-y-5" onSubmit={formularAbschicken}>
                    {modus === "registrierung" && (
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-900">
                                Name
                            </label>
                            <div className="mt-2">
                                <input
                                    id="name"
                                    name="name"
                                    type="text"
                                    required
                                    autoComplete="name"
                                    value={daten.name}
                                    onChange={eingabeGeaendert}
                                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                    placeholder="Max Mustermann"
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label htmlFor="emailAdresse" className="block text-sm font-medium text-gray-900">
                            E-Mail-Adresse
                        </label>
                        <div className="mt-2">
                            <input
                                id="emailAdresse"
                                name="emailAdresse"
                                type="email"
                                required
                                autoComplete="email"
                                value={daten.emailAdresse}
                                onChange={eingabeGeaendert}
                                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                placeholder="du@example.com"
                            />
                        </div>
                    </div>

                    <div>
                        <div className="flex items-center justify-between">
                            <label htmlFor="passwort" className="block text-sm font-medium text-gray-900">
                                Passwort
                            </label>
                            {modus === "login" && (
                                <a href="#" className="text-sm font-semibold text-indigo-600 hover:text-indigo-500">
                                    Passwort vergessen?
                                </a>
                            )}
                        </div>
                        <div className="mt-2">
                            <input
                                id="passwort"
                                name="passwort"
                                type="password"
                                required
                                autoComplete={modus === "login" ? "current-password" : "new-password"}
                                value={daten.passwort}
                                onChange={eingabeGeaendert}
                                className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                placeholder={modus === "login" ? "Dein Passwort" : "Mind. 8 Zeichen"}
                            />
                        </div>
                    </div>

                    {modus === "registrierung" && (
                        <div>
                            <label htmlFor="passwortWiederholen" className="block text-sm font-medium text-gray-900">
                                Passwort wiederholen
                            </label>
                            <div className="mt-2">
                                <input
                                    id="passwortWiederholen"
                                    name="passwortWiederholen"
                                    type="password"
                                    required
                                    autoComplete="new-password"
                                    value={daten.passwortWiederholen}
                                    onChange={eingabeGeaendert}
                                    className="block w-full rounded-md bg-white px-3 py-2 text-base text-gray-900 outline-1 -outline-offset-1 outline-gray-300 placeholder:text-gray-400 focus:outline-2 focus:-outline-offset-2 focus:outline-indigo-600 sm:text-sm"
                                    placeholder="Passwort erneut eingeben"
                                />
                            </div>
                        </div>
                    )}

                    {fehler && (
                        <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700">
                            {fehler}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={laden}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
                    >
                        {laden ? "Bitte warten…" : modus === "login" ? "Anmelden" : "Registrieren"}
                    </button>
                </form>

                {/* Hinweis unter dem Formular */}
                <p className="mt-8 text-center text-sm text-gray-600">
                    {modus === "login" ? (
                        <>
                            Noch kein Konto?{" "}
                            <button
                                type="button"
                                onClick={() => setModus("registrierung")}
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Jetzt registrieren
                            </button>
                        </>
                    ) : (
                        <>
                            Bereits registriert?{" "}
                            <button
                                type="button"
                                onClick={() => setModus("login")}
                                className="font-semibold text-indigo-600 hover:text-indigo-500"
                            >
                                Zum Login
                            </button>
                        </>
                    )}
                </p>
            </div>
        </div>
    );
}
