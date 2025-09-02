package group.backend.anfrage;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerDienst;
import group.backend.benutzer.BenutzerRepository;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;


@RestController
@RequiredArgsConstructor
public class AnfrageController {

    private final AnfrageService anfrageService;
    private final BenutzerDienst benutzerDienst;
    private final AnfrageRepository anfrageRepository;

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
                a.getStatus(),
                a.getLat(),
                a.getLon()
        );

        return ResponseEntity.ok(dto);
    }

    @GetMapping("/stadt-anfragen")
    public ResponseEntity<List<AnfrageErstellenDTO>> ladeAnfragenNachStadt(
            @RequestParam("city") String stadt) {

        List<Anfrage> anfragen = anfrageService.findeAnfragenNachStadt(stadt);

        System.out.println(" test anf. : " + anfragen.toString());

        // This method might need to be changed later, depending on what we need to do.
        List<AnfrageErstellenDTO> anfrageDTOs = new ArrayList<>();
        for(Anfrage a : anfragen){
            long helferId = a.getHelfer() == null ? 0 : a.getHelfer().getId();

            if(!a.getStatus().equalsIgnoreCase("fertig")) {
                AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                        a.getId(),
                        a.getTitel(),
                        a.getBeschreibung(),
                        a.getKategorie(),
                        a.getStadt(),
                        a.getStrasse(),
                        a.getPlz(),
                        a.getErsteller().getId(),
                        helferId,
                        a.getStatus(),
                        a.getLat(),
                        a.getLon()
                );
                anfrageDTOs.add(dto);
            }
        }

        return ResponseEntity.ok(anfrageDTOs);
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
                    a.getStatus(),
                    a.getLat(),
                    a.getLon()

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

        long helperId = 0L;

        if(a.getHelfer() != null && a.getHelfer().getId() != null){
            helperId = a.getHelfer().getId();
        }

        AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                a.getId(),
                a.getTitel(),
                a.getBeschreibung(),
                a.getKategorie(),
                a.getStadt(),
                a.getStrasse(),
                a.getPlz(),
                a.getErsteller().getId(),
                helperId,
                a.getStatus(),
                a.getLat(),
                a.getLon()
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
                a.getStatus(),
                a.getLat(),
                a.getLon()
        );
        return ResponseEntity.ok(dto);
    }

    @PutMapping("/anfrage/{id}/fertig/{karmaPunkte}")
// @PreAuthorize("isAuthenticated()") // enable if you use auth
    public ResponseEntity<Void> markiereAlsFertig(@PathVariable("id") Long id, @PathVariable("karmaPunkte") int punkte) {
        // long userId = anfrageService.findeAnfrage(id).getErsteller().getId();

        anfrageService.markiereAlsFertig(id);

        Benutzer helfer = anfrageService.findeAnfrage(id).getHelfer();
        Benutzer ersteller = anfrageService.findeAnfrage(id).getErsteller();
        if(helfer != null && punkte != 0){
            benutzerDienst.rechnePunkte(ersteller, helfer, punkte);
        } else {
            System.out.println("Fehler bei Punkte rechnung...");
        }
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/meine-anfragen")
// @PreAuthorize("isAuthenticated()") // optional: re-enable if you use Spring Security
    public ResponseEntity<Void> loescheAnfrage(@RequestParam("id") Long id) {
        anfrageService.loescheAnfrage(id);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("true")
    @GetMapping({"/anfragen/aktuell", "/api/anfragen/aktuell"})
    public ResponseEntity<List<AnfrageErstellenDTO>> ladeAktuelleAnfragen(
            @RequestParam(value = "kategorie", required = false) String kategorie,
            @RequestParam(value = "limit", required = false, defaultValue = "12") int limit
    ) {
        // Alles außer „fertig“ zeigen
        final String FERTIG = "fertig";

        List<Anfrage> rohListe = (kategorie != null && !kategorie.isBlank())
                ? anfrageRepository.findTop100ByStatusNotIgnoreCaseAndKategorieIgnoreCaseOrderByErstelltAmDesc(FERTIG, kategorie)
                : anfrageRepository.findTop100ByStatusNotIgnoreCaseOrderByErstelltAmDesc(FERTIG);


        // In DTOs abbilden und auf gewünschte Anzahl begrenzen
        List<AnfrageErstellenDTO> dtoListe = new ArrayList<>();
        for (Anfrage a : rohListe) {
            if (dtoListe.size() >= Math.max(1, limit)) break;
            if (a.getStatus() != null && a.getStatus().equalsIgnoreCase(FERTIG)) continue;


            long helferId = (a.getHelfer() == null) ? 0 : a.getHelfer().getId();

            AnfrageErstellenDTO dto = new AnfrageErstellenDTO(
                    a.getId(),
                    a.getTitel(),
                    a.getBeschreibung(),
                    a.getKategorie(),
                    a.getStadt(),
                    a.getStrasse(),
                    a.getPlz(),
                    a.getErsteller() != null ? a.getErsteller().getId() : 0,
                    helferId,
                    a.getStatus(),
                    a.getLat(),
                    a.getLon()
            );
            dtoListe.add(dto);
        }


        return ResponseEntity.ok(dtoListe);
    }

    @GetMapping("/akzeptierte-anfragen")
    public ResponseEntity<List<AnfrageErstellenDTO>> getAkzeptierteAnfragen(@RequestParam("userId")  Long userId){

        List<Anfrage> benutzerAnfragen = this.anfrageService.getAkzeptierteAnfragen(userId);
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
                    a.getHelfer().getId(),
                    a.getStatus(),
                    a.getLat(),
                    a.getLon()

            );
            anfrageDTOs.add(dto);
        }
        return ResponseEntity.ok(anfrageDTOs);
    }

    @PutMapping("/anfrage/bearbeitung/{id}/{helferId}")
    // @PreAuthorize("isAuthenticated()") // enable if you use auth
    public ResponseEntity<Long> PutHelferIdUndStatusBearbeitung(@PathVariable("id") Long id, @PathVariable("helferId") Long helferId) {

        Benutzer helfer = benutzerDienst.findePerId(helferId);
        long helferIdDerAnfrage = anfrageService.markiereAlsBearbeitung(id, helfer);

        return ResponseEntity.ok(helferIdDerAnfrage);
    }

}

