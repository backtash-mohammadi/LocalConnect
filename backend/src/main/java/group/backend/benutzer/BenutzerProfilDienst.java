package group.backend.benutzer;

import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BenutzerProfilDienst {
    private final BenutzerRepository repo;
    private final PasswordEncoder passwortEncoder;

    public Benutzer findePerEmail(String email) {
        return repo.findByEmailAdresse(email).orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
    }

    @Transactional
    public Benutzer aktualisiereProfil(String email, String name, String fotoUrl, String faehigkeiten) {
        var b = findePerEmail(email);
        if (name != null && !name.trim().isEmpty()) b.setName(name.trim());
        b.setFotoUrl(fotoUrl != null && !fotoUrl.isBlank() ? fotoUrl.trim() : null);
        b.setFaehigkeiten(faehigkeiten != null ? faehigkeiten.trim() : null);
        return repo.save(b);
    }

    /**
     * Ändert das Passwort des eingeloggten Benutzers.
     * Prüft zunächst das aktuelle Passwort und speichert dann das neue (BCrypt).
     */
    @Transactional
    public void passwortAendern(String email, String aktuellesPasswort, String neuesPasswort) {
        var b = findePerEmail(email);
        if (aktuellesPasswort == null || neuesPasswort == null) {
            throw new IllegalArgumentException("Passwörter dürfen nicht leer sein.");
        }
        if (!passwortEncoder.matches(aktuellesPasswort, b.getPasswortHash())) {
            throw new IllegalArgumentException("Aktuelles Passwort ist falsch.");
        }
        if (neuesPasswort.length() < 8) {
            throw new IllegalArgumentException("Neues Passwort muss mindestens 8 Zeichen haben.");
        }
        b.setPasswortHash(passwortEncoder.encode(neuesPasswort));
        repo.save(b);
    }
}