// src/components/AnfrageBearbeitenSeite.jsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import { apiGet } from '../lib/apiClient';
import { apiPut } from '../lib/apiClient';

const KATEGORIEN = [ 'Werkzeuge', 'Nachhilfe', 'Transport', 'Haushalt', 'Sonstiges' ];

export default function AnfrageBearbeitenSeite(){
    // Zustände und Router-Parameter
    const { token, benutzer } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();

    const [form, setForm] = useState({
        titel: '',
        beschreibung: '',
        kategorie: 'Sonstiges',
        stadt: '',
        strasse: '',
        plz: ''
    });
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState('');
    const [ok, setOk] = useState('');

    // Anfrage laden (zum Vorbefüllen)
    async function ladeAnfrage(){
        setFehler(''); setLaden(true);
        try{
            const daten = await apiGet(`/anfrage/${id}`, token);
            setForm({
                titel: daten.titel ?? daten.title ?? '',
                beschreibung: daten.beschreibung ?? daten.description ?? '',
                kategorie: daten.kategorie ?? daten.category ?? 'Sonstiges',
                stadt: daten.stadt ?? daten.city ?? '',
                strasse: daten.strasse ?? daten.street ?? '',
                plz: daten.plz ?? daten.postal_code ?? ''
            });
        }catch(err){
            setFehler(err.message || 'Fehler beim Laden');
        }finally{
            setLaden(false);
        }
    }

    useEffect(() => { if(benutzer){ ladeAnfrage(); } }, [benutzer, id]);

    function aenderung(e){
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    }

    async function speichern(e){
        e.preventDefault(); setFehler(''); setOk(''); setLaden(true);
        try{
            const payload = {
                titel: form.titel.trim(),
                beschreibung: form.beschreibung.trim(),
                kategorie: form.kategorie,
                stadt: form.stadt.trim(),
                strasse: form.strasse.trim(),
                plz: form.plz.trim()
            };
            await apiPut(`/anfrage/${id}/bearbeiten`, payload, token);
            setOk('Anfrage aktualisiert');
            navigate('/meine-anfragen');
        }catch(err){
            setFehler(err.message || 'Fehler beim Speichern');
        }finally{
            setLaden(false);
        }
    }

    function verwerfen(){
        navigate('/meine-anfragen');
    }

    if(!benutzer){
        return (
            <div className="mx-auto max-w-3xl px-4 py-8">
                <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
                    Bitte <a href="/login" className="text-indigo-700 underline">einloggen</a>, um Anfragen zu bearbeiten.
                </div>
            </div>
        );
    }

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <h1 className="mb-4 text-xl font-bold">Anfrage bearbeiten</h1>

            <form onSubmit={speichern} className="space-y-5">
                <div className="grid gap-4 rounded-2xl border bg-white p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Titel<span className="text-red-600">*</span></label>
                        <input name="titel" value={form.titel} onChange={aenderung} required maxLength={150}
                               className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Beschreibung</label>
                        <textarea name="beschreibung" value={form.beschreibung} onChange={aenderung} rows={4}
                                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Kategorie</label>
                        <select name="kategorie" value={form.kategorie} onChange={aenderung}
                                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600">
                            {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 rounded-2xl border bg-white p-4">
                    <h2 className="text-sm font-semibold text-gray-900">Adresse</h2>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Stadt</label>
                            <input name="stadt" value={form.stadt} onChange={aenderung}
                                   className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">PLZ</label>
                            <input name="plz" value={form.plz} onChange={aenderung} pattern="^[0-9]{4,10}$"
                                   className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Straße & Nr.</label>
                        <input name="strasse" value={form.strasse} onChange={aenderung}
                               className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600" />
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button type="button" onClick={verwerfen}
                            className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100">
                        Änderungen verwerfen
                    </button>
                    <button disabled={laden} type="submit"
                            className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60">
                        {laden ? 'Speichere…' : 'Änderungen speichern'}
                    </button>
                    {ok && <span className="text-sm text-green-700">{ok}</span>}
                    {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                </div>
            </form>
        </div>
    );



}