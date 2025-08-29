package group.backend.benutzer.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * Eingabe für das Ändern des Passworts.
 */
@Data
public class PasswortAendernAnfrage {

    @NotBlank(message = "Aktuelles Passwort darf nicht leer sein.")
    private String aktuellesPasswort;

    @NotBlank(message = "Neues Passwort darf nicht leer sein.")
    @Size(min = 8, message = "Neues Passwort muss mindestens 8 Zeichen lang sein.")
    private String neuesPasswort;

}

