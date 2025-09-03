// src/components/AnfrageErstellenSeite.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import { apiPost } from '../lib/apiClient';

const KATEGORIEN = [ 'Werkzeuge', 'Nachhilfe', 'Transport', 'Haushalt', 'Sonstiges' ];

// Basis-URL für Geocoding über euren Backend-Proxy
const GEOCODE_ENDPOINT = '/api/geocode/search';

export default function AnfrageErstellenSeite(){
    const { token, benutzer } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        titel: '',
        beschreibung: '',
        kategorie: 'Sonstiges',
        stadt: '',
        strasse: '',
        plz: ''
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

    // --- Neu: Adresse → Koordinaten via Backend-Proxy (Nominatim) ---
    async function geocodeAdresse({ strasse, plz, stadt }){
        // Freundliche, robuste Abfrage (Straße, PLZ, Stadt)
        const query = [strasse, plz, stadt].filter(Boolean).join(' ');
        if(!query.trim()) throw new Error('Adresse unvollständig.');

        const url = `${GEOCODE_ENDPOINT}?q=${encodeURIComponent(query)}&limit=1`;
        const res = await fetch(url, { headers: { 'Accept': 'application/json' } });

        if(!res.ok){
            // Hinweis: Wenn ihr KEINEN Proxy nutzt, ist hier oft CORS / 403 die Ursache
            throw new Error('Geokodierung fehlgeschlagen (Server).');
        }

        const arr = await res.json();
        const hit = Array.isArray(arr) && arr[0];
        if(!hit) throw new Error('Adresse nicht gefunden. Bitte prüfen.');

        const lat = Number(hit.lat);
        const lon = Number(hit.lon);
        if(!Number.isFinite(lat) || !Number.isFinite(lon)){
            throw new Error('Ungültige Koordinaten erhalten.');
        }
        return { lat, lon };
    }

    async function submit(e){
        e.preventDefault(); setFehler(''); setOk(''); setLaden(true);
        try{
            // 1) Koordinaten ermitteln (vor dem Speichern)
            const { lat, lon } = await geocodeAdresse({
                strasse: form.strasse.trim(),
                plz: form.plz.trim(),
                stadt: form.stadt.trim()
            });

            // 2) Payload inkl. Koordinaten anlegen
            const payload = {
                userId: benutzer?.id,
                titel: form.titel.trim(),
                beschreibung: form.beschreibung.trim() || null,
                kategorie: form.kategorie,
                stadt: form.stadt.trim(),
                strasse: form.strasse.trim(),
                plz: form.plz.trim(),
                lat,    // 29.08 latitude
                lon     // 29.08 longitude
            };

            // 3) Speichern
            await apiPost('/erstellen', payload, token);
            setOk('Anfrage erstellt');
            setTimeout(()=> navigate('/anzeigen'), 600);
        }catch(err){
            setFehler(err.message || 'Fehler beim Erstellen');
        }finally{
            setLaden(false);
        }
    }

    return (
       <div className="mt-4 mx-auto max-w-3xl px-4 py-8 rounded-2xl bg-gradient-to-br from-sky-30 via-blue-200 to-sky-100 shadow-sm ring-1 ring-sky-100/60">
            <h1 className="mb-4 text-3xl font-thin">Anfrage erstellen</h1>

            <form onSubmit={submit} className="space-y-5">
                <div className="grid gap-4 rounded-2xl rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60 p-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-900">
                            Titel<span className="text-red-600">*</span>
                        </label>
                        <input
                            name="titel"
                            value={form.titel}
                            onChange={change}
                            required
                            maxLength={150}
                            className="mt-1 w-full  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900 ">Beschreibung</label>
                        <textarea
                            name="beschreibung"
                            value={form.beschreibung}
                            onChange={change}
                            rows={4}
                            placeholder="Beschreibe kurz, wobei du Hilfe brauchst…"
                            className="mt-1 w-full  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Kategorie</label>
                        <select
                            name="kategorie"
                            value={form.kategorie}
                            onChange={change}
                            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600  rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                        >
                            {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
                        </select>
                    </div>
                </div>

                <div className="grid gap-4 rounded-2xl border bg-white p-4  rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60">
                    <h2 className="text-sm font-semibold text-gray-900">
                        Adresse<span className="text-red-600">*</span>
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-2 ">
                        <div>
                            <label className="block text-sm font-medium text-gray-900">Stadt</label>
                            <input
                                name="stadt"
                                value={form.stadt}
                                onChange={change}
                                required
                                className="mt-1 w-full  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600  rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-900">PLZ</label>
                            <input
                                name="plz"
                                value={form.plz}
                                onChange={change}
                                required
                                pattern="^[0-9]{4,10}$"
                                className="mt-1 w-full  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600  rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-900">Straße & Nr.</label>
                        <input
                            name="strasse"
                            value={form.strasse}
                            onChange={change}
                            required
                            className="mt-1 w-full  px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600  rounded-xl border border-sky-600 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                        />
                    </div>
                    <p className="text-xs text-gray-600">
                        Hinweis: Beim Speichern wird die Adresse in Koordinaten umgewandelt.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <button
                        disabled={laden}
                        type="submit"
                        className="rounded-xl cursor-pointer bg-indigo-600 px-4 py-2 text-sha-md font-thin text-white hover:bg-indigo-700 disabled:opacity-60"
                    >
                        {laden ? 'Adresse wird ermittelt…' : 'Anfrage speichern'}
                    </button>
                    {ok && <span className="text-sm text-green-700">{ok}</span>}
                    {fehler && <span className="text-sm text-red-700">{fehler}</span>}
                </div>
            </form>
        </div>
    );
}



// // src/components/AnfrageErstellenSeite.jsx
// import { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { useAuth } from '../context/AuthKontext';
// import { apiPost } from '../lib/apiClient';
//
// const KATEGORIEN = [ 'Werkzeuge', 'Nachhilfe', 'Transport', 'Haushalt', 'Sonstiges' ];
//
// export default function AnfrageErstellenSeite(){
//     const { token, benutzer } = useAuth();
//     const navigate = useNavigate();
//
//     // console.log("token: " + token + " user: " + benutzer.toString());
//
//     const [form, setForm] = useState({
//         titel: '',
//         beschreibung: '',
//         kategorie: 'Sonstiges',
//         stadt: '',
//         strasse: '',
//         plz: ''
//     });
//     const [laden, setLaden] = useState(false);
//     const [fehler, setFehler] = useState('');
//     const [ok, setOk] = useState('');
//
//     if(!benutzer){
//         return (
//             <div className="mx-auto max-w-3xl px-4 py-8">
//                 <div className="rounded-2xl border bg-white p-4 text-sm text-gray-700">
//                     Bitte <a href="/login" className="text-indigo-700 underline">einloggen</a>, um eine Anfrage zu erstellen.
//                 </div>
//             </div>
//         );
//     }
//
//     function change(e){
//         const { name, value } = e.target;
//         setForm(f => ({ ...f, [name]: value }));
//     }
//
//     async function submit(e){
//         e.preventDefault(); setFehler(''); setOk(''); setLaden(true);
//         try{
//
//             const payload = {
//                 userId: benutzer?.id,
//                 titel: form.titel.trim(),
//                 beschreibung: form.beschreibung.trim() || null,
//                 kategorie: form.kategorie,
//                 stadt: form.stadt.trim(),
//                 strasse: form.strasse.trim(),
//                 plz: form.plz.trim()
//             };
//
//             const created = await apiPost('/erstellen', payload, token);
//             setOk('Anfrage erstellt');
//             setTimeout(()=> navigate('/anzeigen'), 500);
//         }catch(err){
//             setFehler(err.message || 'Fehler beim Erstellen');
//         }finally{
//             setLaden(false);
//         }
//     }
//
//     return (
//         <div className="mx-auto max-w-3xl px-4 py-8">
//             <h1 className="mb-4 text-xl font-bold">Anfrage erstellen</h1>
//
//             <form onSubmit={submit} className="space-y-5">
//                 <div className="grid gap-4 rounded-2xl border bg-white p-4">
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900">
//                             Titel<span className="text-red-600">*</span>
//                         </label>
//                         <input
//                             name="titel"
//                             value={form.titel}
//                             onChange={change}
//                             required
//                             maxLength={150}
//                             className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900">Beschreibung</label>
//                         <textarea
//                             name="beschreibung"
//                             value={form.beschreibung}
//                             onChange={change}
//                             rows={4}
//                             placeholder="Beschreibe kurz, wobei du Hilfe brauchst…"
//                             className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                         />
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900">Kategorie</label>
//                         <select
//                             name="kategorie"
//                             value={form.kategorie}
//                             onChange={change}
//                             className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                         >
//                             {KATEGORIEN.map(k => <option key={k} value={k}>{k}</option>)}
//                         </select>
//                     </div>
//                 </div>
//
//                 <div className="grid gap-4 rounded-2xl border bg-white p-4">
//                     <h2 className="text-sm font-semibold text-gray-900">
//                         Adresse<span className="text-red-600">*</span>
//                     </h2>
//                     <div className="grid gap-4 sm:grid-cols-2">
//                         <div>
//                             <label className="block text-sm font-medium text-gray-900">Stadt</label>
//                             <input
//                                 name="stadt"
//                                 value={form.stadt}
//                                 onChange={change}
//                                 required
//                                 className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                             />
//                         </div>
//                         <div>
//                             <label className="block text-sm font-medium text-gray-900">PLZ</label>
//                             <input
//                                 name="plz"
//                                 value={form.plz}
//                                 onChange={change}
//                                 required
//                                 pattern="^[0-9]{4,10}$"
//                                 className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                             />
//                         </div>
//                     </div>
//                     <div>
//                         <label className="block text-sm font-medium text-gray-900">Straße & Nr.</label>
//                         <input
//                             name="strasse"
//                             value={form.strasse}
//                             onChange={change}
//                             required
//                             className="mt-1 w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600"
//                         />
//                     </div>
//                 </div>
//
//                 <div className="flex items-center gap-3">
//                     <button
//                         disabled={laden}
//                         type="submit"
//                         className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
//                     >
//                         {laden ? 'Speichern…' : 'Anfrage speichern'}
//                     </button>
//                     {ok && <span className="text-sm text-green-700">{ok}</span>}
//                     {fehler && <span className="text-sm text-red-700">{fehler}</span>}
//                 </div>
//             </form>
//         </div>
//     );
// }
