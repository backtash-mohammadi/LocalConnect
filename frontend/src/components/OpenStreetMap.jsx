// --- file: src/components/OpenStreetMap.jsx ---
import React, { useState, useCallback, useEffect } from 'react'
import AddressSearch from './AddressSearch.jsx'
import RadiusMap from './RadiusMap.jsx'
import { apiGet, baueQuery } from '../lib/apiClient.js'
import { useSearchParams } from "react-router-dom";

const DEFAULT_CENTER = [52.520008, 13.404954]

export default function OpenStreetMap() {

    const [center, setCenter] = useState(DEFAULT_CENTER)
    const [anfragen, setAnfragen] = useState([])
    const [ladeAnfragen, setLadeAnfragen] = useState(false)
    const [stadt, setStadt] = useState('')
    const [fehlermeldung, setFehlermeldung] = useState('')

    const [params] = useSearchParams();

    useEffect(() => {
        const q = params.get("q");
        if (!q || !q.trim()) return;
        (async () => {
            try {
                const res = await fetch(`/api/geocode/search?q=${encodeURIComponent(q)}&limit=1`, {
                    headers: { Accept: "application/json" }
                });
                if (!res.ok) return;
                const arr = await res.json();
                const hit = Array.isArray(arr) && arr[0];
                if (!hit) return;
                const lat = Number(hit.lat), lon = Number(hit.lon);
                const adr = hit.address || {};
                const stadtVomHit = adr.city || adr.town || adr.village || adr.municipality || "";

                await handleSelectAddress(lat, lon, stadtVomHit);
            } catch { /* ignorieren */ }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [params]);

    const handleSelectAddress = useCallback(async (lat, lon, stadtVomPick) => {
        const neu = [Number(lat), Number(lon)]
        setCenter(neu)

        if (stadtVomPick && stadtVomPick.trim()) {
            setStadt(stadtVomPick)
        } else {
            setStadt('')
            try {
                const s = await ermittleStadtVomCenter(neu)
                if (s) setStadt(s)
            } catch { /* ignorieren */ }
        }
    }, [])

    // Reverse-Geocoding nur wenn Stadt unbekannt
    async function ermittleStadtVomCenter([lat, lon]) {
        const res = await fetch(`/api/geocode/reverse?lat=${lat}&lon=${lon}&zoom=10&addressdetails=1`, {
            headers: { Accept: 'application/json' }
        })
        if (!res.ok) throw new Error('Reverse-Geocoding fehlgeschlagen.')
        const data = await res.json()
        const adr = data?.address || {}
        return adr.city || adr.town || adr.village || adr.municipality || adr.county || ''
    }

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

    const PFAD_ANFRAGEN = '/stadt-anfragen'

    async function ladeAnfragenFuerAktuelleStadt() {
        setFehlermeldung('')
        setLadeAnfragen(true)
        try {
            const s = (stadt && stadt.trim()) ? stadt : await ermittleStadtVomCenter(center)
            if (!s) throw new Error('Stadt konnte aus der Kartenposition nicht ermittelt werden.')
            setStadt(s)

            const daten = await apiGet(`${PFAD_ANFRAGEN}${baueQuery({ city: s })}`)
            const normiert = (Array.isArray(daten) ? daten : []).map(normalisiere)

            const hatKoords = (x) => Number.isFinite(x.lat) && Number.isFinite(x.lon)
            const mitKoords  = normiert.filter(hatKoords)
            const ohneKoords = normiert.filter(x => !hatKoords(x))
            setAnfragen(mitKoords)

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

    // After state declarations and the other hooks
    useEffect(() => {
        // Only trigger when we actually have a city name
        if (stadt && stadt.trim()) {
            // Load the posts for this city (same logic as the "in der Nähe" button)
            ladeAnfragenFuerAktuelleStadt();
        }
    }, [stadt]); // will run after AddressSearch calls onSelect and stadt is set


    return (
        <main className="app max-w-6xl mx-auto px-4 my-8">
            <div className="search-wrap mx-auto w-full md:w-4/5 lg:w-3/4">
                <AddressSearch onSelect={handleSelectAddress} />
            </div>

            {/*/!* Die beiden Divs (Stadt/Buttons + Fehler) wurden entfernt und ins Kind verschoben *!/*/}
            {/*<div>*/}

            {/*</div>*/}
            <div className="mx-auto w-full md:w-4/5 lg:w-3/4">
                <RadiusMap
                    center={center}
                    posts={anfragen}
                    onGeolocated={handleSelectAddress}
                    /* Neu: Props nach unten geben */
                    stadt={stadt}
                    ladeAnfragen={ladeAnfragen}
                    fehlermeldung={fehlermeldung}
                    onSuche={ladeAnfragenFuerAktuelleStadt}
                />
            </div>
        </main>
    )
}
