package group.backend.admin;

import group.backend.admin.dto.AdminBenutzerDto;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/** Enthält einfache Admin-Operationen über Benutzer. */
@Service
@RequiredArgsConstructor
public class AdminDienst {

    private final BenutzerRepository benutzerRepository;

    /** Liefert alle Benutzer als Admin-DTOs zurück. */
    @Transactional(readOnly = true)
    public List<AdminBenutzerDto> alleBenutzer() {
        return benutzerRepository.findAll().stream()
                .map(this::inDto)
                .toList();
    }

    /** Setzt den Sperrstatus eines Benutzers. */
    @Transactional
    public AdminBenutzerDto setzeSperrstatus(Long id, boolean gesperrt) {
        Benutzer b = benutzerRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden"));
        b.setGesperrt(gesperrt);
        return inDto(b);
    }

    /** Löscht einen Benutzer endgültig. */
    @Transactional
    public void loescheBenutzer(Long id) {
        if (!benutzerRepository.existsById(id)) {
            throw new IllegalArgumentException("Benutzer nicht gefunden");
        }
        benutzerRepository.deleteById(id);
    }

    /** Liefert Benutzer seitenweise, optional gefiltert nach Suchtext (Name/Email). */
    @Transactional(readOnly = true)
    public Page<AdminBenutzerDto> benutzerSeite(String suchtext, Pageable pageable) {
        Page<Benutzer> seite = (suchtext == null || suchtext.isBlank())
                ? benutzerRepository.findAll(pageable)
                : benutzerRepository.findByNameContainingIgnoreCaseOrEmailAdresseContainingIgnoreCase(
                suchtext.trim(), suchtext.trim(), pageable
        );
        return seite.map(this::inDto);
    }

    private AdminBenutzerDto inDto(Benutzer b) {
        AdminBenutzerDto dto = new AdminBenutzerDto();
        dto.setId(b.getId());
        dto.setName(b.getName());
        dto.setEmailAdresse(b.getEmailAdresse());
        dto.setKarma(b.getKarma());
        dto.setGesperrt(b.isGesperrt());
        dto.setErstelltAm(b.getErstelltAm());
        dto.setFotoUrl(b.getFotoUrl());
        return dto;
    }
}
