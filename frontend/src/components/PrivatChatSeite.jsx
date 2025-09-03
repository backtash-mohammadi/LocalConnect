import { useEffect, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
import { apiGet, apiPost } from "../lib/apiClient";

export default function PrivatChatSeite() {
  const { id } = useParams();
  const konvId = Number(id);
  const { token, benutzer } = useAuth();

  // Zustände für Chat
  const [nachrichten, setNachrichten] = useState([]);
  const [laden, setLaden] = useState(true);
  const [fehler, setFehler] = useState("");
  const [text, setText] = useState("");
  const eingabeRef = useRef(null);

  // Scroll-Referenzen
  const listeRef = useRef(null);     // Container mit overflow-y-auto
  const endeRef = useRef(null);      // unsichtbarer Anker am Ende

  // Hilfsfunktion: zum Ende scrollen
  function scrolleZumEnde(smooth = true) {
    // Warten bis DOM gerendert ist
    requestAnimationFrame(() => {
      endeRef.current?.scrollIntoView({
        behavior: smooth ? "smooth" : "auto",
        block: "end"
      });
    });
  }

  const { state } = useLocation();
  useEffect(() => {
    if (state?.partnerId) setPartnerId(state.partnerId);
    if (state?.partnerName) setPartnerName(state.partnerName);
  }, [state]);

  // Basis-URL (für Avatar-Download)
  const BASIS_URL = import.meta.env.VITE_API_URL || "http://localhost:8080";

  // Partner-Infos
  const [partnerId, setPartnerId] = useState(null);
  const [partnerName, setPartnerName] = useState("Nutzer");
  const [partnerAvatar, setPartnerAvatar] = useState(null); // blob-URL | null (kein Avatar)

  // Initialen als Fallback
  function initialen(name) {
    const s = (name || "").trim();
    if (!s) return "?";
    const p = s.split(/\s+/);
    return ((p[0]?.[0] || "") + (p[1]?.[0] || "")).toUpperCase();
  }

  // Nachrichten laden
  async function lade(alsGelesen = true) {
    try {
      setFehler("");
      const data = await apiGet(
          `/privatchats/${konvId}/nachrichten?alsGelesen=${alsGelesen ? "true" : "false"}`,
          token
      );
      const liste = Array.isArray(data) ? data : [];
      setNachrichten(liste);

      // Partner aus Nachrichten ableiten (ohne Backend-Änderungen)
      if (liste.length > 0) {
        const fremde =
            liste.find((n) => n.absenderId && n.absenderId !== benutzer?.id) ||
            liste.find((n) => n.empfaengerId && n.empfaengerId !== benutzer?.id);

        const pid = fremde
            ? fremde.absenderId && fremde.absenderId !== benutzer?.id
                ? fremde.absenderId
                : fremde.empfaengerId
            : null;

        if (pid && pid !== partnerId) setPartnerId(pid);

        const pname =
            (fremde && (fremde.absenderName || fremde.empfaengerName)) || partnerName;
        if (pname && pname !== partnerName) setPartnerName(pname);
      }

      try { window.dispatchEvent(new CustomEvent("privatchat-read")); } catch {}
    } catch (e) {
      setFehler(e?.message || "Unbekannter Fehler");
    } finally {
      setLaden(false);
    }
  }

  // Senden
  async function senden(e) {
    e?.preventDefault?.();
    const t = text.trim();
    if (!t) return;
    try {
      setFehler("");
      const res = await apiPost(`/privatchats/${konvId}/nachrichten`, { text: t }, token);
      setNachrichten((alt) => [...alt, res]);
      setText("");
      // Nach dem Senden direkt nach unten scrollen
      setTimeout(() => {
        scrolleZumEnde(true);
        eingabeRef.current?.focus?.();
      }, 0);
    } catch (e) {
      setFehler(e?.message || "Senden fehlgeschlagen");
    }
  }

  // Polling
  useEffect(() => {
    lade(true);
    const iv = setInterval(() => lade(true), 2000);
    return () => clearInterval(iv);
  }, [konvId]);

  // Partner-Avatar laden (öffentlich erlaubt; mit Token falls notwendig)
  useEffect(() => {
    let abbruch = false;
    async function ladeAvatar() {
      if (!partnerId) return;
      try {
        const res = await fetch(
            `${BASIS_URL}/api/benutzer/${partnerId}/avatar?ts=${Date.now()}`,
            { headers: token ? { Authorization: `Bearer ${token}` } : {} }
        );
        if (!res.ok) { setPartnerAvatar(null); return; }
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        if (!abbruch) setPartnerAvatar(url);
      } catch {
        if (!abbruch) setPartnerAvatar(null);
      }
    }
    ladeAvatar();
    return () => { abbruch = true; };
  }, [partnerId, token, BASIS_URL]);

  // Aufräumen blob-URL beim Unmount
  useEffect(() => {
    return () => { if (partnerAvatar) URL.revokeObjectURL(partnerAvatar); };
  }, [partnerAvatar]);

  // Partner-Metadaten über Liste ermitteln (Name/Id)
  useEffect(() => {
    let abbruch = false;
    async function ladeMeta() {
      if (!token) return;
      try {
        const arr = await apiGet(`/privatchats/`, token);
        const liste = Array.isArray(arr) ? arr : [];
        const eintrag = liste.find((e) => Number(e.id) === Number(konvId));
        if (eintrag && !abbruch) {
          if (eintrag.partnerId && eintrag.partnerId !== partnerId) setPartnerId(eintrag.partnerId);
          if (eintrag.partnerName && eintrag.partnerName !== partnerName) setPartnerName(eintrag.partnerName);
        }
      } catch {}
    }
    ladeMeta();
    return () => { abbruch = true; };
  }, [konvId, token]);

  // ✨ Autoscroll: beim ersten Laden — ohne Animation
  useEffect(() => {
    if (!laden) scrolleZumEnde(false);
  }, [laden]);

  // ✨ Autoscroll: bei neuen Nachrichten — weich scrollen
  useEffect(() => {
    if (!laden) scrolleZumEnde(true);
  }, [nachrichten.length, laden]);

  return (
      <div className="mx-auto max-w-3xl p-4">
        {/* Kopfbereich mit Avatar + Name */}
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {partnerAvatar ? (
                <img src={partnerAvatar} alt="" className="h-9 w-9 rounded-full object-cover ring-2 ring-indigo-500/20" />
            ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-600 text-sm font-semibold text-white">
              {initialen(partnerName)}
            </span>
            )}
            <div>
              <div className="text-xl font-medium text-gray-900">Privatchat mit {partnerName || "Nutzer"}</div>
            </div>
          </div>
          <Link to="/" className="text-sm text-blue-600 hover:underline">Zurück</Link>
        </div>

        {fehler && (
            <div className="mb-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {fehler}
            </div>
        )}

        {laden ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">Laden…</div>
        ) : (
            <div className="rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60 ">
              {/* Nachrichtenliste */}
              <div ref={listeRef} className="max-h-[60vh] space-y-2 overflow-y-auto p-4">
                {nachrichten.map((n) => {
                  const istIch = n.absenderId === benutzer?.id;
                  return (
                      <div key={n.id} className={`flex ${istIch ? "justify-end" : "justify-start"}`}>
                        {/* Avatar links bei eingehenden Nachrichten */}
                        {!istIch && (
                            <div className="mr-2 mt-auto">
                              {partnerAvatar ? (
                                  <img src={partnerAvatar} alt="" className="h-8 w-8 rounded-full object-cover ring-2 ring-indigo-500/20" />
                              ) : (
                                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-600 text-[10px] font-semibold text-white">
                          {initialen(partnerName)}
                        </span>
                              )}
                            </div>
                        )}

                        <div className={`max-w-[80%] rounded-xl px-3 py-2 text-sm ${istIch ? "bg-blue-400 text-white" : "bg-green-200"}`}>
                          <div className="whitespace-pre-wrap break-words">{n.text}</div>
                          <div className="mt-1 text-[11px] text-gray-800">
                            {new Date(n.erstelltAm).toLocaleString("de-DE")}
                            {n.gelesen ? " • gelesen" : ""}
                          </div>
                        </div>
                      </div>
                  );
                })}
                {/* unsichtbarer Anker fürs Scrollen ans Ende */}
                <div ref={endeRef} />
                {nachrichten.length === 0 && (
                    <div className="text-sm text-gray-500">Noch keine Nachrichten.</div>
                )}
              </div>

              {/* Eingabebereich */}
              <form onSubmit={senden} className="flex gap-2 border-t p-3">
                <input
                    ref={eingabeRef}
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Nachricht schreiben…"
                    className="flex-1 rounded-xl border border-sky-300 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                />
                <button
                    type="submit"
                    className="rounded-xl cursor-pointer bg-blue-700 px-4 py-2 text-white disabled:opacity-90"
                    disabled={!text.trim()}
                >
                  Senden
                </button>
              </form>
            </div>
        )}
      </div>
  );
}
