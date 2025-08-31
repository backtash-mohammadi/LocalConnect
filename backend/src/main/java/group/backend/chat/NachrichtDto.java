package group.backend.chat;

import lombok.Builder;
import java.time.LocalDateTime;

@Builder
public record NachrichtDto(
        Long id,
        Long absenderId,
        Long empfaengerId,
        String text,
        LocalDateTime erstelltAm,
        boolean gelesen
) {
    public static NachrichtDto from(Nachricht n){
        return NachrichtDto.builder()
                .id(n.getId())
                .absenderId(n.getAbsender()!=null ? n.getAbsender().getId() : null)
                .empfaengerId(n.getEmpfaenger()!=null ? n.getEmpfaenger().getId() : null)
                .text(n.getText())
                .erstelltAm(n.getErstelltAm())
                .gelesen(n.isGelesen())
                .build();
    }
}
