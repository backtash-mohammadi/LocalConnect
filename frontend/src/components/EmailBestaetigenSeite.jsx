import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";

export default function EmailBestaetigenSeite() {
    const { bestaetigeRegistrierung } = useAuth();
    const [search] = useSearchParams();
    const emailVoraus = search.get("email") || "";
    const [emailAdresse, setEmailAdresse] = useState(emailVoraus);
    const [code, setCode] = useState("");
    const [fehler, setFehler] = useState("");
    const navigate = useNavigate();

    async function abschicken(e){
        e.preventDefault();
        setFehler("");
        try{
            await bestaetigeRegistrierung(emailAdresse, code.trim());
            navigate("/login?ok=registriert");
        }catch(err){
            setFehler(err.message || "Fehler");
        }
    }

    return (
        <div className="mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold">E-Mail bestätigen</h1>
            <p className="mt-2 text-gray-600">Wir haben dir einen 6-stelligen Code geschickt. Bitte gib ihn hier ein.</p>
            <form onSubmit={abschicken} className="mt-6 space-y-4">
                <div>
                    <label className="block text-sm font-medium">E-Mail-Adresse</label>
                    <input value={emailAdresse} onChange={(e)=>setEmailAdresse(e.target.value)} type="email"
                           className="mt-1 w-full rounded-lg border px-3 py-2" required/>
                </div>
                <div>
                    <label className="block text-sm font-medium">Code</label>
                    <input value={code} onChange={(e)=>setCode(e.target.value)} maxLength="6"
                           className="mt-1 w-full rounded-lg border px-3 py-2 tracking-widest text-center" required/>
                </div>
                {fehler && <div className="text-sm text-red-600">{fehler}</div>}
                <button type="submit" className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700">
                    Bestätigen
                </button>
            </form>
        </div>
    );
}
