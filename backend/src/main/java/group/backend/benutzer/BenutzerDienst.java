package group.backend.benutzer;

import group.backend.sicherheit.dto.RegistrierungAnfrage;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
@RequiredArgsConstructor
public class BenutzerDienst {

    private final BenutzerRepository repo;
    private final PasswordEncoder passwortEncoder;

    /** Prüft, ob die E-Mail bereits existiert. */
    public boolean existiertEmail(String emailAdresse) {
        return repo.existsByEmailAdresse(emailAdresse);
    }

    /** Lädt Benutzer per E-Mail oder wirft 404. */
    public Benutzer findePerEmail(String emailAdresse) {
        return repo.findByEmailAdresse(emailAdresse)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benutzer nicht gefunden"));
    }

    /** Speichert Änderungen am Benutzer. */
    public Benutzer speichern(Benutzer benutzer) {
        return repo.save(benutzer);
    }

    /** Legt einen neuen Benutzer an (E-Mail noch nicht bestätigt). */
    @Transactional
    public Benutzer registrieren(RegistrierungAnfrage anfrage) {
        if (existiertEmail(anfrage.getEmailAdresse())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail ist bereits registriert");
        }
        var b = new Benutzer();
        b.setName(anfrage.getName());
        b.setEmailAdresse(anfrage.getEmailAdresse());
        // Feldname ggf. an dein Entity anpassen (z. B. passwortHash)
        b.setPasswortHash(passwortEncoder.encode(anfrage.getPasswort()));
        b.setEmailBestaetigt(false);
        b.setKarma(0);
        return repo.save(b);
    }
}
