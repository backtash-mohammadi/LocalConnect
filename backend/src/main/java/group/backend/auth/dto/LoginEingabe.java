package group.backend.auth.dto;

import lombok.Data;

@Data
public class LoginEingabe {
    private String emailAdresse;
    private String passwort;
    private String geraeteHash;
}
