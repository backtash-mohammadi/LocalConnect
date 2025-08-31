import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPost } from "../lib/apiClient";

export default function PrivatChatSeite(){
  const { id } = useParams();
  const konvId = Number(id);
  const { token, benutzer } = useAuth();
  const [nachrichten, setNachrichten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [text, setText] = useState("");
  const eingabeRef = useRef(null);

  async function lade(alsGelesen = true){
    try{
      setFehler("");
      const data = await apiGet(`/privatchats/${konvId}/nachrichten?alsGelesen=${alsGelesen ? "true":"false"}`, token);
      setNachrichten(Array.isArray(data) ? data : []);
      try { window.dispatchEvent(new CustomEvent('privatchat-read')); } catch {}
    }catch(e){
      setFehler(e?.message || "Unbekannter Fehler");
    }finally{ setLaden(false); }
  }

  async function senden(e){
    e?.preventDefault?.();
    const t = text.trim();
    if (!t) return;
    try{
      setFehler("");
      const res = await apiPost(`/privatchats/${konvId}/nachrichten`, { text: t }, token);
      setNachrichten((alt) => [...alt, res]);
      setText("");
      setTimeout(() => { eingabeRef.current?.focus?.(); }, 50);
    }catch(e){ setFehler(e?.message || "Senden fehlgeschlagen"); }
  }

  useEffect(() => {
    lade(true);
    const iv = setInterval(() => lade(true), 8000);
    return () => clearInterval(iv);
  }, [konvId]);

  return (
      <div className="mx-auto max-w-3xl p-4">
        <div className="mb-3 flex items-center justify-between">
          <h1 className="text-xl font-semibold">Privater Chat</h1>
          <Link to="/" className="text-sm text-blue-600 hover:underline">Zurück</Link>
        </div>

        {fehler && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{fehler}</div>}
        {laden ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">Laden…</div>
        ) : (
            <div className="rounded-2xl border bg-white p-0 shadow-sm">
              <div className="max-h-[60vh] overflow-y-auto p-4 space-y-2">
                {nachrichten.map((n) => (
                    <div key={n.id} className={`flex ${n.absenderId === benutzer?.id ? "justify-end" : "justify-start"}`}>
                      <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${n.absenderId === benutzer?.id ? "bg-blue-500 text-white" : "bg-gray-100"}`}>

                        <div className="whitespace-pre-wrap break-words">{n.text}</div>
                        <div className="mt-1 text-[11px] text-gray-800">{new Date(n.erstelltAm).toLocaleString("de-DE")}{n.gelesen ? " • gelesen": ""}</div>
                      </div>
                    </div>
                ))}
                {nachrichten.length === 0 && <div className="text-sm text-gray-500">Noch keine Nachrichten.</div>}
              </div>
              <form onSubmit={senden} className="border-t p-3 flex gap-2">
                <input ref={eingabeRef} value={text} onChange={(e)=>setText(e.target.value)} placeholder="Nachricht schreiben…"
                       className="flex-1 rounded-xl border px-3 py-2 outline-none" />
                <button type="submit" className="rounded-xl bg-black px-4 py-2 text-white disabled:opacity-50" disabled={!text.trim()}>Senden</button>
              </form>
            </div>
        )}
      </div>
  );
}
