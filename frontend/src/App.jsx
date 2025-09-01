import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MainPage from "./components/MainPage.jsx";
import RegistrationAndSignIn from "./components/RegistrationAndSignIn.jsx";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthKontext.jsx";
import "./App.css";
import ProfilSeite from "./components/ProfilSeite.jsx";
import AdminBenutzerSeite from "./components/AdminBenutzerSeite.jsx";
import AdminAnzeigenSeite from "./components/AdminAnzeigenSeite.jsx";
import AnfrageErstellenSeite from "./components/AnfrageErstellen.jsx";
import MeineAnfragenSeite from "./components/MeineAnfragenSeite.jsx";
import AnfrageBearbeitenSeite from "./components/AnfrageBearbeitenSeite.jsx";
import CommentSection from "./components/CommentSection.jsx";
import AnfrageDetailSeite from "./components/AnfrageDetailSeite.jsx";
import KarteAnzeigen from "./components/KarteAnzeigenSeite.jsx";
import EmailBestaetigenSeite from "./components/EmailBestaetigenSeite.jsx";
import ZweiFaktorSeite from "./components/ZweiFaktorSeite.jsx";
import PasswortAendernSeite from "./components/PasswortAendernSeite.jsx";
import MeineAkzeptierteAnfragen from "./components/MeineAkzeptierteAnfragen.jsx";
import PrivatChatSeite from "./components/PrivatChatSeite.jsx";
import PrivatChatListeSeite from "./components/PrivatChatListeSeite.jsx";
import HilfeSeite from "./components/HilfeSeite.jsx";
import KontaktSeite from "./components/KontaktSeite.jsx";
import DatenschutzSeite from "./components/DatenschutzSeite.jsx";

export function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                {/* Seitenrahmen: volle Höhe, Spalten-Layout */}
                <div className="flex h-dvh min-h-0 flex-col bg-gray-50">
                    {/* Kopfbereich fix in der Höhe */}
                    <div className="shrink-0">
                        <Header />
                    </div>

                    {/* Hauptbereich: darf schrumpfen (min-h-0), bekommt eigene Scrollbar */}
                    <main className="flex-1 min-h-0 overflow-y-auto">
                        <div className="mx-auto max-w-6xl px-4 min-h-0">
                            <Routes>
                                <Route path="/" element={<MainPage />} />
                                <Route path="/login" element={<RegistrationAndSignIn />} />
                                <Route path="/anzeigen" element={<MainPage />} />
                                <Route path="/erstellen" element={<AnfrageErstellenSeite />} />
                                <Route path="/meine-anfragen" element={<MeineAnfragenSeite />} />
                                <Route path="/anfrage/:id/bearbeiten" element={<AnfrageBearbeitenSeite />} />
                                <Route path="/profil" element={<ProfilSeite />} />
                                <Route path="/profil/passwort" element={<PasswortAendernSeite />} />
                                <Route path="/admin" element={<AdminBenutzerSeite />} />
                                <Route path="/admin/anzeigen" element={<AdminAnzeigenSeite />} />
                                <Route path="/anfrage/:id" element={<AnfrageDetailSeite />} />
                                <Route path="/karte" element={<KarteAnzeigen />} />
                                <Route path="/verifizieren" element={<EmailBestaetigenSeite />} />
                                <Route path="/2fa" element={<ZweiFaktorSeite />} />

                                <Route path="/meine-akzeptierte-anfragen" element={<MeineAkzeptierteAnfragen />} />
                                <Route path="/chats" element={<PrivatChatListeSeite />} />
                                <Route path="/chat/:id" element={<PrivatChatSeite/>} />
                                <Route path="/hilfe" element={<HilfeSeite />} />
                                <Route path="/kontakt" element={<KontaktSeite />} />
                                <Route path="/datenschutz" element={<DatenschutzSeite />} />

                            </Routes>
                        </div>
                    </main>

                    {/* Fußbereich fix in der Höhe */}
                    <div className="shrink-0">
                        <Footer />
                    </div>
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
