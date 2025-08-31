package group.backend.chat;

import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/privatchats")
@RequiredArgsConstructor
public class PrivatChatController {

    private final PrivatChatDienst dienst;
    private final BenutzerRepository benutzerRepo;

    private Long holeAktuelleBenutzerId(org.springframework.security.core.userdetails.User principal){
        if (principal == null) return null;
        String email = principal.getUsername();
        if (email == null) return null;
        return benutzerRepo.findByEmailAdresse(email).map(Benutzer::getId).orElse(null);
    }

    
    @GetMapping("/")
    public ResponseEntity<List<KonversationDto>> liste(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal){
        Long me = holeAktuelleBenutzerId(principal);
        if (me == null) return ResponseEntity.status(401).build();
        return ResponseEntity.ok(dienst.meineKonversationen(me));
    }

@PostMapping("/von-kommentar/{kommentarId}")
    public ResponseEntity<?> starteVonKommentar(@PathVariable Long kommentarId,
                                                @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal){
        Long me = holeAktuelleBenutzerId(principal);
        if (me == null) return ResponseEntity.status(401).body(java.util.Map.of("nachricht","Nicht angemeldet"));
        var k = dienst.starteVonKommentar(kommentarId, me);
        return ResponseEntity.ok(java.util.Map.of("konversationId", k.getId()));
    }

    @GetMapping("/{konvId}/nachrichten")
    public ResponseEntity<List<NachrichtDto>> nachrichten(@PathVariable Long konvId,
                                                          @RequestParam(name="alsGelesen", defaultValue="true") boolean alsGelesen,
                                                          @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal){
        Long me = holeAktuelleBenutzerId(principal);
        if (me == null) return ResponseEntity.status(401).build();
        var liste = dienst.ladeNachrichten(konvId, me, alsGelesen).stream().map(NachrichtDto::from).toList();
        return ResponseEntity.ok(liste);
    }

    public static record SendeAnfrage(String text){}
    @PostMapping("/{konvId}/nachrichten")
    public ResponseEntity<NachrichtDto> senden(@PathVariable Long konvId,
                                               @RequestBody SendeAnfrage body,
                                               @AuthenticationPrincipal org.springframework.security.core.userdetails.User principal){
        Long me = holeAktuelleBenutzerId(principal);
        if (me == null) return ResponseEntity.status(401).build();
        var gespeichert = dienst.sende(konvId, me, body != null ? body.text() : null);
        return ResponseEntity.ok(NachrichtDto.from(gespeichert));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<java.util.Map<String,Long>> ungelesen(@AuthenticationPrincipal org.springframework.security.core.userdetails.User principal){
        Long me = holeAktuelleBenutzerId(principal);
        if (me == null) return ResponseEntity.status(401).body(java.util.Map.of("anzahl", 0L));
        long anzahl = dienst.zaehleUngelesen(me);
        return ResponseEntity.ok(java.util.Map.of("anzahl", anzahl));
    }
}
