export default function UeberUnsSeite() {
    const team = [
        { name: "Gabriele", rolle: "Full Stack, Data", beschreibung: "Springt flexibel zwischen Frontend & Backend." },
        { name: "Volodymyr", rolle: "Full Stack, Infrastruktur", beschreibung: "Mag saubere APIs und nachvollziehbare Logs." },
        { name: "Backtash", rolle: "Full Stack, Support", beschreibung: "Baut schnelle, barrierearme Oberflächen." },
    ];

    const werte = [
        { titel: "Einfachheit", text: "Nur das Nötige – klar, schnell, ohne Schnickschnack." },
        { titel: "Sicherheit", text: "Respekt vor Daten, transparente Entscheidungen, DSGVO-konform." },
        { titel: "Nachbarschaft", text: "Menschen verbinden, Hürden abbauen, fair bleiben." },
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-8">
            {/* Kopfbereich */}
            <header className="mb-8 rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">Über uns</h1>
                <p className="mt-2 text-gray-600">
                    LocalConnect ist eine kleine, leidenschaftliche Initiative: Wir helfen Nachbar:innen,
                    einander schneller zu finden – für Hilfe, Wissen und Werkzeuge.
                </p>
            </header>

            {/* Mission */}
            <section className="mb-10">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">Unsere Mission</h2>
                <p className="text-gray-700">
                    Zeit sparen, Vertrauen stärken, lokales Miteinander fördern. Wir glauben,
                    dass gute Tools nicht stören, sondern still unterstützen.
                </p>
            </section>

            {/* Werte */}
            <section className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Unsere Werte</h2>
                <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {werte.map((w) => (
                        <li key={w.titel} className="rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-4 shadow-sm">
                            <div className="text-base font-medium text-gray-900">{w.titel}</div>
                            <p className="mt-1 text-sm text-gray-600">{w.text}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Team (Platzhalter) */}
            <section className="mb-10">
                <h2 className="mb-4 text-xl font-semibold text-gray-800">Team</h2>
                <ul className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
                    {team.map((m) => (
                        <li key={m.name} className="rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-4 shadow-sm">
                            <div className="mb-1 text-base font-medium text-gray-900">{m.name}</div>
                            <div className="text-sm text-indigo-700">{m.rolle}</div>
                            <p className="mt-1 text-sm text-gray-600">{m.beschreibung}</p>
                        </li>
                    ))}
                </ul>
            </section>

            {/* Wie es funktioniert */}
            <section className="mb-10">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">Wie funktioniert LocalConnect?</h2>
                <ol className="list-decimal space-y-2 pl-6 text-gray-700">
                    <li>Registrieren.</li>
                    <li>Anfrage erstellen oder auf vorhandene Gesuche reagieren.</li>
                    <li>Direkt austauschen, Termine finden, fair bleiben.</li>
                </ol>
            </section>

            {/* Kontakt-CTA */}
            <section className="rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                <h2 className="text-xl font-semibold text-gray-800">Fragen oder Feedback?</h2>
                <p className="mt-1 text-gray-700">
                    Schreib uns gerne – wir antworten so schnell wie möglich.
                </p>
                <a href="/kontakt" className="mt-3 inline-block rounded-xl border px-4 py-2 text-sm hover:bg-gray-50">
                    Zur Kontaktseite
                </a>
            </section>
        </div>
    );
}
