import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import haushalt from "../assets/haushalt.png";
import nachhilfe from "../assets/nachhilfe.png";
import sonstiges from "../assets/sonstiges.png";
import transport from "../assets/transport.png";
import werkzeuge from "../assets/werkzeuge.png";
import AktuelleAnzeigen from "./AktuelleAnzeigen.jsx";

function AnzeigeKarte({ titel, kategorie, ort, karmaKosten }) {
    return (
        <article className="rounded-2xl border p-4 shadow-sm transition hover:shadow">
            <div className="mb-2 flex items-center justify-between">
                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{kategorie}</span>
                <span className="text-xs text-gray-500">{ort}</span>
            </div>
            <h3 className="mb-3 text-base font-semibold text-gray-900">{titel}</h3>
            <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kosten: <strong>-{karmaKosten}</strong> Karma</span>
                <button className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Details</button>
            </div>
        </article>
    );
}

export default function MainPage() {
    const { benutzer } = useAuth();

    const kategorien = [
        { name: "Werkzeuge", beschreibung: "Bohrmaschine, Leiter, Schraubenschlüssel…" },
        { name: "Nachhilfe", beschreibung: "Mathe, Deutsch, Programmieren…" },
        { name: "Transport", beschreibung: "Kleintransporte, Umzugshilfe…" },
        { name: "Haushalt", beschreibung: "Garten, Putzen, Einkaufen…" },
        { name: "Sonstiges", beschreibung: "Alles, was sonst noch hilft." },
    ];
    const categoryIconMap = { "Haushalt": haushalt, "Nachhilfe": nachhilfe, "Sonstiges": sonstiges, "Transport": transport, "Werkzeuge": werkzeuge, };

    const beispielAnzeigen = [
        { titel: "Brauche Bohrmaschine für 2h", kategorie: "Werkzeuge", ort: "Linden-Mitte", karmaKosten: 1 },
        { titel: "Biete Mathe-Nachhilfe (Kl. 5–8)", kategorie: "Nachhilfe", ort: "Nordstadt", karmaKosten: -1 },
        { titel: "Hilfe beim Umzug am Samstag", kategorie: "Transport", ort: "Calenberger Neustadt", karmaKosten: 1 },
    ];

    return (
        <main className="mx-auto max-w-6xl px-4">
            {/* Willkommen-Hinweis */}
            {benutzer && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Willkommen, <strong>{benutzer.name}</strong>! Du bist eingeloggt. Dein aktuelles Karma: <strong>{benutzer.karma}</strong>.
                </div>
            )}

            {/* Hero */}
            <section className="my-8 grid gap-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-blue-50 p-6 md:grid-cols-2">
                <div>
                    <h1 className="mb-3 text-2xl font-bold text-gray-900">Nachbarschaftshilfe, fair & einfach</h1>
                    <p className="mb-5 text-sm text-gray-700">
                        Frage nach Hilfe oder biete sie an. Sammle Karma, wenn du hilfst, und
                        nutze Karma, wenn dir geholfen wird. Transparent, lokal, community-getrieben.
                    </p>
                    <div className="flex flex-wrap gap-3">
                        <Link to="/anzeigen" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Anfragen ansehen</Link>

                        {!benutzer && (
                            <Link to="/login" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Registrieren</Link>
                        )}
                        {benutzer && (
                            <>
                            <Link to="/erstellen" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Anfrage erstellen</Link>
                            <Link to="/meine-anfragen" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Meine Anfragen</Link>
                            </>
                        )}
                    </div>
                </div>
                <ul className="grid gap-3">
                    {kategorien.map((kat) => (
                        <li key={kat.name} className="flex items-start gap-3 rounded-xl border bg-white p-3">
                            <img src={categoryIconMap[kat.name]} alt={kat.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />

                            {/*<div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-100" />*/}
                            <div>
                                <div className="text-sm font-semibold">{kat.name}</div>
                                <div className="text-xs text-gray-600">{kat.beschreibung}</div>
                            </div>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Anzeigenliste (Demo) */}
            <section className="my-8">

                <AktuelleAnzeigen />
            </section>
        </main>
    );
}