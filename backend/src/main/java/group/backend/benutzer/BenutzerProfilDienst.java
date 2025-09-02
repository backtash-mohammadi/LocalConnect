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

    @Transactional
    public void avatarSetzen(String email, org.springframework.web.multipart.MultipartFile datei) {
        var b = findePerEmail(email);

        if (datei == null || datei.isEmpty()) {
            throw new IllegalArgumentException("Keine Datei hochgeladen.");
        }
        var contentType = java.util.Optional.ofNullable(datei.getContentType()).orElse("");
        // erlaubte Typen
        if (!(contentType.equals("image/jpeg") || contentType.equals("image/png") || contentType.equals("image/webp"))) {
            throw new IllegalArgumentException("Nur JPEG/PNG/WEBP erlaubt.");
        }
        // max 2 MB
        if (datei.getSize() > 2 * 1024 * 1024) {
            throw new IllegalArgumentException("Datei ist zu groß (max. 2 MB).");
        }

        try (var in = datei.getInputStream()) {
            // optional: auf max 512x512 runterskalieren
            java.io.ByteArrayOutputStream out = new java.io.ByteArrayOutputStream();
            net.coobird.thumbnailator.Thumbnails.of(in)
                    .size(512, 512)
                    .outputQuality(0.9)
                    // Ausgabeformat passend machen
                    .outputFormat("jpeg")
                    .toOutputStream(out);

            b.setAvatarBytes(out.toByteArray());
            b.setAvatarContentType("image/jpeg");
            b.setAvatarGeaendertAm(java.time.Instant.now());
            repo.save(b);
        } catch (java.io.IOException ex) {
            throw new RuntimeException("Hochladen fehlgeschlagen.", ex);
        }
    }

    @Transactional(readOnly = true)
    public BenutzerAvatarAntwort avatarHolen(String email) {
        var b = findePerEmail(email);
        if (b.getAvatarBytes() == null) return null;
        return new BenutzerAvatarAntwort(
                b.getAvatarBytes(),
                b.getAvatarContentType() != null ? b.getAvatarContentType() : "image/jpeg",
                b.getAvatarGeaendertAm()
        );
    }
}