import { useEffect, useRef, useState } from "react";
import { apiGet } from "../lib/apiClient";
import { Link } from "react-router-dom";

// 🔧 Einfache Bild-Zuweisung pro Kategorie (kann erweitert werden)
import haushalt from "../assets/haushalt.png";
import nachhilfe from "../assets/nachhilfe.png";
import sonstiges from "../assets/sonstiges.png";
import transport from "../assets/transport.png";
import werkzeuge from "../assets/werkzeuge.png";

const kategorieBild = {
    "Haushalt": haushalt,
    "Nachhilfe": nachhilfe,
    "Transport": transport,
    "Werkzeuge": werkzeuge,
    "Sonstiges": sonstiges,
};

function AnzeigeKarte({ id, titel, kategorie, stadt, plz, beschreibung }) {
    const bild = kategorieBild[kategorie] || sonstiges;
    return (
        <Link
            to={`/anfrage/${id}`}
            className="block h-full group focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded-2xl"
            aria-label={`Anzeige öffnen: ${titel}`}
            >
    <article className="h-full flex flex-col rounded-2xl border bg-white p-4 shadow-sm transition group-hover:shadow-md cursor-pointer">
            <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">
          {kategorie || "Sonstiges"}
        </span>
                <span className="text-xs text-gray-500">
          {stadt}{plz ? `, ${plz}` : ""}
        </span>
            </div>

            <div className="mb-3 flex items-start gap-3">
                <img src={bild} alt="Kategorie" className="h-10 w-10 shrink-0 rounded-lg object-contain" />
                <h3 className="text-base font-semibold text-gray-900">{titel}</h3>
            </div>

            {/* vollständige Beschreibung – nimmt Resthöhe ein, скролл без полос */}
            <div className="min-h-0 flex-1 overflow-y-auto ohne-scrollbar">
                <p className="text-sm text-gray-700 whitespace-pre-line">
                    {beschreibung}
                </p>
            </div>
        </article>
        </Link>
    );
}

// 🎠 3D-Karussell mit Drag, sauberem Snap & funktionierendem Klick
function Karussell3D({
                         elemente,
                         intervallMs = 4000,
                         radius: radiusVorgabe,
                         streckfaktor = 1.0,
                         kartenHoehePx = 160,
                         kartenBreiteMaxPx = 400,
                         kartenBreiteProzent = 0.86,
                         pixelProSchritt = 160,
                         dragSchwellePx = 10,
                         pauseNachDragMs = 2500,
                     }) {
    const buehneRef = useRef(null);
    const rotorRef  = useRef(null);
    const schrittRef = useRef(0);
    const [schritt, setSchritt] = useState(0);

    const n = Math.max(1, elemente.length);
    const winkelProKarte = 360 / n;
    const index = ((Math.round(schritt) % n) + n) % n; // актив для ховера/клика

    const [radius, setRadius] = useState(420);

    const dragRef = useRef({
        aktiv: false,
        startX: 0,
        startSchritt: 0,
        hatGezogen: false,
        letzterDx: 0,
    });

    const [autoPause, setAutoPause] = useState(false);
    const autoPauseTimer = useRef(null);

    // 📏 Radius
    useEffect(() => {
        if (radiusVorgabe) { setRadius(radiusVorgabe); return; }
        if (!buehneRef.current) return;
        const b = buehneRef.current.clientWidth;
        const zielBreite = Math.min(kartenBreiteMaxPx, b * kartenBreiteProzent);
        const theta = Math.PI / n;
        let r = zielBreite / (2 * Math.tan(theta));
        r = Math.min(Math.max(r * streckfaktor, 200), 1600);
        setRadius(r);
    }, [n, radiusVorgabe, streckfaktor, kartenBreiteMaxPx, kartenBreiteProzent]);


    useEffect(() => {
        if (n === 0 || autoPause || dragRef.current.aktiv) return;
        const id = setInterval(() => {
            schrittRef.current = schrittRef.current + 1;
            setSchritt(s => s + 1);
        }, Math.max(2000, intervallMs));
        return () => clearInterval(id);
    }, [n, intervallMs, autoPause]);

    const pauseAutoplay = () => {
        if (autoPauseTimer.current) clearTimeout(autoPauseTimer.current);
        setAutoPause(true);
        autoPauseTimer.current = setTimeout(() => setAutoPause(false), pauseNachDragMs);
    };

    // 🖱️ Drag
    const onPointerDown = (e) => {
        if (e.pointerType === "mouse" && e.button !== 0) return;
        dragRef.current.aktiv = true;
        dragRef.current.startX = e.clientX;
        dragRef.current.startSchritt = schrittRef.current;
        dragRef.current.hatGezogen = false;
        dragRef.current.letzterDx = 0;
        pauseAutoplay();
        buehneRef.current?.classList.add("cursor-grabbing");

        if (rotorRef.current) rotorRef.current.style.transition = "none";
    };

    const onPointerMove = (e) => {
        if (!dragRef.current.aktiv) return;
        const dx = e.clientX - dragRef.current.startX;
        dragRef.current.letzterDx = dx;

        if (Math.abs(dx) < dragSchwellePx) return; // ещё клик, не драг
        dragRef.current.hatGezogen = true;
        e.preventDefault();

        const live = dragRef.current.startSchritt + (-dx / pixelProSchritt);

        if (rotorRef.current) {
            rotorRef.current.style.transform =
                `translateZ(-${radius}px) rotateY(${-live * winkelProKarte}deg)`;
        }
    };

    const onPointerUpOrCancel = (e) => {
        if (!dragRef.current.aktiv) return;
        const warZiehen = dragRef.current.hatGezogen;
        dragRef.current.aktiv = false;

        if (warZiehen) {
            e.preventDefault();
            const ziel = dragRef.current.startSchritt + (-dragRef.current.letzterDx / pixelProSchritt);
            const gerundet = Math.round(ziel);
            schrittRef.current = gerundet;

            if (rotorRef.current) {
                rotorRef.current.style.transition = "transform 900ms ease";
                rotorRef.current.style.transform =
                    `translateZ(-${radius}px) rotateY(${-gerundet * winkelProKarte}deg)`;
            }
            setSchritt(gerundet);
        }

        dragRef.current.hatGezogen = false;
        dragRef.current.letzterDx = 0;
        buehneRef.current?.classList.remove("cursor-grabbing");
        pauseAutoplay();
    };

    useEffect(() => {
        if (dragRef.current.aktiv) return;
        if (!rotorRef.current) return;
        rotorRef.current.style.transition = "transform 900ms ease";
        rotorRef.current.style.transform =
            `translateZ(-${radius}px) rotateY(${-schritt * winkelProKarte}deg)`;
    }, [schritt, radius, winkelProKarte]);

    const istNachbar = (i, j) => {
        const links = (j - 1 + n) % n;
        const rechts = (j + 1) % n;
        return i === links || i === rechts;
    };

    return (
        <div
            ref={buehneRef}
            className="relative mx-auto w-full cursor-grab select-none "
            style={{ perspective: "1200px", height: `${kartenHoehePx}px` }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUpOrCancel}
            onPointerCancel={onPointerUpOrCancel}
            onPointerLeave={onPointerUpOrCancel}
        >
            <div
                ref={rotorRef}
                className="absolute inset-0 will-change-transform "
                style={{
                    transformStyle: "preserve-3d",
                    transition: "transform 900ms ease",
                    transform: `translateZ(-${radius}px) rotateY(${-schritt * winkelProKarte}deg)`,
                }}
            >
                {elemente.map((el, i) => {
                    const aktiv = i === index;
                    const nachbar = istNachbar(i, index);
                    return (
                        <div
                            key={i}
                            data-index={i}
                            className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 "
                            style={{
                                width: `min(${kartenBreiteMaxPx}px, ${kartenBreiteProzent * 100}%)`,
                                height: "100%",
                                transform: `rotateY(${i * winkelProKarte}deg) translateZ(${radius}px)`,
                                transition: "transform 900ms ease, opacity 900ms ease, filter 900ms ease, box-shadow 900ms ease",
                                opacity: aktiv ? 1 : (nachbar ? 0.85 : 0.55),
                                filter: aktiv ? "none" : "blur(0.3px)",
                                pointerEvents: aktiv ? "auto" : "none",
                            }}
                        >
                            <div
                                className="h-full transition-all rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60"
                                style={{
                                    transform: `scale(${aktiv ? 1.0 : (nachbar ? 0.96 : 0.92)})`,
                                    boxShadow: aktiv ? "0 18px 40px rgba(0,0,0,0.18)" : "0 6px 18px rgba(0,0,0,0.08)",
                                    borderRadius: "1rem",
                                    background: "transparent",
                                }}
                            >
                                <div className="h-full ">{el}</div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}




export default function AktuelleAnzeigen() {
    // Kein Token nötig; Endpunkt ist öffentlich
    const [anzeigen, setAnzeigen] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    // ⬇️ Anzeigen ohne jeglichen Filter laden
    async function ladeAnzeigen() {
        try {
            setLaden(true);
            setFehler("");
            const daten = await apiGet("/api/anfragen/aktuell", { limit: 18 });
            setAnzeigen(Array.isArray(daten) ? daten : []);
        } catch (e) {
            setFehler(e?.message || "Fehler beim Laden");
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        ladeAnzeigen();
    }, []);

    const karten = (anzeigen || []).map((a) => (
        <AnzeigeKarte
            key={a.id}
            id={a.id}
            titel={a.titel}
            kategorie={a.kategorie}
            stadt={a.stadt}
            plz={a.plz}
            beschreibung={a.beschreibung}
        />
    ));

    return (
        <section className="mx-auto max-w-6xl px-4 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60">
            <div className="mb-4 ">
                <h2 className="text-2xl text-black font-thin">Aktuelle Anzeigen</h2>
                <p className="text-sm text-gray-500">Neueste, noch offene Gesuche aus der Umgebung</p>
            </div>

            {laden && (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Lade Anzeigen…</div>
            )}
            {!laden && fehler && (
                <div className="rounded-xl border bg-red-50 p-4 text-red-700">{fehler}</div>
            )}
            {!laden && !fehler && karten.length === 0 && (
                <div className="rounded-xl border bg-white p-8 text-center text-gray-500">Noch keine Anzeigen vorhanden.</div>
            )}

            {!laden && !fehler && karten.length > 0 && (
                <Karussell3D elemente={karten} intervallMs={4200} />
            )}
        </section>
    );
}
