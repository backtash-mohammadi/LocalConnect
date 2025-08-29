package group.backend.sicherheit;

import group.backend.auth.LoginGeraet;
import group.backend.auth.LoginGeraetRepo;
import group.backend.auth.VerifikationsDienst;
import group.backend.auth.VerifikationsTyp;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerDienst;
import group.backend.sicherheit.dto.AuthAntwort;
import group.backend.sicherheit.dto.BenutzerKurzDto;
import group.backend.sicherheit.dto.RegistrierungAnfrage;
import lombok.Data;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
public class AuthVerifikationController {

    private final BenutzerDienst benutzerDienst;
    private final BenutzerDetailsDienst benutzerDetailsDienst;
    private final AuthenticationManager authenticationManager;
    private final JwtDienst jwtDienst;
    private final VerifikationsDienst verifikationsDienst;
    private final LoginGeraetRepo loginGeraetRepo;

    public AuthVerifikationController(BenutzerDienst benutzerDienst,
                                      BenutzerDetailsDienst benutzerDetailsDienst,
                                      AuthenticationManager authenticationManager,
                                      JwtDienst jwtDienst,
                                      VerifikationsDienst verifikationsDienst,
                                      LoginGeraetRepo loginGeraetRepo) {
        this.benutzerDienst = benutzerDienst;
        this.benutzerDetailsDienst = benutzerDetailsDienst;
        this.authenticationManager = authenticationManager;
        this.jwtDienst = jwtDienst;
        this.verifikationsDienst = verifikationsDienst;
        this.loginGeraetRepo = loginGeraetRepo;
    }


    @PostMapping("/registrierung/start")
    @ResponseStatus(HttpStatus.ACCEPTED)
    public SimpleAntwort registrierungStart(@Valid @RequestBody RegistrierungAnfrage anfrage) {
        if (benutzerDienst.existiertEmail(anfrage.getEmailAdresse())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "E-Mail ist bereits registriert");
        }
        Benutzer b = benutzerDienst.registrieren(anfrage);
        verifikationsDienst.sendeCode(b, VerifikationsTyp.REGISTRIERUNG);
        return SimpleAntwort.status("VERIFIKATION_ERFORDERLICH");
    }


    @PostMapping("/registrierung/bestaetigen")
    public SimpleAntwort registrierungBestaetigen(@Valid @RequestBody VerifikationsEingabe req) {
        Benutzer b = benutzerDienst.findePerEmail(req.getEmailAdresse());
        if (b.isEmailBestaetigt()) return SimpleAntwort.status("BEREITS_BESTAETIGT");
        if (!verifikationsDienst.pruefeCode(b, VerifikationsTyp.REGISTRIERUNG, req.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code ist ungültig oder abgelaufen");
        }
        b.setEmailBestaetigt(true);
        benutzerDienst.speichern(b);

        if (req.getGeraeteHash() != null &&
                !req.getGeraeteHash().isBlank() &&
                !loginGeraetRepo.existsByBenutzerIdAndGeraeteHash(b.getId(), req.getGeraeteHash())) {

            String name = req.getGeraeteName();
            if (name == null || name.isBlank()) name = "Unbekanntes Gerät";
            if (name.length() > 255) name = name.substring(0, 255);

            LoginGeraet g = new LoginGeraet();
            g.setBenutzer(b);
            g.setGeraeteHash(req.getGeraeteHash());
            g.setBezeichnung(name);
            loginGeraetRepo.save(g);
        }

        return SimpleAntwort.ok();
    }


    @PostMapping("/login/start")
    public Object loginStart(@Valid @RequestBody AnmeldungMitGeraetAnfrage req) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    req.getEmailAdresse(), req.getPasswort()
            ));
        } catch (BadCredentialsException ex) {
            throw ex;
        }
        Benutzer b = benutzerDienst.findePerEmail(req.getEmailAdresse());
        if (!b.isEmailBestaetigt()) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "E-Mail ist noch nicht bestätigt");
        }
        if (req.getGeraeteHash() != null) {

            if (loginGeraetRepo.existsByBenutzerIdAndGeraeteHash(b.getId(), req.getGeraeteHash())) {
                UserDetails details = benutzerDetailsDienst.loadUserByUsername(b.getEmailAdresse());
                String token = jwtDienst.erzeugeToken(details);
                return new AuthAntwort(token, BenutzerKonverter.inKurzDto(b));
            }


            long anzahl = loginGeraetRepo.countByBenutzer_Id(b.getId());
            if (anzahl == 0) {
                String name = req.getGeraeteName();
                if (name == null || name.isBlank()) name = "Unbekanntes Gerät";
                if (name.length() > 255) name = name.substring(0, 255);

                LoginGeraet g = new LoginGeraet();
                g.setBenutzer(b);
                g.setGeraeteHash(req.getGeraeteHash());
                g.setBezeichnung(name);
                loginGeraetRepo.save(g);

                UserDetails details = benutzerDetailsDienst.loadUserByUsername(b.getEmailAdresse());
                String token = jwtDienst.erzeugeToken(details);
                return new AuthAntwort(token, BenutzerKonverter.inKurzDto(b));
            }
        }


        verifikationsDienst.sendeCode(b, VerifikationsTyp.LOGIN);
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(SimpleAntwort.status("ZWEI_FAKTOR_ERFORDERLICH"));
    }


    @PostMapping("/login/bestaetigen")
    public AuthAntwort loginBestaetigen(@Valid @RequestBody AnmeldungBestaetigenEingabe req) {
        Benutzer b = benutzerDienst.findePerEmail(req.getEmailAdresse());
        if (!verifikationsDienst.pruefeCode(b, VerifikationsTyp.LOGIN, req.getCode())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Code ist ungültig oder abgelaufen");
        }
        if (req.getGeraeteHash() != null) {
            String name = req.getGeraeteName();
            if (name == null || name.isBlank()) {
                name = "Unbekanntes Gerät";
            }
            if (name.length() > 255) {
                name = name.substring(0, 255);
            }

            LoginGeraet g = new LoginGeraet();
            g.setBenutzer(b);
            g.setGeraeteHash(req.getGeraeteHash());
            g.setBezeichnung(name);
            loginGeraetRepo.save(g);
        }
        UserDetails details = benutzerDetailsDienst.loadUserByUsername(b.getEmailAdresse());
        String token = jwtDienst.erzeugeToken(details);
        return new AuthAntwort(token, BenutzerKonverter.inKurzDto(b));
    }


    @PostMapping("/registrierung/code-erneut")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void registrierungCodeErneut(@Valid @RequestBody EmailEingabe req) {
        Benutzer b = benutzerDienst.findePerEmail(req.getEmailAdresse());
        verifikationsDienst.sendeCode(b, VerifikationsTyp.REGISTRIERUNG);
    }

    @PostMapping("/login/code-erneut")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void loginCodeErneut(@Valid @RequestBody EmailEingabe req) {
        Benutzer b = benutzerDienst.findePerEmail(req.getEmailAdresse());
        verifikationsDienst.sendeCode(b, VerifikationsTyp.LOGIN);
    }

    // ===== DTOs =====
    @Data public static class VerifikationsEingabe { private String emailAdresse; private String code;     private String geraeteHash;
        private String geraeteName;}
    @Data public static class AnmeldungMitGeraetAnfrage { private String emailAdresse; private String passwort; private String geraeteHash; private String geraeteName; }
    @Data public static class AnmeldungBestaetigenEingabe { private String emailAdresse; private String code; private String geraeteHash; private String geraeteName; }
    @Data public static class EmailEingabe { private String emailAdresse; }
    @Data public static class SimpleAntwort { private String status; public static SimpleAntwort status(String s){ var a=new SimpleAntwort(); a.status=s; return a; } public static SimpleAntwort ok(){ return status("OK"); } }
}
