package group.backend.sicherheit;

import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerDienst;
import group.backend.sicherheit.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;


@RestController
@RequestMapping("/api/auth")
public class AuthController {


    private final BenutzerDienst benutzerDienst;
    private final BenutzerDetailsDienst benutzerDetailsDienst;
    private final JwtDienst jwtDienst;
    private final AuthenticationManager authenticationManager;


    public AuthController(BenutzerDienst benutzerDienst,
                          BenutzerDetailsDienst benutzerDetailsDienst,
                          JwtDienst jwtDienst,
                          AuthenticationManager authenticationManager) {
        this.benutzerDienst = benutzerDienst;
        this.benutzerDetailsDienst = benutzerDetailsDienst;
        this.jwtDienst = jwtDienst;
        this.authenticationManager = authenticationManager;
    }


    @PostMapping("/register")
    public AuthAntwort registrieren(@Valid @RequestBody RegistrierungAnfrage anfrage) {
        Benutzer b = benutzerDienst.registrieren(anfrage);
        UserDetails details = benutzerDetailsDienst.loadUserByUsername(b.getEmailAdresse());
        String token = jwtDienst.erzeugeToken(details);
        return new AuthAntwort(token, BenutzerKonverter.inKurzDto(b));
    }


    @PostMapping("/login")
    public AuthAntwort login(@Valid @RequestBody AnmeldungAnfrage anfrage) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(
                    anfrage.getEmailAdresse(), anfrage.getPasswort()));
        } catch (BadCredentialsException ex) {
            throw new BadCredentialsException("E-Mail oder Passwort ist falsch");
        }
        Benutzer b = benutzerDienst.findePerEmail(anfrage.getEmailAdresse());
        UserDetails details = benutzerDetailsDienst.loadUserByUsername(b.getEmailAdresse());
        String token = jwtDienst.erzeugeToken(details);
        return new AuthAntwort(token, BenutzerKonverter.inKurzDto(b));
    }


    @GetMapping("/me")
    public BenutzerKurzDto ich(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User benutzer) {
        Benutzer b = benutzerDienst.findePerEmail(benutzer.getUsername());
        return BenutzerKonverter.inKurzDto(b);
    }
}