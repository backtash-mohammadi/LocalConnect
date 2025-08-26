package group.backend.sicherheit.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class RegistrierungAnfrage {
    @NotBlank public String name;
    @NotBlank @Email public String emailAdresse;
    @NotBlank @Size(min = 8) public String passwort;

}
