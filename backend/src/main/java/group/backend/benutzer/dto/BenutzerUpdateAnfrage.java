package group.backend.benutzer.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class BenutzerUpdateAnfrage {
    @NotBlank public String name; // обязательно
    public String fotoUrl;        // опционально (URL строкой)
    public String faehigkeiten;  // опционально (комма-строка)

}