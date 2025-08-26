package group.backend.sicherheit;

import group.backend.benutzer.Benutzer;
import group.backend.sicherheit.dto.BenutzerKurzDto;


public final class BenutzerKonverter {
    private BenutzerKonverter() {}
    public static BenutzerKurzDto inKurzDto(Benutzer b) {
        return new BenutzerKurzDto(b.getId(), b.getName(), b.getEmailAdresse(), b.getKarma(), b.getFotoUrl());
    }
}
