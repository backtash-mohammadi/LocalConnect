// Einfache Bestätigungs-Modal – keine Portals, bewusst simpel gehalten
export default function BestaetigungModal({ offen, titel, text, bestaetigenText="Ja", abbrechenText="Abbrechen", onBestaetigen, onAbbrechen }) {
    if (!offen) return null;
    return (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/30 p-4">
            <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
                <h3 className="mb-3 text-lg font-semibold">{titel}</h3>
                <p className="mb-6 text-sm text-gray-700">{text}</p>
                <div className="flex justify-end gap-3">
                    <button onClick={onAbbrechen} className="rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50">
                        {abbrechenText}
                    </button>
                    <button onClick={onBestaetigen} className="rounded-xl border border-red-200 bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700">
                        {bestaetigenText}
                    </button>
                </div>
            </div>
        </div>
    );
}
