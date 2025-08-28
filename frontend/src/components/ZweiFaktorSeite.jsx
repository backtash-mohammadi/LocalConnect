import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";

export default function ZweiFaktorSeite(){
    const { bestaetigeLogin } = useAuth();
    const navigate = useNavigate();
    const loc = useLocation();
    const emailStart = loc.state?.emailAdresse || "";
    const [emailAdresse, setEmailAdresse] = useState(emailStart);
    const [code, setCode] = useState("");
    const [fehler, setFehler] = useState("");

    async function abschicken(e){
        e.preventDefault();
        setFehler("");
        try{
            await bestaetigeLogin(emailAdresse, code.trim());
            navigate("/");
        }catch(err){
            setFehler(err.message || "Fehler");
        }
    }

    return (
        <div className="mx-auto max-w-md p-6">
            <h1 className="text-2xl font-semibold">Code eingeben</h1>
            <p className="mt-2 text-gray-600">Neues Gerät erkannt. Wir haben dir einen 6-stelligen Code per E-Mail gesendet.</p>
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
                    Anmelden
                </button>
            </form>
        </div>
    );
}
