package group.backend.benutzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BenutzerUpdateAnfrage {
    @NotBlank public String name;
    public String fotoUrl;
    public String faehigkeiten;

}