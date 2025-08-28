package group.backend.auth.dto;

import lombok.Data;

@Data
public class RegistrierungEingabe {
    private String name;
    private String emailAdresse;
    private String passwort;
}


