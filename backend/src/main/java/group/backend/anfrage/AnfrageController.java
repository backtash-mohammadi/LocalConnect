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

    @PostMapping(path = "/erstellen")
//    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnfrageErstellenDTO> erstellen(@Valid @RequestBody AnfrageErstellenDTO body){

        Long userId = body.getUserId();

        Anfrage a = anfrageService.createAnfrage(userId, body);
        AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                a.getId(),
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
                    a.getId(),
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

    // Einzelne Anfrage laden (für Vorbefüllung im Frontend)
    @GetMapping("/anfrage/{id}")
// @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnfrageErstellenDTO> holeAnfrage(@PathVariable("id") Long id){
        Anfrage a = anfrageService.findeAnfrage(id);
        AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                a.getId(),
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

    // Anfrage aktualisieren (Bearbeiten)
    @PutMapping("/anfrage/{id}/bearbeiten")
// @PreAuthorize("isAuthenticated()")
    public ResponseEntity<AnfrageErstellenDTO> bearbeiteAnfrage(@PathVariable("id") Long id,
                                                                @Valid @RequestBody AnfrageErstellenDTO body){
        Anfrage a = anfrageService.aktualisiereAnfrage(id, body);
        AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                a.getId(),
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

    @DeleteMapping("/meine-anfragen")
// @PreAuthorize("isAuthenticated()") // optional: re-enable if you use Spring Security
    public ResponseEntity<Void> loescheAnfrage(@RequestParam("id") Long id) {
        anfrageService.loescheAnfrage(id);
        return ResponseEntity.noContent().build();
    }


}

