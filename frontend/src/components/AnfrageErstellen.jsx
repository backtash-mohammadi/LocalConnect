// src/components/AnfrageErstellenSeite.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import { apiPost } from '../lib/apiClient';

const KATEGORIEN = [ 'Werkzeuge', 'Nachhilfe', 'Transport', 'Haushalt', 'Sonstiges' ];

export default function AnfrageErstellenSeite(){
    const { token, benutzer } = useAuth();
    const navigate = useNavigate();

    console.log("token: " + token + " user: " + benutzer.toString());

    const [form, setForm] = useState({

        beschreibung: '',
        kategorie: 'Sonstiges',
        stadt: ''
    });
    const [laden, setLaden] = useState(false);
    const [fehler, setFehler] = useState('');
    const [ok, setOk] = useState('');

    if(!benutzer){
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
                    Bitte <a href="/login" className="text-indigo-700 underline">einloggen</a>, um eine Anfrage zu erstellen.
                </div>
            </div>
        );
    }

    function change(e){
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function submit(e){
        e.preventDefault(); setFehler(''); setOk(''); setLaden(true);
        try{
            const payload = {
                userId: benutzer?.id,
                titel: form.titel.trim(),
                beschreibung: form.beschreibung.trim() || null,
                kategorie: form.kategorie,
                stadt: form.stadt.trim(),
                strasse: form.strasse.trim(),
                plz: form.plz.trim()
            };

            const created = await apiPost('/erstellen', payload, token);
            setOk('Anfrage erstellt');
            setTimeout(()=> navigate('/anzeigen'), 500);
        }catch(err){
            setFehler(err.message || 'Fehler beim Erstellen');
        }finally{
            setLaden(false);
        }
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-4 text-xl font-bold">Anfrage erstellen</h1>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 rounded-2xl border bg-white p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Titel<span className="text-red-600">*</span></label>
                        <input name="titel" value={form.titel} onChange={change} required maxLength={150}
                               className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Beschreibung</label>
                        <textarea name="beschreibung" value={form.beschreibung} onChange={change} rows={4}
                                  placeholder="Beschreibe kurz, wobei du Hilfe brauchst…"
                                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Kategorie</label>
                        <select name="kategorie" value={form.kategorie} onChange={change}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                            {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 rounded-2xl border bg-white p-4">
                    <h2 className="text-sm font-semibold text-gray-900">Adresse<span className="text-red-600">*</span></h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Stadt</label>
                            <input name="stadt" value={form.stadt} onChange={change} required
                                   className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">PLZ</label>
                            <input name="plz" value={form.plz} onChange={change} required pattern="^[0-9]{4,10}$"
                                   className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Straße & Nr.</label>
                        <input name="strasse" value={form.strasse} onChange={change} required
                               className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button disabled={laden} type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {laden ? 'Speichern…' : 'Anfrage speichern'}
                    </button>
                    {ok && <span className="text-sm text-green-700">{ok}</span>}
                    {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                </div>
            </form>
        </div>
    );
}
