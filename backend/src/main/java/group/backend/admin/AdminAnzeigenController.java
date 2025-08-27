package group.backend.admin;

import group.backend.admin.dto.AdminAnfrageDto;
import group.backend.common.dto.SeiteDto;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

/**
 * Admin-Endpunkte für Anzeigen/Anfragen.
 */
@RestController
@RequestMapping("/api/admin/anzeigen")
@RequiredArgsConstructor
public class AdminAnzeigenController {

    private final AdminAnzeigenDienst adminAnzeigenDienst;

    /** Liefert alle Anzeigen/Anfragen (nur für Admin). */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public SeiteDto<AdminAnfrageDto> alle(
            @RequestParam(defaultValue = "0") int seite,
            @RequestParam(defaultValue = "10") int groesse
    ) {
        return adminAnzeigenDienst.holeAlle(seite, groesse);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public void loeschen(@PathVariable Long id) {
        adminAnzeigenDienst.loeschen(id);
    }
}
