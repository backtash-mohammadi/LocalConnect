package group.backend.sicherheit;

import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import group.backend.sicherheit.dto.RegistrierungAnfrage;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
public class BenutzerDienst {
    private final BenutzerRepository benutzerRepository;
    private final PasswordEncoder passwordEncoder;


    public BenutzerDienst(BenutzerRepository benutzerRepository, PasswordEncoder passwordEncoder) {
        this.benutzerRepository = benutzerRepository;
        this.passwordEncoder = passwordEncoder;
    }


    @Transactional
    public Benutzer registrieren(RegistrierungAnfrage anfrage) {
        if (benutzerRepository.existsByEmailAdresse(anfrage.getEmailAdresse())) {
            throw new IllegalArgumentException("Diese E-Mail ist bereits registriert");
        }
        Benutzer b = new Benutzer();
        b.setName(anfrage.getName());
        b.setEmailAdresse(anfrage.getEmailAdresse());
        b.setPasswortHash(passwordEncoder.encode(anfrage.getPasswort()));
        b.setKarma(0); // Startwert
        return benutzerRepository.save(b);
    }


    public Benutzer findePerEmail(String email) {
        return benutzerRepository.findByEmailAdresse(email)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
    }
}
