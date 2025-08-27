package group.backend.anfrage;
import group.backend.benutzer.BenutzerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;


/**
 * REST-Controller für das Erstellen von Anfragen.
 */
@RestController
public class AnfrageController {

    private final AnfrageService anfrageService;
    private final BenutzerRepository benutzerRepo;

    public AnfrageController(AnfrageService anfrageService, BenutzerRepository benutzerRepo){
        this.anfrageService = anfrageService; this.benutzerRepo = benutzerRepo;
    }

    /**
     * Endpoint: POST /erstellen – nur für eingeloggte Nutzer.
     */
    @PostMapping(path = "/erstellen")
//    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnfrageErstellenDTO> erstellen(@Valid @RequestBody AnfrageErstellenDTO body){

//        Long userId = AktiverBenutzerResolver.tryExtractUserId(auth);
//        if(userId == null){
//            String username = AktiverBenutzerResolver.tryExtractUsername(auth);
//            userId = benutzerRepo.findByEmail(username).map(u -> u.getId())
//                    .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden: " + username));
//        }

        Long userId = body.getUserId();
//        System.out.println("user id " + userId);

        Anfrage a = anfrageService.createAnfrage(userId, body);
        AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                a.getTitel(),
                a.getBeschreibung(),
                a.getKategorie(),
                a.getStadt(),
                a.getStrasse(),
                a.getPlz(),
                a.getErsteller().getId(),
                0,
                a.getStatus()
        );

        return ResponseEntity.ok(dto);
    }
}
