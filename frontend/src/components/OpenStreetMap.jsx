// --- file: src/components/OpenStreetMap.jsx ---
import React, { useState, useCallback } from 'react'
import AddressSearch from './AddressSearch.jsx'
import RadiusMap from './RadiusMap.jsx'

const DEFAULT_CENTER = [52.520008, 13.404954] // Berlin Fallback

export default function OpenStreetMap() {
    const [center, setCenter] = useState(DEFAULT_CENTER)

    // Stabiler Callback (verhindert unnötige Re-Renders in Kindkomponenten)
    const handleSelectAddress = useCallback((lat, lon) => {
        setCenter([Number(lat), Number(lon)])
    }, [])

    return (
        <main className="app mx-auto max-w-6xl px-4 my-8">
            {/*<header className="app__header">*/}
            {/*    <h1 className="text-xl font-semibold text-gray-900">Karte – Bereichssuche</h1>*/}
            {/*    <p className="text-sm text-gray-700">Standort ermitteln oder Adresse eingeben, um die Karte neu zu zentrieren.</p>*/}
            {/*</header>*/}

            {/* Suchleiste: zentriert und auf ~70–80% der Breite begrenzt */}
            <div className="search-wrap mx-auto w-full md:w-4/5 lg:w-3/4">
                <AddressSearch onSelect={handleSelectAddress} />
            </div>

            {/* Karte + Steuerung: ebenfalls zentriert & begrenzt */}
            <div className="mx-auto w-full md:w-4/5 lg:w-3/4">
                <RadiusMap center={center} onGeolocated={handleSelectAddress} />
            </div>
        </main>
    )
}
