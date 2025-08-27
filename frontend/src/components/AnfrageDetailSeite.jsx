// src/components/AnfrageDetailSeite.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthKontext';
import { apiGet } from '../lib/apiClient';
import CommentSection from './CommentSection'; // Pfad ggf. anpassen

export default function AnfrageDetailSeite(){
    const { id } = useParams();
    const navigate = useNavigate();
    const { token } = useAuth();
    const [post, setPost] = useState(null);
    const [laden, setLaden] = useState(true);
    const [fehler, setFehler] = useState('');

    useEffect(() => {
        let on = true;
        async function load(){
            setFehler(''); setLaden(true);
            try{
                const data = await apiGet(`/anfrage/${id}`, token); // Endpoint an Backend anpassen
                if(on) setPost(data || null);
            }catch(e){
                if(on) setFehler(e.message || 'Fehler beim Laden');
            }finally{
                if(on) setLaden(false);
            }
        }
        load();
        return () => { on = false; };
    }, [id, token]);

    return (
        <div className="mx-auto max-w-3xl px-4 py-8">
            <div className="mb-4 flex items-center gap-3">
                <button onClick={() => navigate(-1)} className="rounded-lg border px-3 py-1.5 text-sm hover:bg-gray-50">← Zurück</button>
                <h1 className="text-xl font-bold">Anfrage</h1>
            </div>

            {laden && <div className="rounded-2xl border bg-white p-4 text-sm">Lade…</div>}
            {fehler && <div className="rounded-2xl border bg-white p-4 text-sm text-red-700">{fehler}</div>}

            {post && (
                <div className="mb-6 rounded-2xl border bg-white p-4">
                    <h2 className="text-lg font-semibold">{post.titel ?? post.title ?? 'Ohne Titel'}</h2>
                    <p className="mt-2 text-sm text-gray-700">{post.beschreibung ?? post.description}</p>
                    <div className="mt-2 flex flex-wrap gap-2 text-xs text-gray-600">
                        {(post.kategorie ?? post.category) && <span className="rounded-full border px-2 py-0.5">{post.kategorie ?? post.category}</span>}
                        {(post.status) && <span className="rounded-full border px-2 py-0.5">Status: {post.status}</span>}
                        {([post.strasse ?? post.street, post.plz ?? post.postal_code, post.stadt ?? post.city].filter(Boolean).length > 0) && (
                            <span className="rounded-full border px-2 py-0.5">
                {[post.strasse ?? post.street, post.plz ?? post.postal_code, post.stadt ?? post.city].filter(Boolean).join(' • ')}
              </span>
                        )}
                    </div>
                </div>
            )}

            {/* Kommentarbereich – zeigt automatisch „Noch keine Kommentare vorhanden.“ wenn leer */}
            <CommentSection postId={id} onBack={() => navigate(-1)} />
        </div>
    );
}
