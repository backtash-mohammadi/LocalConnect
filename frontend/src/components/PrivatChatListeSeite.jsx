import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { apiGet } from "../lib/apiClient";

export default function PrivatChatListeSeite(){
  const { token } = useAuth();
  const navigate = useNavigate();

  // UI-Zustände
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [eintraege, setEintraege] = useState([]);

  // Basis-URL (für Avatar-Download)
  const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Karten: partnerId -> blob-URL (Avatar) | null (kein Avatar)
  const [avatarKarte, setAvatarKarte] = useState({});
  // Karten: anfrageId -> Titel
  const [titelKarte, setTitelKarte] = useState({});

  // Initialen als Fallback für Avatar
  function initialen(name) {
    const s = (name || "").trim();
    if (!s) return "?";
    const p = s.split(/\s+/);
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
  }

  // Liste laden
  async function lade(){
    try{
      setFehler("");
      const arr = await apiGet(`/privatchats/`, token);
      setEintraege(Array.isArray(arr) ? arr : []);
    }catch(e){
      setFehler(e?.message || "Fehler beim Laden");
    } finally {
      setLaden(false);
    }
  }

  useEffect(() => { lade(); }, []);

  // Avatare der Partner laden (öffentlich erlaubt; Token wird gesendet, falls erforderlich)
  useEffect(() => {
    let abbruch = false;
    const ids = Array.from(new Set(eintraege.map(e => e.partnerId).filter(Boolean)));
    const fehlt = ids.filter(id => !(id in avatarKarte));
    if (fehlt.length === 0) return;

    async function ladeAvatar(id){
      try{
        const res = await fetch(`${BASIS_URL}/api/benutzer/${id}/avatar?ts=${Date.now()}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (!res.ok) {
          if (!abbruch) setAvatarKarte(prev => ({ ...prev, [id]: null }));
          return;
        }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!abbruch) setAvatarKarte(prev => ({ ...prev, [id]: url }));
      } catch {
        if (!abbruch) setAvatarKarte(prev => ({ ...prev, [id]: null }));
      }
    }

    fehlt.forEach(ladeAvatar);
    return () => { abbruch = true; };
  }, [eintraege, token, BASIS_URL, avatarKarte]);

  // Titel der Anfragen laden (statt „Anfrage #id“ anzeigen)
  useEffect(() => {
    let abbruch = false;
    const anfrageIds = Array.from(new Set(eintraege.map(e => e.anfrageId).filter(Boolean)));
    const fehlt = anfrageIds.filter(id => !(id in titelKarte));
    if (fehlt.length === 0) return;

    async function ladeTitel(id){
      try{
        // öffentlich verfügbarer Endpoint
        const dto = await apiGet(`/anfrage/${id}`, null);
        const titel = dto?.titel || dto?.title || `Anfrage #${id}`;
        if (!abbruch) setTitelKarte(prev => ({ ...prev, [id]: titel }));
      } catch {
        if (!abbruch) setTitelKarte(prev => ({ ...prev, [id]: `Anfrage #${id}` }));
      }
    }

    fehlt.forEach(ladeTitel);
    return () => { abbruch = true; };
  }, [eintraege, titelKarte]);

  // Aufräumen: blob-URLs freigeben
  useEffect(() => {
    return () => {
      Object.values(avatarKarte).forEach(u => { if (u) URL.revokeObjectURL(u); });
    };
  }, [avatarKarte]);

  return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Meine Nachrichten</h1>
          <button onClick={() => navigate(-1)} className="text-sm text-blue-600 hover:underline">Zurück</button>
        </div>

        {fehler && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {fehler}
            </div>
        )}

        {laden ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">Laden…</div>
        ) : (
            <ul className="space-y-2">
              {eintraege.map(e => {
                const avatar = e.partnerId ? avatarKarte[e.partnerId] : null;
                const titel = e.anfrageId ? titelKarte[e.anfrageId] : null;

                return (
                    <li key={e.id} className="flex items-center justify-between rounded-xl border bg-white p-3 shadow-sm">
                      <div className="flex items-center gap-3">
                        {/* Avatar / Initialen */}
                        {avatar ? (
                            <img src={avatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20" />
                        ) : (
                            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
                      {initialen(e.partnerName)}
                    </span>
                        )}

                        {/* Namen + Thema */}
                        <div>
                          <div className="font-medium">
                            {e.partnerName || "Nutzer"}
                            {e.ungelesen > 0 && (
                                <span className="ml-2 rounded-full bg-red-600 px-2 py-0.5 text-xs text-white">
                          {e.ungelesen}
                        </span>
                            )}
                          </div>
                          {/* statt „Anfrage #id“ → Titel der Anzeige, derselbe Stil */}
                          {titel && (
                              <div className="text-xs text-gray-500">
                                {titel}
                              </div>
                          )}
                        </div>
                      </div>

                      <Link
                          to={`/chat/${e.id}`}
                          state={{ partnerId: e.partnerId, partnerName: e.partnerName }}
                          className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50"
                      >
                        Öffnen
                      </Link>
                    </li>
                );
              })}
              {eintraege.length === 0 && (
                  <li className="text-sm text-gray-500">Keine Konversationen.</li>
              )}
            </ul>
        )}
      </div>
  );
}
