package group.backend.sicherheit.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class AuthAntwort {
    private String token;
    private BenutzerKurzDto benutzer;

}
