package group.backend.auth.dto;

import lombok.Data;

@Data
public class CodeEingabe {
    private String emailAdresse;
    private String code;
    private String geraeteHash;
}
