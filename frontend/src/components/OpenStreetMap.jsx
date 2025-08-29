// --- file: src/components/OpenStreetMap.jsx ---
import React, { useState, useCallback } from 'react'
import AddressSearch from './AddressSearch.jsx'
import RadiusMap from './RadiusMap.jsx'
import { apiGet, baueQuery } from '../lib/apiClient.js'

const DEFAULT_CENTER = [52.520008, 13.404954]

export default function OpenStreetMap() {

    const [center, setCenter] = useState(DEFAULT_CENTER)
    const [anfragen, setAnfragen] = useState([])
    const [ladeAnfragen, setLadeAnfragen] = useState(false)
    const [stadt, setStadt] = useState('')                 // kein Default "berlin"
    const [fehlermeldung, setFehlermeldung] = useState('')

    // Adresse → Center (+ optional Stadt direkt übernehmen)
    // const handleSelectAddress = useCallback((lat, lon, stadtVomPick) => {
    //     setCenter([Number(lat), Number(lon)])
    //     if (stadtVomPick) setStadt(stadtVomPick)            // <— Reverse nicht nötig, wenn vorhanden
    // }, [])

    const handleSelectAddress = useCallback(async (lat, lon, stadtVomPick) => {
        const neu = [Number(lat), Number(lon)]
        setCenter(neu)

        if (stadtVomPick && stadtVomPick.trim()) {
            setStadt(stadtVomPick)
        } else {
            // Geolocation-Flow: alte Stadt ist ungültig → löschen, dann Reverse starten
            setStadt('')
            try {
                const s = await ermittleStadtVomCenter(neu)
                if (s) setStadt(s)
            } catch {
                /* schlucken – UI bleibt nutzbar, Ladebutton macht ggf. Reverse später erneut */
            }
        }
    }, [])

    // Reverse-Geocoding NUR wenn Stadt unbekannt (Geolocation-Flow)
    async function ermittleStadtVomCenter([lat, lon]) {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
            headers: { Accept: 'application/json' }
        })
        if (!res.ok) {
            throw new Error('Reverse-Geocoding fehlgeschlagen.');
        }
        const data = await res.json()
        const adr = data?.address || {}
        return adr.city || adr.town || adr.village || adr.municipality || adr.county || ''
    }

    // Backend-Felder normalisieren (inkl. lat/lon + Tippfehler behoben)
    const normalisiere = (obj) => ({
        id: obj.id ?? obj.anfrageId ?? obj.uuid ?? undefined,
        titel: obj.title ?? obj.titel ?? '',
        stadt: obj.city ?? obj.stadt ?? '',
        strasse: obj.street ?? obj.strasse ?? '',
        plz: obj.zipCode ?? obj.zip ?? obj.postalCode ?? obj.plz ?? '',
        kategorie: obj.category ?? obj.kategorie ?? '',
        lat: obj.lat ?? obj.latitude ?? null,
        lon: obj.lon ?? obj.longitude ?? null,
    })

    // Vorwärts-Geocoding (nur für Alt-Fälle ohne Koordinaten) über Backend-Proxy
    async function geocodeAdresse({ strasse, plz, stadt }) {
        const q = [strasse, plz, stadt].filter(Boolean).join(' ')
        if (!q) return null
        const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}&limit=1`, {
            headers: { Accept: 'application/json' }
        })
        if (!res.ok) return null
        const arr = await res.json()
        const hit = Array.isArray(arr) && arr[0]
        return hit ? { lat: Number(hit.lat), lon: Number(hit.lon) } : null
    }

    const PFAD_ANFRAGEN = '/stadt-anfragen'               // ggf. anpassen

    // Button-Handler
    async function ladeAnfragenFuerAktuelleStadt() {
        setFehlermeldung('')
        setLadeAnfragen(true)
        try {
            // Wenn wir die Stadt bereits kennen (Search-Bar), Reverse überspringen
            const s = (stadt && stadt.trim()) ? stadt : await ermittleStadtVomCenter(center)
            if (!s) throw new Error('Stadt konnte aus der Kartenposition nicht ermittelt werden.')
            setStadt(s)

            // 1) Backend laden & normalisieren
            const daten = await apiGet(`${PFAD_ANFRAGEN}${baueQuery({ city: s })}`)
            const normiert = (Array.isArray(daten) ? daten : []).map(normalisiere)

            // 2) Sofort alle mit Koordinaten anzeigen
            const hatKoords = (x) => Number.isFinite(x.lat) && Number.isFinite(x.lon)
            const mitKoords  = normiert.filter(hatKoords)
            const ohneKoords = normiert.filter(x => !hatKoords(x))
            setAnfragen(mitKoords)

            // 3) Nur fehlende Koordinaten ergänzen (parallel, kein künstlicher Sleep)
            if (ohneKoords.length) {
                const geokodiert = await Promise.all(
                    ohneKoords.map(async (item) => {
                        const coords = await geocodeAdresse(item)
                        return coords ? { ...item, ...coords } : null
                    })
                )
                setAnfragen(prev => [...prev, ...geokodiert.filter(Boolean)])
            }
        } catch (e) {
            setFehlermeldung(e?.message || String(e))
        } finally {
            setLadeAnfragen(false)
        }
    }

    return (
        <main className="app mx-auto px-4 my-8">
            <div className="search-wrap mx-auto w-full md:w-4/5 lg:w-3/4">
                <AddressSearch onSelect={handleSelectAddress} />
            </div>

            <div className="search-wrap mx-auto mt-8 w-full md:w-4/5 lg:w-3/4">
                {stadt && <span className="text-sm text-gray-600"> Stadt: <strong>{stadt}</strong></span>}
                <button
                    type="button"
                    className="btn"
                    onClick={ladeAnfragenFuerAktuelleStadt}
                    disabled={ladeAnfragen}
                    aria-busy={ladeAnfragen}
                >
                    {ladeAnfragen ? 'Lade Anfragen…' : 'in der Nähe suchen'}
                </button>
            </div>
            {fehlermeldung && (
                <div className="mx-auto w-full md:w-4/5 lg:w-3/4 mb-3 text-sm text-red-600">{fehlermeldung}</div>
            )}

            <div className="mx-auto w-full md:w-4/5 lg:w-3/4">
                <RadiusMap center={center} onGeolocated={handleSelectAddress} posts={anfragen} />
            </div>
        </main>
    )
}


// import React, { useState, useCallback } from 'react'
// import AddressSearch from './AddressSearch.jsx'
// import RadiusMap from './RadiusMap.jsx'
// import { apiGet, baueQuery } from '../lib/apiClient.js'
//
// const DEFAULT_CENTER = [52.520008, 13.404954]
//
// export default function OpenStreetMap() {
//     const [center, setCenter] = useState(DEFAULT_CENTER)
//
//     // Neu: Zustand für geladene Anfragen + UI-Status
//     const [anfragen, setAnfragen] = useState([])
//     const [ladeAnfragen, setLadeAnfragen] = useState(false)
//     const [stadt, setStadt] = useState('berlin')
//     const [fehlermeldung, setFehlermeldung] = useState('')
//
//     // Adresse → Center
//     const handleSelectAddress = useCallback((lat, lon) => {
//         setCenter([Number(lat), Number(lon)])
//     }, [])
//
//     // Aus Kartenmitte Stadtname ermitteln (Reverse Geocoding via Nominatim)
//     async function ermittleStadtVomCenter([lat, lon]) {
//         const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`
//         const res = await fetch(url, { headers: { Accept: 'application/json' } })
//         if (!res.ok) throw new Error('Reverse-Geocoding fehlgeschlagen.')
//         const data = await res.json()
//         const adr = data?.address || {}
//         return adr.city || adr.town || adr.village || adr.municipality || adr.county || ''
//     }
//
//     // Backend-Felder flexibel normalisieren (EN/DE)
//     const normalisiere = (obj) => ({
//         id: obj.id ?? obj.anfrageId ?? obj.uuid ?? undefined,
//         titel: obj.title ?? obj.titel ?? '',
//         stadt: obj.city ?? obj.stadt ?? '',
//         strasse: obj.street ?? obj.strasse ?? '',
//         plz: obj.zipCode ?? obj.zip ?? obj.postalCode ?? obj.plz ?? '',
//         kategorie: obj.cactegory ?? obj.kategorie ?? '',
//     })
//
//     // Einzelne Anfrage-Adresse → Koordinaten (Forward Geocoding via Nominatim)
//     async function geocodeAdresse({ strasse, plz, stadt }) {
//         const q = [strasse, plz, stadt].filter(Boolean).join(' ')
//         if (!q) return null
//         const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
//         const res = await fetch(url, { headers: { Accept: 'application/json' } })
//         if (!res.ok) return null
//         const arr = await res.json()
//         const hit = Array.isArray(arr) && arr[0]
//         if (!hit) return null
//         return { lat: Number(hit.lat), lon: Number(hit.lon) }
//     }
//
//     // HINWEIS: Pfad ggf. an euren Controller anpassen (z. B. '/api/anfragen')
//     const PFAD_ANFRAGEN = '/stadt-anfragen'
//
//     // Button-Handler: aktuelle Stadt -> Backend -> Marker rendern
//     async function ladeAnfragenFuerAktuelleStadt() {
//         setFehlermeldung('')
//         setLadeAnfragen(true)
//         try {
//             const s = await ermittleStadtVomCenter(center)
//             if (!s) {
//                 throw new Error('Stadt konnte aus der Kartenposition nicht ermittelt werden.');
//             }
//             setStadt(s);
//
//             // Backend: alle Anfragen für diese Stadt laden
//             const daten = await apiGet(`${PFAD_ANFRAGEN}${baueQuery({ city: s })}`)
//             const normiert = (Array.isArray(daten) ? daten : []).map(normalisiere)
//
//             // Adressen nacheinander geokodieren (schonend für Nominatim)
//             const result = []
//             for (const item of normiert) {
//                 const coords = await geocodeAdresse(item)
//                 if (coords) result.push({ ...item, ...coords })
//                 // höfliche Rate-Limitierung (Nominatim-Richtlinien)
//                 await new Promise(r => setTimeout(r, 100))
//             }
//             setAnfragen(result)
//         } catch (e) {
//             setFehlermeldung(e?.message || String(e))
//         } finally {
//             setLadeAnfragen(false)
//         }
//     }
//
//     return (
//         //  min-w-full max-w-6xl - removed max-w-6xl, so components are centered.
//         <main className="app mx-auto px-4 my-8">
//             <div className="search-wrap mx-auto w-full md:w-4/5 lg:w-3/4">
//                 <AddressSearch onSelect={handleSelectAddress} />
//             </div>
//
//             {/* Button für "Anfragen laden" */}
//             <div className="search-wrap mx-auto mt-8 w-full md:w-4/5 lg:w-3/4">
//                 {stadt && <span className="text-sm text-gray-600"> Stadt: <strong>{stadt}</strong></span>}
//                 <button
//                     type="button"
//                     className="btn"
//                     onClick={ladeAnfragenFuerAktuelleStadt}
//                     disabled={ladeAnfragen}
//                     aria-busy={ladeAnfragen}
//                 >
//                     {ladeAnfragen ? 'Lade Anfragen…' : 'Anfragen in der Nähe laden'}
//                 </button>
//             </div>
//             {fehlermeldung && (
//                 <div className="mx-auto w-full md:w-4/5 lg:w-3/4 mb-3 text-sm text-red-600">{fehlermeldung}</div>
//             )}
//
//             {/* Karte Component*/}
//             <div className="mx-auto w-full md:w-4/5 lg:w-3/4">
//                 <RadiusMap
//                     center={center}
//                     onGeolocated={handleSelectAddress}
//                     posts={anfragen}              // <— Marker-Daten an die Karte übergeben
//                 />
//             </div>
//         </main>
//     )
// }
//
//
// // // --- file: src/components/OpenStreetMap.jsx ---
// // import React, { useState, useCallback } from 'react'
// // import AddressSearch from './AddressSearch.jsx'
// // import RadiusMap from './RadiusMap.jsx'
// //
// // const DEFAULT_CENTER = [52.520008, 13.404954] // Berlin Fallback
// //
// // export default function OpenStreetMap() {
// //     const [center, setCenter] = useState(DEFAULT_CENTER)
// //
// //     // Stabiler Callback (verhindert unnötige Re-Renders in Kindkomponenten)
// //     const handleSelectAddress = useCallback((lat, lon) => {
// //         setCenter([Number(lat), Number(lon)])
// //     }, [])
// //
// //     return (
// //         <main className="app mx-auto max-w-6xl px-4 my-8">
// //             {/*<header className="app__header">*/}
// //             {/*    <h1 className="text-xl font-semibold text-gray-900">Karte – Bereichssuche</h1>*/}
// //             {/*    <p className="text-sm text-gray-700">Standort ermitteln oder Adresse eingeben, um die Karte neu zu zentrieren.</p>*/}
// //             {/*</header>*/}
// //
// //             {/* Suchleiste: zentriert und auf ~70–80% der Breite begrenzt */}
// //             <div className="search-wrap mx-auto w-full md:w-4/5 lg:w-3/4">
// //                 <AddressSearch onSelect={handleSelectAddress} />
// //             </div>
// //
// //             {/* Karte + Steuerung: ebenfalls zentriert & begrenzt */}
// //             <div className="mx-auto w-full md:w-4/5 lg:w-3/4">
// //                 <RadiusMap center={center} onGeolocated={handleSelectAddress} />
// //             </div>
// //         </main>
// //     )
// // }
