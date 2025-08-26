export default function Footer() {
    const aktuellesJahr = new Date().getFullYear();


    return (
        <footer className="mt-12 border-t bg-white">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-3">
                <div>
                    <div className="mb-2 flex items-center gap-2">
                        <span className="h-8 w-8 rounded-2xl bg-indigo-600 text-white grid place-items-center font-bold">LC</span>
                        <span className="text-base font-semibold">LocalConnect</span>
                    </div>
                    <p className="text-sm text-gray-600">
                        Nachbarschaftshilfe mit fairem Karma-System. Teile Zeit, Wissen und
                        Werkzeuge in deiner Community.
                    </p>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Links</h3>
                    <ul className="space-y-1 text-sm text-gray-700">
                        <li><a className="hover:text-indigo-700" href="#">Über uns</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Kontakt</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Datenschutz</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Impressum</a></li>
                    </ul>
                </div>
                <div>
                    <h3 className="mb-2 text-sm font-semibold text-gray-900">Newsletter</h3>
                    <form className="flex gap-2" onSubmit={(e) => e.preventDefault()}>
                        <input
                            className="w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
                            type="email"
                            name="emailAdresse"
                            placeholder="E-Mail eingeben"
                        />
                        <button className="rounded-xl bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700">
                            Abonnieren
                        </button>
                    </form>
                </div>
            </div>
            <div className="border-t py-4">
                <p className="mx-auto max-w-6xl px-4 text-xs text-gray-500">
                    © {aktuellesJahr} LocalConnect. Alle Rechte vorbehalten.
                </p>
            </div>
        </footer>
    );
}