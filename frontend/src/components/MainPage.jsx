import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthKontext";
// import haushalt from "../assets/haushalt.png";
// import nachhilfe from "../assets/nachhilfe.png";
// import sonstiges from "../assets/sonstiges.png";
// import transport from "../assets/transport.png";
// import werkzeuge from "../assets/werkzeuge.png";
import AktuelleAnzeigen from "./AktuelleAnzeigen.jsx";
import {useEffect, useState} from "react";
import {apiGet} from "../lib/apiClient.js";
import TopBenutzern from "./TopBenutzern.jsx";
import  ribbon from "../assets/gold_medal_ribbon2.svg";

// function AnzeigeKarte({ titel, kategorie, ort, karmaKosten }) {
//     return (
//         <article className="rounded-2xl border p-4 shadow-sm transition hover:shadow">
//             <div className="mb-2 flex items-center justify-between">
//                 <span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-700">{kategorie}</span>
//                 <span className="text-xs text-gray-500">{ort}</span>
//             </div>
//             <h3 className="mb-3 text-base font-semibold text-gray-900">{titel}</h3>
//             <div className="flex items-center justify-between">
//                 <span className="text-sm text-gray-600">Kosten: <strong>-{karmaKosten}</strong> Karma</span>
//                 <button className="rounded-xl bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-700">Details</button>
//             </div>
//         </article>
//     );
// }

export default function MainPage() {
    // const { benutzer } = useAuth();

    const { token, benutzer } = useAuth();
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");
    // const [ok, setOk] = useState("");
    const [form, setForm] = useState({
        name: "",
        emailAdresse: "",
        fotoUrl: "",
        faehigkeiten: "",
        karma: 0,
        erstelltAm: "",
    });

    useEffect(()=>{
        let alive = true;
        setLaden(true);
        apiGet("/api/benutzer/me", token)
            .then((data)=>{ if(!alive) return; setForm({
                name: data.name || "",
                emailAdresse: data.emailAdresse || "",
                fotoUrl: data.fotoUrl || "",
                faehigkeiten: data.faehigkeiten || "",
                karma: data.karma || 0,
                erstelltAm: data.erstelltAm || "",
            }); })
            .catch((e)=>{ if(!alive) return; setFehler(e.message || "Fehler beim Laden"); })
            .finally(()=>{ if(!alive) return; setLaden(false); });
        return ()=>{ alive=false; };
    },[token]);

    // const kategorien = [
    //     { name: "Werkzeuge", beschreibung: "Bohrmaschine, Leiter, Schraubenschlüssel…" },
    //     { name: "Nachhilfe", beschreibung: "Mathe, Deutsch, Programmieren…" },
    //     { name: "Transport", beschreibung: "Kleintransporte, Umzugshilfe…" },
    //     { name: "Haushalt", beschreibung: "Garten, Putzen, Einkaufen…" },
    //     { name: "Sonstiges", beschreibung: "Alles, was sonst noch hilft." },
    // ];
    // const categoryIconMap = { "Haushalt": haushalt, "Nachhilfe": nachhilfe, "Sonstiges": sonstiges, "Transport": transport, "Werkzeuge": werkzeuge, };

    return (
        <main className="mx-auto max-w-6xl px-4">
            {/* Willkommen-Hinweis */}
            {benutzer && (
                <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                    Willkommen, <strong>{benutzer.name}</strong>! Du bist eingeloggt. Dein aktuelles Karma: <strong>{form.karma}</strong>.
                </div>
            )}

            {/* Hero */}
            {/*rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-3 shadow-sm ring-1 ring-sky-100/60 */}
            <section className="my-8 grid gap-12 rounded-xl border border-sky-200 bg-gradient-to-br from-sky-50 via-sky-100 to-white p-4 md:grid-cols-2">
                <div className="space-y-6 md:space-y-8">
                    <h1 className="text-3xl font-thin text-gray-900">Nachbarschaftshilfe, fair & einfach</h1>
                    <article className="text-sm text-gray-700 leading-5">
                        Frage nach Hilfe oder biete sie an. Sammle Karma-Punkte, wenn du hilfst!<br></br>
                        Und nutze Karma, wenn dir geholfen wird.
                        <p className="text-sm text-gray-700 italic text-right">Transparent, <strong>lo</strong>kal, <strong>co</strong>mmunity-getrieben.</p>
                    </article>


                    <div className="flex justify-around">
                        <div className="flex flex-col gap-3">
                            {/*<Link to="/anzeigen" className="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700">Anfragen ansehen</Link>*/}

                            {!benutzer && (
                                <>
                                    <div>
                                        <img
                                            src="/logo.png"
                                            alt="LocalConnect Logo"
                                            className="h-30 w-30 rounded-xl shadow-sm border border-sky-300 transition-transform group-hover:scale-110"
                                        />
                                    </div>
                                    <Link to="/login" className="rounded-xl border px-4 py-2 text-sm text-center hover:bg-white">Registrieren</Link>
                                </>
                            )}


                            {benutzer && (
                                <>
                                    <Link to="/erstellen" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Anfrage erstellen</Link>
                                    <Link to="/meine-anfragen" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Meine Anfragen</Link>
                                    <Link to="/meine-akzeptierte-anfragen" className="rounded-xl border px-4 py-2 text-sm hover:bg-white">Akzeptierte Hilfsangebote</Link>
                                </>
                            )}
                        </div>
                        {benutzer ?
                        <div className="flex flex-col align-middle text-xl font-thin text-gray-900">
                            <p className="mb-4"><span>Dein Karma: </span><span className="text-xl font-medium text-gray-900">{benutzer.karma}</span></p>
                           <img src={ribbon} alt="gold award karma" className="w-24 h-32 opacity-60"></img>
                        </div> :
                            <></>
                        }
                    </div>

                </div>

                <div className="grid gap-3">
                    <div>
                        <div className="text-2xl text-center font-normal mb-2">Los LoCos</div>
                        <div className="text-sm leading-5 text-gray-600"><strong>Top 3</strong>, die der Nachbarschaft helfern & Gemeinschaftsgefühl fördern & führen</div>
                    </div>
                    <TopBenutzern />
                    {/*{kategorien.map((kat) => (*/}
                    {/*    <li key={kat.name} className="flex items-start gap-3 rounded-xl border bg-white p-3">*/}
                    {/*        <img src={categoryIconMap[kat.name]} alt={kat.name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />*/}

                    {/*        /!*<div className="h-8 w-8 shrink-0 rounded-lg bg-indigo-100" />*!/*/}
                    {/*        <div>*/}
                    {/*            <div className="text-sm font-semibold">{kat.name}</div>*/}
                    {/*            <div className="text-xs text-gray-600">{kat.beschreibung}</div>*/}
                    {/*        </div>*/}
                    {/*    </li>*/}
                    {/*))}*/}
                </div>
            </section>

            {/* Anzeigenliste (Demo) */}
            <section className="my-8">

                <AktuelleAnzeigen />
            </section>
        </main>
    );
}