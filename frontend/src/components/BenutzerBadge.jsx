import { useAuth } from "../context/AuthKontext";

export default function BenutzerBadge() {
    const { benutzer } = useAuth();
    if (!benutzer) return null;
    return (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 px-3 py-1.5 text-sm text-green-700">
            <span className="inline-block h-2 w-2 rounded-full bg-green-500" />
            <span>
        Eingeloggt als <strong className="font-semibold">{benutzer.name}</strong>
        <span className="mx-1">·</span>
        Karma: <strong className="font-semibold">{benutzer.karma}</strong>
      </span>
        </div>
    );
}