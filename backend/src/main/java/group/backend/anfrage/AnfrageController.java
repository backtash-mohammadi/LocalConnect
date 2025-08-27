package group.backend.anfrage;
import group.backend.benutzer.BenutzerRepository;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
public class AnfrageController {

    private final AnfrageService anfrageService;
//    private final BenutzerRepository benutzerRepo;

    public AnfrageController(AnfrageService anfrageService, BenutzerRepository benutzerRepo){
        this.anfrageService = anfrageService;
//        this.benutzerRepo = benutzerRepo;
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

    @GetMapping("/meine-anfragen")
    public ResponseEntity<List<AnfrageErstellenDTO>> getBenutzerAnfragen(@RequestParam("userID")  Long userId){

        List<Anfrage> benutzerAnfragen = this.anfrageService.getBenutzerAnfragen(userId);
        List<AnfrageErstellenDTO> anfrageDTOs = new ArrayList<>();

        for(Anfrage a : benutzerAnfragen){
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
            anfrageDTOs.add(dto);
        }
        return ResponseEntity.ok(anfrageDTOs);
    }

//    @GetMapping("/meine-anfragen")
//    @PreAuthorize("isAuthenticated()")
//    public ResponseEntity<List<AnfrageErstellenDTO>> getBenutzerAnfragen(Authentication auth) {
//        // Extract userId from token/principal
//        Long userId = AktiverBenutzerResolver.tryExtractUserId(auth);
//        if (userId == null) {
//            String username = AktiverBenutzerResolver.tryExtractUsername(auth);
//            userId = benutzerRepository.findByEmail(username)
//                    .map(u -> u.getId())
//                    .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden: " + username));
//        }
//
//        // Load requests of this user
//        List<Anfrage> benutzerAnfragen = anfrageService.getBenutzerAnfragen(userId);
//        List<AnfrageErstellenDTO> anfrageDTOs = new ArrayList<>();
//
//        for (Anfrage a : benutzerAnfragen) {
//            AnfrageErstellenDTO dto = new AnfrageErstellenDTO();
//            dto.setTitel(a.getTitel());
//            dto.setBeschreibung(a.getBeschreibung());
//            dto.setKategorie(a.getKategorie());
//            dto.setStadt(a.getStadt());
//            dto.setStrasse(a.getStrasse());
//            dto.setPlz(a.getPlz());
//            // If your DTO needs more fields, set them here
//            anfrageDTOs.add(dto);
//        }
//        return ResponseEntity.ok(anfrageDTOs);
//    }


}

