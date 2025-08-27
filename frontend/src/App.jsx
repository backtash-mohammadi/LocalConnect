import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MainPage from "./components/MainPage.jsx";
import RegistrationAndSignIn from "./components/RegistrationAndSignIn.jsx"; // Falls im src/ liegt
import {BrowserRouter, Routes, Route} from "react-router-dom";
import { AuthProvider } from "./context/AuthKontext.jsx";
import './App.css'
import ProfilSeite from "./components/ProfilSeite.jsx";
import AdminBenutzerSeite from "./components/AdminBenutzerSeite.jsx";
import AdminAnzeigenSeite from "./components/AdminAnzeigenSeite.jsx";

import AnfrageErstellenSeite from "./components/AnfrageErstellen.jsx";
import MeineAnfragenSeite from "./components/MeineAnfragenSeite.jsx";
import AnfrageBearbeitenSeite from "./components/AnfrageBearbeitenSeite.jsx";
import CommentSection from "./components/CommentSection.jsx";
import AnfrageDetailSeite from "./components/AnfrageDetailSeite.jsx";

export function App() {




    return (
        <BrowserRouter>
            <AuthProvider>
                <div className="flex min-h-screen flex-col bg-gray-50">
                    <Header />
                    <div className="flex-1">
                        <Routes>
                            <Route path="/" element={<MainPage />} />
                            <Route path="/login" element={<RegistrationAndSignIn />} />
                            <Route path="/anzeigen" element={<MainPage />} />
                            {/*<Route path="/erstellen" element={<div className="mx-auto max-w-6xl px-4 py-8">Formular kommt später…</div>} />*/}
                            <Route path="/erstellen" element={<AnfrageErstellenSeite />} />
                            <Route path="/meine-anfragen" element={<MeineAnfragenSeite />} />
                            <Route path="/anfrage/:id/bearbeiten" element={<AnfrageBearbeitenSeite />} />

                            <Route path="/profil" element={<ProfilSeite />} />
                            <Route path="/admin" element={<AdminBenutzerSeite />} />
                            <Route path="/admin/anzeigen" element={<AdminAnzeigenSeite />} />
                            <Route path="/anfrage/:id" element={<AnfrageDetailSeite />} />
                        </Routes>
                    </div>
                    <Footer />
                </div>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App

