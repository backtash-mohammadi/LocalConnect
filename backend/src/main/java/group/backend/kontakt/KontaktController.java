
package group.backend.kontakt;

import group.backend.mail.MailDienst;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;

@RestController
@RequiredArgsConstructor
@Slf4j
public class KontaktController {

    private final MailDienst mailDienst;

    @Value("${group.admin.emails:}")
    private String adminEmails;

    @PostMapping(path = "/kontakt")
    public ResponseEntity<?> kontakt(@Valid @RequestBody KontaktAnfrage body) {
        String[] empfaenger = Arrays.stream((adminEmails == null ? "" : adminEmails).split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);

        String betreff = (body.getBetreff() == null || body.getBetreff().isBlank())
                ? "Kontaktanfrage"
                : body.getBetreff().trim();

        String text = String.format(
                "Neue Kontaktanfrage:%nName: %s%nE-Mail: %s%nKategorie: %s%nBetreff: %s%n%nNachricht:%n%s%n",
                safe(body.getName()),
                safe(body.getEmail()),
                safe(body.getKategorie()),
                safe(betreff),
                safe(body.getNachricht())
        );

        if (empfaenger.length == 0) {
            log.warn("Kontaktanfrage erhalten, aber group.admin.emails ist leer. Inhalt:\n{}", text);
        } else {
            for (String an : empfaenger) {
                try {
                    mailDienst.sende(an, "[LocalConnect] " + betreff, text);
                } catch (Exception e) {
                    log.error("Fehler beim Senden der Kontakt-Mail an {}: {}", an, e.getMessage(), e);
                }
            }
        }
        return ResponseEntity.accepted().build();
    }

    private static String safe(String s) {
        return s == null ? "" : s;
    }

    @Data
    public static class KontaktAnfrage {
        private String name;
        @NotBlank @Email
        private String email;
        private String kategorie;
        private String betreff;
        @NotBlank
        private String nachricht;
    }
}
