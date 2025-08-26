package group.backend.benutzer;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BenutzerProfilDienst {
    private final BenutzerRepository repo;
    public BenutzerProfilDienst(BenutzerRepository repo){ this.repo = repo; }

    public Benutzer findePerEmail(String email){
        return repo.findByEmailAdresse(email).orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
    }

    @Transactional
    public Benutzer aktualisiereProfil(String email, String name, String fotoUrl, String faehigkeiten){
        var b = findePerEmail(email);
        if(name!=null && !name.trim().isEmpty()) b.setName(name.trim());
        b.setFotoUrl(fotoUrl!=null && !fotoUrl.isBlank()? fotoUrl.trim(): null);
        b.setFaehigkeiten(faehigkeiten!=null? faehigkeiten.trim(): null);
        return repo.save(b);
    }
}