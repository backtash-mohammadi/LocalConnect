// --- file: src/components/RadiusMap.jsx ---
import React, { useMemo, useState } from 'react'
import { MapContainer, TileLayer, Circle, CircleMarker, Tooltip, useMap } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

function Recenter({ center }) {
    const map = useMap()
    React.useEffect(() => {
        map.setView(center)
    }, [center, map])
    return null
}

export default function RadiusMap({ center, onGeolocated, posts = [] }) {
    // Standard-Radius: 1 km
    const [radiusKm, setRadiusKm] = useState(1)
    const [geoStatus, setGeoStatus] = useState('idle')
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

    const radiusMeters = useMemo(() => radiusKm * 1000, [radiusKm])
    const quickOptions = [
        { km: 0.5, label: '500 m' },
        { km: 1, label: '1 km' },
        { km: 2, label: '2 km' },
    ]
    const formatRadius = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`)

    return (
        <div className="map-wrap bg-gray-100 text-gray-700">
            <div className="controls card">
                <div className="controls__row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
                    <div className="flex gap-2">
                        <label htmlFor="radius">Radius: <strong>{formatRadius(radiusKm)}</strong></label>
                        <div className="controls__buttons">
                            {quickOptions.map((opt) => (
                                <button
                                    key={opt.km}
                                    className={`btn ${radiusKm === opt.km ? 'btn--active' : ''}`}
                                    onClick={() => setRadiusKm(opt.km)}
                                    type="button"
                                >
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <button className="btn" type="button" onClick={requestGeolocation}>Meinen Standort verwenden</button>
                    </div>
                    <div className="controls__status">
                        {geoStatus === 'locating' && <span>Standort wird angefragt…</span>}
                        {geoStatus === 'denied' && <span>Zugriff auf Standort verweigert.</span>}
                        {geoStatus === 'error' && <span>{geoMessage}</span>}
                        {geoStatus === 'granted' && <span>Standort gesetzt.</span>}
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

                {/* Marker für Anfragen: kleiner Punkt + dauerhafte Titel-Tooltip */}
                {Array.isArray(posts) && posts
                    .filter(p => Number.isFinite(p.lat) && Number.isFinite(p.lon))
                    .map((p, i) => (
                        <CircleMarker
                            key={p.id ?? `${p.titel ?? 'Anfrage'}-${i}`}
                            center={[p.lat, p.lon]}
                            radius={6}
                            pathOptions={{ weight: 2, opacity: 0.9 }}
                        >
                            <Tooltip permanent direction="top" offset={[0, -8]}>
                                {p.titel || 'Anfrage'}
                            </Tooltip>
                        </CircleMarker>
                    ))
                }
            </MapContainer>
        </div>
    )
}



// // --- file: src/components/RadiusMap.jsx ---
// import React, { useMemo, useState } from 'react'
// import { MapContainer, TileLayer, Circle, useMap } from 'react-leaflet'
// import 'leaflet/dist/leaflet.css'
//
// function Recenter({ center }) {
//     const map = useMap()
//     React.useEffect(() => {
//         map.setView(center)
//     }, [center, map])
//     return null
// }
//
// export default function RadiusMap({ center, onGeolocated }) {
//     // Standard-Radius: 1 km
//     const [radiusKm, setRadiusKm] = useState(1)
//     const [geoStatus, setGeoStatus] = useState('idle')
//     const [geoMessage, setGeoMessage] = useState('')
//
//     // Geolokalisierung nur auf Nutzeraktion (Browser-Richtlinien)
//     const requestGeolocation = () => {
//         if (!('geolocation' in navigator)) {
//             setGeoStatus('error')
//             setGeoMessage('Geolokalisierung wird von diesem Browser nicht unterstützt. Bitte eine Adresse eingeben.')
//             return
//         }
//         setGeoStatus('locating')
//         navigator.geolocation.getCurrentPosition(
//             (pos) => {
//                 const { latitude, longitude } = pos.coords
//                 if (onGeolocated) onGeolocated(latitude, longitude)
//                 setGeoStatus('granted')
//             },
//             (err) => {
//                 setGeoStatus(err.code === err.PERMISSION_DENIED ? 'denied' : 'error')
//                 setGeoMessage(err.message || 'Standort konnte nicht ermittelt werden. Bitte Adresse verwenden.')
//             },
//             { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
//         )
//     }
//
//     const radiusMeters = useMemo(() => radiusKm * 1000, [radiusKm])
//
//     const quickOptions = [
//         { km: 0.5, label: '500 m' },
//         { km: 1, label: '1 km' },
//         { km: 2, label: '2 km' },
//     ]
//
//     const formatRadius = (km) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km} km`)
//
//     return (
//         <div className="map-wrap bg-gray-100 text-gray-700">
//             <div className="controls card">
//                 <div className="controls__row" style={{ justifyContent: 'space-between', flexWrap: 'wrap' }}>
//                     <div className={"flex gap-2"}>
//                         <label htmlFor="radius">Radius: <strong>{formatRadius(radiusKm)}</strong></label>
//
//                         <div className="controls__buttons">
//                             {quickOptions.map((opt) => (
//                                 <button
//                                     key={opt.km}
//                                     className={`btn ${radiusKm === opt.km ? 'btn--active' : ''}`}
//                                     onClick={() => setRadiusKm(opt.km)}
//                                     type="button"
//                                 >
//                                     {opt.label}
//                                 </button>
//                             ))}
//                         </div>
//                     </div>
//                     <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
//                         <button className="btn" type="button" onClick={requestGeolocation}>Meinen Standort verwenden</button>
//                     </div>
//                     <div className="controls__status">
//                         {geoStatus === 'locating' && <span>Standort wird angefragt…</span>}
//                         {geoStatus === 'denied' && <span>Zugriff auf Standort verweigert.</span>}
//                         {geoStatus === 'error' && <span>{geoMessage}</span>}
//                         {geoStatus === 'granted' && <span>Standort gesetzt.</span>}
//                     </div>
//                 </div>
//                 {/*<div className="controls__row">*/}
//                 {/*    <input*/}
//                 {/*        id="radius"*/}
//                 {/*        type="range"*/}
//                 {/*        min={0.1}*/}
//                 {/*        max={5}*/}
//                 {/*        step={0.1}*/}
//                 {/*        value={radiusKm}*/}
//                 {/*        onChange={(e) => setRadiusKm(parseFloat(e.target.value))}*/}
//                 {/*    />*/}
//                 {/*/!*</div>*!/*/}
//                 {/*<div className="controls__buttons">*/}
//                 {/*    {quickOptions.map((opt) => (*/}
//                 {/*        <button*/}
//                 {/*            key={opt.km}*/}
//                 {/*            className={`btn ${radiusKm === opt.km ? 'btn--active' : ''}`}*/}
//                 {/*            onClick={() => setRadiusKm(opt.km)}*/}
//                 {/*            type="button"*/}
//                 {/*        >*/}
//                 {/*            {opt.label}*/}
//                 {/*        </button>*/}
//                 {/*    ))}*/}
//                 {/*</div>*/}
//                 {/*<div className="controls__status">*/}
//                 {/*    {geoStatus === 'locating' && <span>Standort wird angefragt…</span>}*/}
//                 {/*    {geoStatus === 'denied' && <span>Zugriff auf Standort verweigert.</span>}*/}
//                 {/*    {geoStatus === 'error' && <span>{geoMessage}</span>}*/}
//                 {/*    {geoStatus === 'granted' && <span>Standort gesetzt.</span>}*/}
//                 {/*</div>*/}
//             </div>
//
//             <MapContainer
//                 center={center}
//                 zoom={12}
//                 scrollWheelZoom={true}
//                 className="leaflet-container-custom card"
//             >
//                 <TileLayer
//                     attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> Mitwirkende'
//                     url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
//                 />
//                 <Recenter center={center} />
//                 <Circle center={center} radius={radiusMeters} />
//             </MapContainer>
//         </div>
//     )
// }
