// --- file: src/components/RadiusMap.jsx ---
import React, { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'
import { FcOk } from "react-icons/fc";
import { PiPhoneCallFill } from "react-icons/pi";
import { BiSolidMapPin } from "react-icons/bi";
import { IoLocationSharp } from "react-icons/io5";

import haushalt from "../assets/haushalt.png";
import nachhilfe from "../assets/nachhilfe.png";
import sonstiges from "../assets/sonstiges.png";
import transport from "../assets/transport.png";
import werkzeuge from "../assets/werkzeuge.png";

// Category → bg class mapping (explicit strings so Tailwind won't purge)
const kategorieFarben = {
    Werkzeuge: 'bg-blue-500',
    Nachhilfe: 'bg-green-600',
    Transport: 'bg-orange-600',
    Haushalt:  'bg-pink-500',
    Sonstiges: 'bg-blue-800'
};

// Return a Tailwind bg class for a given category (fallback to gray)
function kategorieKlasse(kategorieWert) {
    if (!kategorieWert) return 'bg-gray-600';            // defensive fallback
    const key = String(kategorieWert).trim();
    return kategorieFarben[key] || 'bg-gray-600';        // fallback if unknown category
}


function Recenter({ center }) {
    const map = useMap()
    React.useEffect(() => { map.setView(center) }, [center, map])
    return null
}

export default function RadiusMap({
                                      center,
                                      posts = [],
                                      onGeolocated,
                                      /* Neu: Props vom Parent */
                                      stadt,
                                      ladeAnfragen,
                                      fehlermeldung,
                                      onSuche,
                                  }) {
    const [radiusKm, setRadiusKm]   = useState(1)
    const [geoStatus, setGeoStatus] = useState('')
    const [geoMessage, setGeoMessage] = useState('')

    const requestGeolocation = () => {
        if (!('geolocation' in navigator)) {
            setGeoStatus('error')
            setGeoMessage('Geolokalisierung wird von diesem Browser nicht unterstützt. Bitte eine Adresse eingeben.')
            return
        }
        setGeoStatus('locating')
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const { latitude, longitude } = pos.coords
                if (onGeolocated) onGeolocated(latitude, longitude)
                setGeoStatus('granted')
            },
            (err) => {
                setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
                setGeoMessage(err.message || 'Standort konnte nicht ermittelt werden. Bitte Adresse verwenden.')
            },
            { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        )
    }

    const radiusMeters = useMemo(() => radiusKm * 500, [radiusKm])

    const kategorieZaehler = useMemo(() => {
        const acc = {}
        if (!Array.isArray(posts)) return acc
        for (const p of posts) {
            const raw = p.kategorie ?? p.category ?? 'Unbekannt'
            const key = String(raw).trim().toLowerCase() || 'unbekannt'
            acc[key] = (acc[key] || 0) + 1
        }
        return acc
    }, [posts])

    const kategorieListe = useMemo(
        () => Object.entries(kategorieZaehler).sort((a, b) => a[0].localeCompare(b[0])),
        [kategorieZaehler]
    )
    const categoryIconMap = { haushalt, nachhilfe, sonstiges, transport, werkzeuge }

    return (
        <div className="map-wrap bg-gray-100 text-gray-700">
            <div className="controls card">
                <div
                    className="controls__row"
                    style={{ justifyContent: 'space-between', alignItems: 'center', flexWrap: 'revert-layer', gap: 1 }}
                >
                    {/* Linke Seite: Geolocation-Button + Status */}
                    <div className={"flex gap-8"}>
                    <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                        <div>
                            {stadt && <span className="text-lg text-gray-700">Stadt: <strong>{stadt}</strong></span>}
                            {/*<button*/}
                            {/*    type="button"*/}
                            {/*    className="btn"*/}
                            {/*    id="suche-btn"*/}
                            {/*    onClick={onSuche}*/}
                            {/*    disabled={ladeAnfragen}*/}
                            {/*    aria-busy={ladeAnfragen}*/}
                            {/*>*/}
                            {/*    {ladeAnfragen ? 'Lade Anfragen…' : 'in der Nähe suchen'}*/}
                            {/*</button>*/}
                            {fehlermeldung && (
                                <div className="mx-auto w-full md:w-4/5 lg:w-3/4 mb-3 text-sm text-red-600">{fehlermeldung}</div>
                            )}
                        </div>

                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <div className="controls__status">
                            {geoStatus === 'locating' && <span><PiPhoneCallFill /></span>}
                            {geoStatus === 'denied'   && <span></span>}
                            {geoStatus === 'error'    && <span>{geoMessage}</span>}
                            {geoStatus === 'granted'  && <span><FcOk /></span>}
                        </div>
                        {/*<button className="btn" id="ort-btn" type="button" onClick={requestGeolocation}>*/}
                        {/*    Meinen Ort verwenden*/}
                        {/*</button>*/}
                    </div>
                   </div>
                    {/* Rechte Seite: Kategorien + Anzahl */}
                    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-700">
                        {kategorieListe.length === 0 ? (
                            <span className="opacity-70"></span>
                        ) : (
                            kategorieListe.map(([name, count]) => (
                                <div key={name} className="rounded border-b-gray-300 px-2 py-0.5 flex">
                                    <img src={categoryIconMap[name]} alt={name} className="h-8 w-8 shrink-0 rounded-lg object-cover" />
                                    <strong className=" text-lg p-1 text-red-800">{count}</strong>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            <MapContainer
                center={center}
                zoom={12}
                scrollWheelZoom={true}
                className="leaflet-container-custom card"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Recenter center={center} />
                <Circle center={center} radius={radiusMeters} />

                {Array.isArray(posts) && posts
                    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon))
                    .map((p, i) => {
                        const id        = p.id ?? p.post_id ?? p.postId ?? i
                        const pfad      = `/anfrage/${id}`
                        const kategorie = p.kategorie ?? p.category
                        const bgKlasse  = kategorieKlasse(kategorie)
                        const titel     = p.titel || 'Anfrage'
                        return (
                            <CircleMarker
                                key={id}
                                center={[p.lat, p.lon]}
                                radius={6}
                                pathOptions={{ weight: 2, opacity: 0.9 }}
                                eventHandlers={{ click: () => window.open(pfad, '_blank', 'noopener,noreferrer') }}
                            >
                                <Tooltip permanent direction="top" offset={[0, -8]} interactive>
                                    <a
                                        href={pfad}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className={`px-1 py-0.5 rounded text-xl !text-gray-50 italic ${bgKlasse}`}
                                        title={kategorie ? `Kategorie: ${kategorie}` : undefined}
                                    >
                                        {titel}
                                    </a>
                                </Tooltip>
                            </CircleMarker>
                        )
                    })}
            </MapContainer>
        </div>
    )
}
