package group.backend.benutzer;

import group.backend.benutzer.dto.BenutzerProfilDto;

public final class BenutzerMapper {
    private BenutzerMapper(){}
    public static BenutzerProfilDto toProfilDto(Benutzer b){
        return new BenutzerProfilDto(b.getId(), b.getName(), b.getEmailAdresse(), b.getKarma(), b.getFotoUrl(), b.getFaehigkeiten(), b.getErstelltAm());
    }
}