package group.backend.auth.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class LoginAntwort {
    private String status;     // OK | EMAIL_NICHT_BESTAETIGT | NEUES_GERAET
    private String token;      // JWT
}
