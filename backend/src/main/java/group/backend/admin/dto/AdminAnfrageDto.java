package group.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Admin-DTO für eine Anzeige/Anfrage.
 * Einfach gehalten für die Admin-Liste.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class AdminAnfrageDto {
    private Long id;
    private String title;
    private String beschreibung;
    private String kategorie;
    private String stadt;
    private String plz;
    private String status;

    private Long erstellerId;
    private String erstellerName;

    private Long helferId;
    private String helferName;
}
