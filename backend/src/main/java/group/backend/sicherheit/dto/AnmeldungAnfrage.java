package group.backend.sicherheit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnmeldungAnfrage {
    @NotBlank @Email
    private String emailAdresse;
    @NotBlank
    private String passwort;

}