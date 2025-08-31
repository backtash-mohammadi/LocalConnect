export default function Footer() {
    const aktuellesJahr = new Date().getFullYear();

    return (
        <footer className=" rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60">
            <div className="mx-auto grid max-w-6xl items-center gap-4 px-4 py-2 md:grid-cols-3">
                <div>
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="LocalConnect Logo" className="h-6 w-6" />
                        <h3 className="text-base font-semibold text-indigo-700">LocalConnect</h3>
                    </div>
                    <p className="mt-1 text-xs text-gray-600">
                        Nachbarschaftshilfe mit fairem Karma-System. Teile Zeit, Wissen und
                        Werkzeuge in deiner Community.
                    </p>
                </div>

                <div className="md:col-start-3 md:justify-self-end md:text-right">
                    <ul className="flex flex-wrap justify-end gap-x-4 gap-y-1 text-xs text-gray-700">
                        <li><a className="hover:text-indigo-700" href="#">Über uns</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Kontakt</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Datenschutz</a></li>
                        <li><a className="hover:text-indigo-700" href="#">Impressum</a></li>
                    </ul>
                </div>
            </div>

            <div className="border-t py-2">
                <p className="mx-auto max-w-6xl px-4 text-[11px] text-gray-500">
                    © {aktuellesJahr} LocalConnect. Backtash, Volodymyr & Gabrielle.
                </p>
            </div>
        </footer>
    );
}
