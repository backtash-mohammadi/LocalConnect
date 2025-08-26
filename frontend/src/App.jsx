import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import MainPage from "./components/MainPage.jsx";
import RegistrationAndSignIn from "./components/RegistrationAndSignIn.jsx"; // Falls im src/ liegt
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthKontext.jsx";
import './App.css'


function App() {

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
                          <Route path="/erstellen" element={<div className="mx-auto max-w-6xl px-4 py-8">Formular kommt später…</div>} />
                          <Route path="/profil" element={<div className="mx-auto max-w-6xl px-4 py-8">Profil-Seite (WIP)</div>} />
                      </Routes>
                  </div>
                  <Footer />
              </div>
          </AuthProvider>
      </BrowserRouter>
  )
}

export default App