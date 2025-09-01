
/**
 * DatenschutzSeite – freundliche, leicht verständliche Datenschutzerklärung.
 * ⚠️ Kein Rechtsrat. Bitte an euer Projekt/Unternehmen anpassen.
 * Variablen, Kommentare und Klassen sind auf Deutsch.
 */
export default function DatenschutzSeite() {
    return (
        <div className="mx-auto max-w-4xl px-4 py-8">
            <header className="mb-8 rounded-2xl border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-6 shadow-sm">
                <h1 className="text-3xl font-semibold text-gray-800">Datenschutzerklärung</h1>
                <p className="mt-2 text-gray-600">
                    Der Schutz deiner Daten ist uns wichtig. Auf dieser Seite erklären wir kurz und verständlich,
                    welche Daten wir verarbeiten, zu welchen Zwecken und welche Rechte du hast.
                </p>
            </header>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">1. Verantwortlicher</h2>
                <p className="text-gray-700">
                    Verantwortlich für die Datenverarbeitung ist das Team von <strong>LocalConnect</strong>.
                    Kontakt: <a className="underline" href="/kontakt">Kontaktseite</a>
                    {/* Alternativ E-Mail angeben, falls vorhanden */}
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">2. Welche Daten verarbeiten wir?</h2>
                <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Registrierungsdaten (z.&nbsp;B. Name, E-Mail-Adresse)</li>
                    <li>Nutzungsdaten (z.&nbsp;B. erstellte Anfragen, Kommentare, Privatnachrichten)</li>
                    <li>Technische Daten (z.&nbsp;B. IP-Adresse, Browser-Informationen, Logfiles)</li>
                    <li>Standortbezogene Angaben, sofern du diese bewusst angibst (Adresse/Marker auf der Karte)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">3. Zwecke &amp; Rechtsgrundlagen</h2>
                <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Bereitstellung der Plattform-Funktionen (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b DSGVO)</li>
                    <li>Verbesserung der Stabilität und Sicherheit (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;f DSGVO)</li>
                    <li>Kommunikation (z.&nbsp;B. Bestätigungs-E-Mails, Support) (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;b/f DSGVO)</li>
                    <li>Erfüllung rechtlicher Pflichten (Art.&nbsp;6 Abs.&nbsp;1 lit.&nbsp;c DSGVO)</li>
                </ul>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">4. Cookies &amp; ähnliche Technologien</h2>
                <p className="text-gray-700">
                    Wir verwenden technisch notwendige Cookies (z.&nbsp;B. zur Anmeldung und Session-Verwaltung).
                    Ohne diese funktioniert die Plattform nicht zuverlässig. Tracking-Cookies werden nicht eingesetzt,
                    sofern dies nicht ausdrücklich erwähnt und von dir akzeptiert wurde.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">5. Empfänger &amp; Drittlandübermittlung</h2>
                <p className="text-gray-700">
                    Eine Weitergabe an Dritte erfolgt nur, wenn dies zur Bereitstellung der Funktionen erforderlich ist
                    (z.&nbsp;B. Hosting-Provider) oder eine gesetzliche Pflicht besteht. Eine Übermittlung in Drittländer
                    findet nur statt, wenn geeignete Garantien im Sinne der DSGVO bestehen.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">6. Speicherdauer</h2>
                <p className="text-gray-700">
                    Wir speichern personenbezogene Daten nur so lange, wie es für den jeweiligen Zweck erforderlich ist.
                    Gesetzliche Aufbewahrungspflichten bleiben unberührt.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">7. Deine Rechte</h2>
                <ul className="list-disc space-y-1 pl-6 text-gray-700">
                    <li>Auskunft (Art.&nbsp;15 DSGVO)</li>
                    <li>Berichtigung (Art.&nbsp;16 DSGVO)</li>
                    <li>Löschung (Art.&nbsp;17 DSGVO)</li>
                    <li>Einschränkung der Verarbeitung (Art.&nbsp;18 DSGVO)</li>
                    <li>Datenübertragbarkeit (Art.&nbsp;20 DSGVO)</li>
                    <li>Widerspruch (Art.&nbsp;21 DSGVO)</li>
                </ul>
                <p className="mt-2 text-gray-700">
                    Wende dich zur Ausübung deiner Rechte bitte über die <a className="underline" href="/kontakt">Kontaktseite</a> an uns.
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">8. Sicherheit</h2>
                <p className="text-gray-700">
                    Wir treffen angemessene technische und organisatorische Maßnahmen, um deine Daten zu schützen
                    (z.&nbsp;B. Zugriffsbeschränkungen, regelmäßige Updates).
                </p>
            </section>

            <section className="mb-8">
                <h2 className="mb-2 text-xl font-semibold text-gray-800">9. Änderungen</h2>
                <p className="text-gray-700">
                    Diese Erklärung kann sich gelegentlich ändern, um neue Funktionen oder rechtliche Anforderungen
                    abzubilden. Die aktuelle Version findest du stets auf dieser Seite.
                </p>
            </section>

            <footer className="mt-10 text-xs text-gray-500">
                Hinweis: Diese Vorlage dient als Orientierung und ersetzt keine rechtliche Beratung.
            </footer>
        </div>
    );
}
