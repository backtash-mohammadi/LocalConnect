import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { apiGet } from "../lib/apiClient";

export default function PrivatChatListeSeite(){
  const { token } = useAuth();
  const navigate = useNavigate();
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [eintraege, setEintraege] = useState([]);

  async function lade(){
    try{
      setFehler("");
      const arr = await apiGet(`/privatchats/`, token);
      setEintraege(Array.isArray(arr) ? arr : []);
    }catch(e){ setFehler(e?.message || "Fehler beim Laden"); }
    finally{ setLaden(false); }
  }

  useEffect(() => { lade(); }, []);

  return (
    <div className="mx-auto max-w-3xl p-4">
      <div className="mb-3 flex items-center justify-between">
        <h1 className="text-xl font-semibold">Meine Nachrichten</h1>
        <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">Zurück</button>
      </div>
      {fehler && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{fehler}</div>}
      {laden ? (<div className="rounded-lg border bg-white p-4 shadow-sm">Laden…</div>) : (
        <ul className="space-y-2">
          {eintraege.map(e => (
            <li key={e.id} className="flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm">
              <div>
                <div className="font-medium">{e.partnerName || "Nutzer"} {e.ungelesen > 0 && <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">{e.ungelesen}</span>}</div>
                {e.anfrageId && <div className="text-xs text-gray-500">Anfrage #{e.anfrageId}</div>}
              </div>
              <Link to={`/chat/${e.id}`} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">Öffnen</Link>
            </li>
          ))}
          {eintraege.length === 0 && <li className="text-sm text-gray-500">Keine Konversationen.</li>}
        </ul>
      )}
    </div>
  );
}
