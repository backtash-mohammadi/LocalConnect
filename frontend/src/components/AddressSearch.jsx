// --- file: src/components/AddressSearch.jsx ---
import React, { useEffect, useRef, useState } from 'react'

export default function AddressSearch({ onSelect }) {
    const [query, setQuery] = useState('')
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [open, setOpen] = useState(false)

    const controllerRef = useRef(null)
    const timeoutRef = useRef(null)

    useEffect(() => {
        if (!query || query.trim().length < 3) {
            setResults([])
            setOpen(false)
            return
        }

        setLoading(true)
        setError('')

        if (timeoutRef.current) clearTimeout(timeoutRef.current)

        timeoutRef.current = setTimeout(async () => {
            try {
                if (controllerRef.current) controllerRef.current.abort()
                controllerRef.current = new AbortController()

                const url = `https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${encodeURIComponent(query)}&limit=5`
                const res = await fetch(url, {
                    signal: controllerRef.current.signal,
                    headers: { Accept: 'application/json' },
                })
                if (!res.ok) throw new Error('Search failed')
                const data = await res.json()
                setResults(Array.isArray(data) ? data : [])
                setOpen(true)
            } catch (e) {
                if (e.name !== 'AbortError') setError('Adresse konnte nicht gesucht werden.')
            } finally {
                setLoading(false)
            }
        }, 350)

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current)
            if (controllerRef.current) controllerRef.current.abort()
        }
    }, [query])

    const handlePick = (item) => {
        setOpen(false)
        setResults([])
        setQuery(item.display_name)
        if (onSelect) onSelect(item.lat, item.lon)
    }

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
                />
                <button
                    className="btn bg-gray-100 text-gray-700"
                    type="submit"
                    disabled={loading}>{loading ? 'Lädt…' : 'Suchen'}</button>
            </form>
            {error && <div className="search__error">{error}</div>}
            {open && results.length > 0 && (
                <ul className="search__list bg-gray-100 text-gray-700" role="listbox">
                    {results.map((r) => (
                        <li key={`${r.place_id}`} role="option">
                            <button type="button" className="search__item" onClick={() => handlePick(r)}>
                                {r.display_name}
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {open && !loading && results.length === 0 && (
                <div className="search__empty bg-gray-100 text-gray-700">Keine Treffer</div>
            )}
        </div>
    )
}
