package group.backend.benutzer;

import lombok.RequiredArgsConstructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/benutzer")
@RequiredArgsConstructor
public class BenutzerOeffentlichController {

    private final BenutzerRepository repo;
    private final BenutzerProfilDienst dienst;

    @GetMapping("/{id}/avatar")
    public ResponseEntity<byte[]> avatarVon(@PathVariable Long id) {
        var benutzer = repo.findById(id).orElse(null);
        if (benutzer == null) return ResponseEntity.notFound().build();

        var antwort = dienst.avatarHolen(benutzer.getEmailAdresse());
        if (antwort == null) return ResponseEntity.notFound().build();

        HttpHeaders headers = new HttpHeaders();
        headers.setCacheControl(CacheControl.noCache());
        if (antwort.geaendertAm() != null) {
            headers.setLastModified(antwort.geaendertAm().toEpochMilli());
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(antwort.contentType()))
                .headers(headers)
                .body(antwort.daten());
    }
}
