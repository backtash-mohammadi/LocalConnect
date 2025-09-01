
import { useState } from "react";

/**
 * Freundliche Hilfeseite mit Schnellstart und Mini-Vorschauen.
 * Alle Variablennamen, Kommentare und Klassen sind auf Deutsch.
 */
export default function HilfeSeite() {
    // Zustand für das einfache Lightbox/Modal
    const [ausgewaehltesBild, setAusgewaehltesBild] = useState(null);
    const [bildTitel, setBildTitel] = useState("");

    const bilder = [
        {
            schluessel: "registrieren",
            titel: "Registrieren",
            beschreibung: "Erstelle in wenigen Sekunden ein Konto.",
            vorschau: "/hilfe/Registrieren.JPG",
            voll: "/hilfe/Registrieren.JPG",
        },
        {
            schluessel: "login",
            titel: "Anmelden",
            beschreibung: "Melde dich an, um Nachrichten zu senden und Kommentare zu schreiben.",
            vorschau: "/hilfe/Login.JPG",
            voll: "/hilfe/Login.JPG",
        },
        {
            schluessel: "anfrage",
            titel: "Anfrage erstellen",
            beschreibung: "Titel, Beschreibung und Adresse angeben – fertig!",
            vorschau: "/hilfe/AnfrageErstellen.JPG",
            voll: "/hilfe/AnfrageErstellen.JPG",
        },
        {
            schluessel: "karte",
            titel: "Karte nutzen",
            beschreibung: "Adresse suchen oder „Meinen Ort verwenden“ tippen.",
            vorschau: "/hilfe/Karte.JPG",
            voll: "/hilfe/Karte.JPG",
        },
    ];

    function oeffneBild(bildPfad, titel) {
        setAusgewaehltesBild(bildPfad);
        setBildTitel(titel);
    }

    function schliesseBild() {
        setAusgewaehltesBild(null);
        setBildTitel("");
    }

    return (
        <div className="mx-auto max-w-6xl px-4 py-8">
            {/* Kopfbereich */}
            <header className="mb-8 rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">Hilfe &amp; Schnellstart</h1>
                <p className="mt-2 text-gray-600">
                    Schön, dass du hier bist! Diese Seite erklärt dir die wichtigsten Schritte – kurz, freundlich und mit kleinen
                    Bildern aus der App. Wenn etwas unklar ist, sag uns einfach Bescheid. 💜
                </p>
            </header>

            {/* Schnellstart mit Mini-Bildern */}
            <section aria-labelledby="schnellstart-ueberschrift" className="mb-12">
                <h2 id="schnellstart-ueberschrift" className="mb-4 text-2xl font-semibold text-gray-800">
                    Schnellstart (3–4 Schritte)
                </h2>

                <ol className="grid grid-cols-1 gap-6 md:grid-cols-2 ">
                    {bilder.map((b, idx) => (
                        <li key={b.schluessel} className="rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-4 shadow-sm transition hover:shadow-md">
                            <div className="flex items-start gap-4">
                                {/* Miniaturbild (klickbar) */}
                                <button
                                    type="button"
                                    onClick={() => oeffneBild(b.voll, b.titel)}
                                    className="group block cursor-pointer shrink-0 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-400"
                                    aria-label={`${b.titel} – Bild öffnen`}
                                    title="Bild vergrößern"
                                >
                                    <img
                                        src={b.vorschau}
                                        alt={b.titel}
                                        className="h-24 w-40 rounded-xl object-cover transition group-hover:opacity-90"
                                        loading="lazy"
                                    />
                                </button>

                                {/* Textbeschreibung */}
                                <div>
                                    <div className="mb-1 flex items-center gap-2">
                                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-indigo-100 text-sm font-semibold text-indigo-700">
                                            {idx + 1}
                                        </span>
                                        <h3 className="text-lg font-medium text-gray-800">{b.titel}</h3>
                                    </div>
                                    <p className="text-gray-600">{b.beschreibung}</p>
                                </div>
                            </div>
                        </li>
                    ))}
                </ol>

                <p className="mt-4 text-sm text-gray-500">
                    Tipp: Die kleinen Bilder lassen sich anklicken, um sie größer anzusehen.
                </p>
            </section>

            {/* Häufige Fragen */}
            <section aria-labelledby="faq-ueberschrift" className="mb-12">
                <h2 id="faq-ueberschrift" className="mb-4 text-2xl font-semibold text-gray-800">Häufige Fragen (FAQ)</h2>

                <div className="space-y-4">
                    <details className="rounded-xl border bg-white p-4">
                        <summary className="cursor-pointer select-none text-lg font-medium text-gray-800">
                            Warum sehe ich das Kommentarfeld nicht?
                        </summary>
                        <p className="mt-2 text-gray-600">
                            Kommentare lesen kann jeder. Um selbst zu schreiben, musst du eingeloggt sein. Melde dich an oder registriere dich – dann erscheint das Kommentarfeld.
                        </p>
                    </details>

                    <details className="rounded-xl border bg-white p-4">
                        <summary className="cursor-pointer select-none text-lg font-medium text-gray-800">
                            Wie finde ich meine Adresse auf der Karte?
                        </summary>
                        <p className="mt-2 text-gray-600">
                            Nutze oben die Suche oder klicke auf <em>„Meinen Ort verwenden“</em>. Du kannst den Marker auch direkt auf der Karte verschieben.
                        </p>
                    </details>

                    <details className="rounded-xl border bg-white p-4">
                        <summary className="cursor-pointer select-none text-lg font-medium text-gray-800">
                            Ich habe eine Frage – wie erreiche ich euch?
                        </summary>
                        <p className="mt-2 text-gray-600">
                            Schreib uns einfach über das Kontaktformular oder per E‑Mail. Wir helfen gerne und antworten so schnell wie möglich.
                        </p>
                    </details>
                </div>
            </section>

            {/* Kontakt / Feedback */}
            <section aria-labelledby="kontakt-ueberschrift" className="mb-16">
                <h2 id="kontakt-ueberschrift" className="mb-4 text-2xl font-semibold text-gray-800">Kontakt &amp; Feedback</h2>
                <p className="text-gray-600">
                    Dein Feedback macht die Plattform besser. Wenn du Ideen, Wünsche oder Probleme hast, schreib uns – wir freuen uns drauf!
                </p>
            </section>

            {/* Einfaches Bild-Modal */}
            {ausgewaehltesBild && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    role="dialog"
                    aria-label={bildTitel}
                    onClick={schliesseBild}
                >
                    <div
                        className="max-h-[90vh] max-w-5xl overflow-hidden rounded-2xl bg-white p-2 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="mb-2 flex items-center justify-between gap-4 px-2">
                            <h4 className="truncate text-base font-medium text-gray-800">{bildTitel}</h4>
                            <button
                                onClick={schliesseBild}
                                className="rounded-lg cursor-pointer border px-3 py-1 text-sm font-medium hover:bg-gray-50"
                                aria-label="Schließen"
                            >
                                Schließen
                            </button>
                        </div>
                        <img
                            src={ausgewaehltesBild}
                            alt={bildTitel}
                            className="max-h-[78vh] w-full rounded-xl object-contain"
                        />
                    </div>
                </div>
            )}
        </div>
    );
}
