import { useState, useEffect } from "react";
import { apiGet } from "../lib/apiClient.js";
import userAvatar from "../assets/userAvatarFilled.svg";

export default function TopBenutzern() {
    const [top3, setTop3] = useState([]);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState("");

    // Optional: put a local asset at /public/avatar-default.png or adjust the path
    // const DEFAULT_AVATAR_SRC =
    //     "data:image/svg+xml;utf8," +
    //     encodeURIComponent(`
    //   <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'>
    //     <circle cx='32' cy='32' r='32' fill='#e5e7eb'/>
    //     <circle cx='32' cy='24' r='12' fill='#9ca3af'/>
    //     <path d='M12 54c4-10 16-12 20-12s16 2 20 12' fill='#9ca3af'/>
    //   </svg>
    // `);

    const getAvatarSrc = (avatarBytes, contentType) => {
        if (!avatarBytes) {
            return userAvatar;
        }
        return `data:${contentType || "image/jpeg"};base64,${avatarBytes}`;
    };

    async function ladeTopBenutzern() {
        try {
            setLaden(true);
            setFehler("");
            const daten = await apiGet("/api/benutzer/me/get-top-3");
            setTop3(Array.isArray(daten) ? daten : []);
        } catch (e) {
            setFehler(e?.message || "Fehler beim Laden");
        } finally {
            setLaden(false);
        }
    }

    useEffect(() => {
        ladeTopBenutzern();
    }, []);

    return (
        <div className="flex flex-col gap-3">
            {laden && (
                <p className="text-sm text-gray-600">Lade Benutzer…</p>
            )}

            {fehler && (
                <p className="text-sm text-red-600">{fehler}</p>
            )}

            {!laden && !fehler && top3.length === 0 && (
                <p className="text-sm text-gray-600">Keine Benutzer gefunden.</p>
            )}

            {top3.map((b) => (
                <div
                    key={b.id}
                    className="flex justify-between rounded-xl px-4 py-2 border border-sky-100 bg-gradient-to-br from-white via-yellow-100 to-sky-50 p-2 shadow-sm"
                >
                    {/* Avatar on the right */}
                    <img
                        src={getAvatarSrc(b.avatarBytes, b.avatarContentType)}
                        alt={b.name || "Avatar"}
                        className="h-12 w-12 shrink-0 rounded-full object-cover opacity-80"
                    />
                    {/* Name on the left */}

                    <div className="min-w-0">
                        <p className="truncate text-base font-semibold text-gray-900">
                            {b.name}
                        </p>
                    </div>
                    <div>
                        <p className="text-base  text-gray-900">{b.karma} Punkte</p>
                    </div>

                </div>
            ))}
        </div>
    );
}
