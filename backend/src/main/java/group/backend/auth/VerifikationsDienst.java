package group.backend.auth;

import group.backend.benutzer.Benutzer;
import group.backend.mail.MailDienst;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.concurrent.ThreadLocalRandom;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerifikationsDienst {

    private final VerifikationsCodeRepo verifikationsCodeRepo;
    private final MailDienst mailDienst;

    @Value("${app.debug-mail:false}")
    private boolean debugMail;

    private String erzeuge6stelligenCode() {
        int n = ThreadLocalRandom.current().nextInt(0, 1_000_000);
        return String.format("%06d", n);
    }

    @Transactional
    public void sendeCode(Benutzer benutzer, VerifikationsTyp typ) {
        // старые коды этого типа удаляем
        verifikationsCodeRepo.deleteByBenutzer_IdAndTyp(benutzer.getId(), typ);

        String code = erzeuge6stelligenCode();
        VerifikationsCode vc = new VerifikationsCode();
        vc.setBenutzer(benutzer);
        vc.setTyp(typ);
        vc.setCode(code);
        vc.setAblaufZeit(LocalDateTime.now().plusMinutes(15));

        verifikationsCodeRepo.save(vc);

        String betreff = (typ == VerifikationsTyp.REGISTRIERUNG)
                ? "Bestätige deine E-Mail"
                : "Dein Anmeldecode";
        String text = (typ == VerifikationsTyp.REGISTRIERUNG)
                ? "Dein LocalConnect-Bestätigungscode lautet: %s".formatted(code)
                : "Dein LocalConnect-Code lautet: %s".formatted(code);

        if (debugMail) {
            log.warn("DEBUG-MAIL aktiv: Code für {} an {} = {}", typ, benutzer.getEmailAdresse(), code);
            return;
        }

        mailDienst.sende(benutzer.getEmailAdresse(), betreff, text);
    }

    @Transactional
    public boolean pruefeCode(Benutzer benutzer, VerifikationsTyp typ, String code) {
        var opt = verifikationsCodeRepo.findTopByBenutzer_IdAndTypAndCodeAndVerwendetFalse(
                benutzer.getId(), typ, code
        );
        if (opt.isEmpty()) return false;

        var vc = opt.get();
        if (vc.getAblaufZeit().isBefore(LocalDateTime.now())) {

            verifikationsCodeRepo.delete(vc);
            return false;
        }

        vc.setVerwendet(true);
        verifikationsCodeRepo.save(vc);

        verifikationsCodeRepo.deleteByBenutzer_IdAndTyp(benutzer.getId(), typ);

        return true;
    }
}
