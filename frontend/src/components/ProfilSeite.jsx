import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPut } from "../lib/apiClient";

export default function ProfilSeite(){
    const { token, benutzer, aktualisiereBenutzer } = useAuth();
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    const [ok, setOk] = useState("");

    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        fotoUrl: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });

    useEffect(()=>{
        let alive = true;
        setLaden(true);
        apiGet("/api/benutzer/me", token)
            .then((data)=>{ if(!alive) return; setForm({
                name: data.name || "",
                emailAdresse: data.emailAdresse || "",
                fotoUrl: data.fotoUrl || "",
                faehigkeiten: data.faehigkeiten || "",
                karma: data.karma || 0,
                erstelltAm: data.erstelltAm || "",
            }); })
            .catch((e)=>{ if(!alive) return; setFehler(e.message || "Fehler beim Laden"); })
            .finally(()=>{ if(!alive) return; setLaden(false); });
        return ()=>{ alive=false; };
    },[token]);

    function change(e){ const {name, value} = e.target; setForm((f)=>({...f,[name]: value})); }

    async function speichern(e){
        e.preventDefault(); setFehler(""); setOk("");
        try{
            const payload = { name: form.name.trim(), fotoUrl: form.fotoUrl.trim() || null, faehigkeiten: form.faehigkeiten.trim() || null };
            const updated = await apiPut("/api/benutzer/me", payload, token);
            setOk("Profil gespeichert");
            // Context/Badge sofort aktualisieren (Name/Karma/Foto)
            aktualisiereBenutzer({ ...(benutzer||{}), name: updated.name, emailAdresse: updated.emailAdresse, karma: updated.karma, fotoUrl: updated.fotoUrl });
        }catch(err){ setFehler(err.message || "Fehler beim Speichern"); }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-4 text-xl font-bold">Profil</h1>

            {laden ? (
                <div className="rounded-xl border bg-white p-4 text-sm text-gray-600">Laden…</div>
            ) : (
                <form onSubmit={speichern} className="space-y-5">
                    <div className="grid gap-4 rounded-2xl border bg-white p-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Name</label>
                            <input name="name" value={form.name} onChange={change} required className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">E‑Mail</label>
                            <input value={form.emailAdresse} readOnly className="mt-1 w-full cursor-not-allowed rounded-lg border bg-gray-50 px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Foto‑URL (optional)</label>
                            <input name="fotoUrl" value={form.fotoUrl} onChange={change} placeholder="https://…" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Fähigkeiten (kommasepariert)</label>
                            <textarea name="faehigkeiten" value={form.faehigkeiten} onChange={change} rows={3} placeholder="kann Fahrrad reparieren, hat Werkzeug" className="mt-1 w-full rounded-lg border px-3 py-2 text-sm" />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button type="submit" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Speichern</button>
                        {ok && <span className="text-sm text-green-700">{ok}</span>}
                        {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                    </div>

                    <div className="mt-6 grid gap-3 text-sm text-gray-600">
                        <div>Aktuelles Karma: <strong>{form.karma}</strong></div>
                        {form.erstelltAm && (<div>Konto erstellt am: <time dateTime={form.erstelltAm}>{new Date(form.erstelltAm).toLocaleString()}</time></div>)}
                    </div>
                </form>
            )}
        </div>
    );
}