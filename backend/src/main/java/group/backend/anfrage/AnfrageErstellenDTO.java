package group.backend.anfrage;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Eingabe-DTO für das Erstellen einer Anfrage.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AnfrageErstellenDTO {

    private long id;
//    @NotBlank @Size(max = 150)
    private String titel;

    private String beschreibung;

    @Size(max = 100)
    private String kategorie;

    @NotBlank
    private String stadt;

    @NotBlank
    private String strasse;

    @NotBlank
    private String plz;

    @NotNull
    //@jakarta.validation.constraints.Positive
    private long userId;

    private long helperId;

    private String status;

//    public AnfrageErstellenDTO(String beschreibung, String kategorie, String stadt) {
//    }
}

