import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";

export default function BenutzerMenue(){
    const { benutzer, ausloggen } = useAuth();
    const [offen, setOffen] = useState(false);
    const ref = useRef(null);

    useEffect(()=>{
        const onDocClick = e => { if(ref.current && !ref.current.contains(e.target)) setOffen(false); };
        const onKey = e => { if(e.key === "Escape") setOffen(false); };
        document.addEventListener("click", onDocClick);
        document.addEventListener("keydown", onKey);
        return ()=>{ document.removeEventListener("click", onDocClick); document.removeEventListener("keydown", onKey); };
    },[]);

    if(!benutzer) return null;
    const initiale = benutzer.name?.trim()?.charAt(0)?.toUpperCase() || "?";

    return (
        <div className="relative" ref={ref}>
            <button
                aria-haspopup="menu"
                aria-expanded={offen}
                onClick={()=>setOffen(o=>!o)}
                className="flex items-center gap-2 rounded-xl border px-3 py-1.5 text-sm hover:bg-gray-50"
            >
                {benutzer.fotoUrl
                    ? <img src={benutzer.fotoUrl} alt="Avatar" className="h-6 w-6 rounded-full object-cover" />
                    : <span className="grid h-6 w-6 place-items-center rounded-full bg-indigo-600 text-white text-xs font-semibold">{initiale}</span>}
                <span>{benutzer.name}</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path d="M5.23 7.21a.75.75 0 011.06.02L10 11.084l3.71-3.853a.75.75 0 111.08 1.04l-4.24 4.4a.75.75 0 01-1.08 0l-4.24-4.4a.75.75 0 01.02-1.06z"/></svg>
            </button>

            {offen && (
                <div role="menu" className="absolute right-0 mt-2 w-56 rounded-xl border bg-white p-2 text-sm shadow-lg">
                    <div className="px-3 py-2 text-gray-600">Eingeloggt als <strong className="text-gray-900">{benutzer.name}</strong></div>
                    <Link to="/profil" onClick={()=>setOffen(false)} className="block rounded-lg px-3 py-2 hover:bg-gray-50" role="menuitem">Profil</Link>
                    <hr className="my-1" />
                    <button onClick={()=>{ ausloggen(); setOffen(false); }} className="block w-full rounded-lg px-3 py-2 text-left hover:bg-gray-50" role="menuitem">Abmelden</button>
                </div>
            )}
        </div>
    );
}
