package group.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

/** Kompaktes DTO für die Admin-Ansicht der Benutzerliste. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminBenutzerDto {
    private Long id;
    private String name;
    private String emailAdresse;
    private int karma;
    private boolean gesperrt;
    private Instant erstelltAm;
    private String fotoUrl;
}
