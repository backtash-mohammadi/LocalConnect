package group.backend.chat;

import lombok.Builder;

@Builder
public record KonversationDto(
        Long id,
        Long partnerId,
        String partnerName,
        Long anfrageId,
        long ungelesen
) {}
