package group.backend.benutzer.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BenutzerProfilDto {
    public Long id;
    public String name;
    public String emailAdresse;
    public int karma;
    public String fotoUrl;
    public String faehigkeiten;
    public Instant erstelltAm;
}