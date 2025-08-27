package group.backend.admin;

import group.backend.admin.dto.AdminAnfrageDto;
import group.backend.anfrage.Anfrage;
import group.backend.anfrage.AnfrageRepository;
import group.backend.common.dto.SeiteDto;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Service-Layer für Admin-sicht auf Anzeigen/Anfragen.
 */
@Service
@RequiredArgsConstructor
public class AdminAnzeigenDienst {

    private final AnfrageRepository anfrageRepository;

    /** Liefert alle Anzeigen/Anfragen als Seite für die Adminliste. */
    @Transactional(readOnly = true)
    public SeiteDto<AdminAnfrageDto> holeAlle(int seite, int groesse) {
        Page<Anfrage> seiteAnfragen = anfrageRepository.findAll(
                PageRequest.of(seite, groesse, Sort.by(Sort.Direction.DESC, "id"))
        );

        List<AdminAnfrageDto> inhalte = seiteAnfragen.getContent().stream()
                .map(this::toDto)
                .toList();

        return new SeiteDto<>(
                inhalte,
                seiteAnfragen.getNumber(),
                seiteAnfragen.getSize(),
                seiteAnfragen.getTotalElements(),
                seiteAnfragen.getTotalPages()
        );
    }

    @Transactional
    public void loeschen(Long id) {
        anfrageRepository.deleteById(id);
    }

    /** Einfache Abbildung Entity -> DTO (nur Felder, die die Liste benötigt). */
    private AdminAnfrageDto toDto(Anfrage a) {
        AdminAnfrageDto dto = new AdminAnfrageDto();
        dto.setId(a.getId());
        // Falls Feldnamen in eurer Entity leicht anders heißen, bitte diese Zeilen anpassen:
        try { dto.setTitle(a.getTitel()); } catch (Exception ignored) {}
        try { dto.setBeschreibung(a.getBeschreibung()); } catch (Exception ignored) {}
        try { dto.setKategorie(a.getKategorie()); } catch (Exception ignored) {}
        try { dto.setStadt(a.getStadt()); } catch (Exception ignored) {}
        try { dto.setPlz(a.getPlz()); } catch (Exception ignored) {}
        try { dto.setStatus(a.getStatus()); } catch (Exception ignored) {}

        try {
            if (a.getErsteller() != null) {
                dto.setErstellerId(a.getErsteller().getId());
                dto.setErstellerName(a.getErsteller().getName());
            }
        } catch (Exception ignored) {}

        try {
            if (a.getHelfer() != null) {
                dto.setHelferId(a.getHelfer().getId());
                dto.setHelferName(a.getHelfer().getName());
            }
        } catch (Exception ignored) {}

        return dto;
    }
}
