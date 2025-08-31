import React from "react";

import OpenStreetMap from "./OpenStreetMap.jsx";

export default function KarteAnzeigen(){

    return (
        <>
            {/*<header className="app__header">*/}
            {/*    <h1 className="text-xl font-semibold text-gray-900">Karte – Bereichssuche</h1>*/}
            {/*    <p className="text-sm text-gray-700">Standort ermitteln oder Adresse eingeben, um die Karte neu zu zentrieren.</p>*/}
            {/*</header>*/}
            <OpenStreetMap />
        </>

)
}
