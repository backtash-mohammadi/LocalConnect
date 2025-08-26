package group.backend.sicherheit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BenutzerKurzDto {
    private Long id;
    private String name;
    private String emailAdresse;
    private int karma;
    private String fotoUrl;

}