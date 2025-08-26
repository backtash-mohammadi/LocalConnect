// File: src/RegistrationAndSignIn.jsx
import { useState } from "react";

export default function RegistrationAndSignIn() {
    const [modus, setModus] = useState("login"); // "login" | "registrierung"
    const [fehler, setFehler] = useState("");
    const [lade, setLade] = useState(false);

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

        if (modus === "registrierung") {
            if (!daten.name.trim()) {
                setFehler("Bitte gib deinen Namen ein.");
                return;
            }
            if (daten.passwort !== daten.passwortWiederholen) {
                setFehler("Die Passwörter stimmen nicht überein.");
                return;
            }
        }

        try {
            setLade(true);
            // TODO: Hier später die Spring-Boot-API anbinden.
            // Endpunkte (Beispiel):
            // POST /api/auth/login  { email, password }
            // POST /api/auth/register { name, email, password }
            if (modus === "login") {
                console.log("Login mit:", {
                    email: daten.emailAdresse,
                    passwort: daten.passwort,
                });
            } else {
                console.log("Registrierung mit:", {
                    name: daten.name,
                    email: daten.emailAdresse,
                    passwort: daten.passwort,
                });
            }
            // Simuliertes Ergebnis
            await new Promise((r) => setTimeout(r, 500));
            alert(modus === "login" ? "Erfolgreich angemeldet (Demo)" : "Registrierung erfolgreich (Demo)");
        } catch (err) {
            setFehler("Es ist ein Fehler aufgetreten. Versuche es erneut.");
        } finally {
            setLade(false);
        }
    }

    return (
        <div className="flex min-h-full flex-col justify-center px-6 py-12 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-sm">
                <img
                    alt="LocalConnect"
                    src="https://tailwindcss.com/plus-assets/img/logos/mark.svg?color=indigo&shade=600"
                    className="mx-auto h-10 w-auto"
                />
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
                            E‑Mail‑Adresse
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
                        disabled={lade}
                        className="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-indigo-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-60"
                    >
                        {lade ? "Bitte warten…" : modus === "login" ? "Anmelden" : "Registrieren"}
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
