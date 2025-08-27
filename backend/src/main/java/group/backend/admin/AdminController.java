package group.backend.admin;

import group.backend.admin.dto.AdminBenutzerDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import group.backend.common.dto.SeiteDto;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;
import java.util.Map;

/** Endpunkte für Admin-Funktionen. */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminDienst adminDienst;

    /** Einfache Probe, um Adminrechte im Frontend zu erkennen. */
    @GetMapping("/ping")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> ping() {
        return Map.of("ok", true, "bereich", "admin");
    }

    /** Liefert alle Benutzer (nur für Admin). */
    @GetMapping("/benutzer")
    @PreAuthorize("hasRole('ADMIN')")
    public SeiteDto<AdminBenutzerDto> benutzerSeite(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false, name = "q") String suchtext
    ) {
        // Sortiere stabil nach ID, kannst auf 'name' umstellen bei Bedarf
        PageRequest pageable = PageRequest.of(Math.max(page,0), Math.max(size,1), Sort.by("id").ascending());
        Page<AdminBenutzerDto> seite = adminDienst.benutzerSeite(suchtext, pageable);
        return new SeiteDto<>(
                seite.getContent(),
                seite.getNumber(),
                seite.getSize(),
                seite.getTotalElements(),
                seite.getTotalPages()
        );
    }

    /** Setzt Sperrstatus eines Benutzers (nur für Admin). */
    @PatchMapping("/benutzer/{id}/sperren")
    @PreAuthorize("hasRole('ADMIN')")
    public AdminBenutzerDto sperren(
            @PathVariable Long id,
            @RequestBody Map<String, Boolean> koerper
    ) {
        // Erwartet z.B. { "gesperrt": true }
        boolean gesperrt = Boolean.TRUE.equals(koerper.get("gesperrt"));
        return adminDienst.setzeSperrstatus(id, gesperrt);
    }

    /** Löscht einen Benutzer (nur für Admin). */
    @DeleteMapping("/benutzer/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public Map<String, Object> loeschen(@PathVariable Long id) {
        adminDienst.loescheBenutzer(id);
        return Map.of("ok", true);
    }
}
