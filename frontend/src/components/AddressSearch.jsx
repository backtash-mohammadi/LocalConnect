// --- file: src/components/AddressSearch.jsx ---
import React, { useEffect, useRef, useState } from 'react'

export default function AddressSearch({ onSelect }) {
    // Such-Status
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [open, setOpen] = useState(false)

    // Referenzen für AbortController (zum Abbrechen laufender Requests) und Debounce-Timeout
    const controllerRef = useRef(null)
    const timeoutRef = useRef(null)

    useEffect(() => {
        // 1) Frühzeitiger Ausstieg: keine/zu kurze Eingabe → nichts suchen
        if (!query || query.trim().length < 3) {
            setResults([])
            setOpen(false)
            setError('')
            // laufenden Request abbrechen, falls vorhanden
            if (controllerRef.current) controllerRef.current.abort()
            return
        }

        // 2) Debounce: warte kurz, bis der Nutzer aufhört zu tippen
        setLoading(true)
        setError('')
        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(async () => {
            try {
                // 3) Vorherigen Request abbrechen (Race Conditions vermeiden)
                if (controllerRef.current) controllerRef.current.abort()
                const controller = new AbortController()
                controllerRef.current = controller

                // WICHTIG: Wir rufen den Backend-Proxy auf, NICHT direkt Nominatim.
                // Der Proxy setzt den korrekten User-Agent, drosselt Anfragen, usw.
                const url = `/api/geocode/search?q=${encodeURIComponent(query)}&limit=5`

                const res = await fetch(url, {
                    signal: controller.signal,
                    headers: { Accept: 'application/json' },
                })

                if (!res.ok) {
                    // Freundliche Fehlermeldungen je nach Status (403/429 sind bei Geocodern üblich)
                    let msg = 'Adresse konnte nicht gesucht werden.'
                    if (res.status === 429) msg = 'Zu viele Anfragen. Bitte kurz warten und erneut versuchen.'
                    if (res.status === 403) msg = 'Zugriff verweigert. Bitte später erneut versuchen.'
                    // Backend-Fehlertext mitloggen (optional)
                    try {
                        const t = await res.text()
                        // console.warn('Geocode-Fehler:', res.status, t)
                    } catch {}
                    throw new Error(msg)
                }

                const data = await res.json()
                setResults(Array.isArray(data) ? data : [])
                setOpen(true)
            } catch (e) {
                // Abbruch ist kein echter Fehler (tritt beim schnellen Tippen auf)
                if (e.name !== 'AbortError') {
                    setError(e.message || 'Adresse konnte nicht gesucht werden.')
                    setResults([])
                    setOpen(false)
                }
            } finally {
                setLoading(false)
            }
        }, 400) // Debounce-Zeit (400ms ist ein guter Kompromiss)

        // Cleanup bei Query-Änderung/Unmount
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (controllerRef.current) controllerRef.current.abort()
        }
    }, [query])

    // Auswahl eines Treffers → Liste schließen, Textfeld füllen, Koordinaten melden
    const handlePick = (item) => {
        setOpen(false)
        setResults([])
        setQuery(item.display_name)
        if (onSelect) onSelect(item.lat, item.lon)
    }

    // Enter/“Suchen”-Button → wähle den ersten Treffer (falls vorhanden)
    const handleSubmit = (e) => {
        e.preventDefault()
        if (results[0]) handlePick(results[0])
    }

    return (
        <div className="search card">
            <form
                className="search__row"
                onSubmit={handleSubmit}
                role="search"
                aria-label="Adresse suchen">
                <input
                    className="search__input bg-gray-100 text-gray-700"
                    type="text"
                    placeholder="Straße, Stadt oder Adresse eingeben…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    // UX: Autocomplete aus, damit Browser-Vorschläge die Liste nicht verdecken
                    autoComplete="off"
                />
                <button
                    className="btn bg-gray-100 text-gray-700"
                    type="submit"
                    disabled={loading}
                    aria-busy={loading}
                >
                    {loading ? 'Lädt…' : 'Suchen'}
                </button>
            </form>

            {/* Fehlermeldung (freundlich und kurz) */}
            {error && <div className="search__error">{error}</div>}

            {/* Ergebnisliste */}
            {open && results.length > 0 && (
                <ul className="search__list bg-gray-100 text-gray-700" role="listbox">
                    {results.map((r) => (
                        <li key={`${r.place_id}`} role="option">
                            <button
                                type="button"
                                className="search__item"
                                onClick={() => handlePick(r)}
                                // Zugänglichkeit: sichtbarer Name + ARIA-Label
                                aria-label={r.display_name}
                                title={r.display_name}
                            >
                                {r.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}

            {/* Leerer Zustand (nur anzeigen, wenn offen, nicht lädt und keine Treffer) */}
            {open && !loading && results.length === 0 && (
                <div className="search__empty bg-gray-100 text-gray-700">Keine Treffer</div>
            )}
        </div>
    )
}
