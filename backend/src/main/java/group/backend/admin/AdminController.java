package group.backend.admin;

import group.backend.admin.dto.AdminBenutzerDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

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
    public List<AdminBenutzerDto> alleBenutzer() {
        return adminDienst.alleBenutzer();
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
