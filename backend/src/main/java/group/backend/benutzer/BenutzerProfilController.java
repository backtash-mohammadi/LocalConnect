package group.backend.benutzer;

import group.backend.benutzer.dto.*;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/benutzer/me")
public class BenutzerProfilController {
    private final BenutzerProfilDienst dienst;
    public BenutzerProfilController(BenutzerProfilDienst d){ this.dienst = d; }

    @GetMapping
    public BenutzerProfilDto meinProfil(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User u){
        var b = dienst.findePerEmail(u.getUsername());
        return BenutzerMapper.toProfilDto(b);
    }

    @PutMapping
    public BenutzerProfilDto aktualisieren(@org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User u,
                                           @Valid @RequestBody BenutzerUpdateAnfrage req){
        var b = dienst.aktualisiereProfil(u.getUsername(), req.name, req.fotoUrl, req.faehigkeiten);
        return BenutzerMapper.toProfilDto(b);
    }

    @PatchMapping("/passwort")
    public void passwortAendern(
            @AuthenticationPrincipal org.springframework.security.core.userdetails.User u,
            @Valid @RequestBody PasswortAendernAnfrage req
    ){
        dienst.passwortAendern(u.getUsername(), req.getAktuellesPasswort(), req.getNeuesPasswort());
    }

    @PostMapping(path="/avatar", consumes = org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE)
    public void avatarUpload(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User u,
            @org.springframework.web.bind.annotation.RequestPart("datei") org.springframework.web.multipart.MultipartFile datei
    ){
        dienst.avatarSetzen(u.getUsername(), datei);
    }

    @GetMapping("/avatar")
    public org.springframework.http.ResponseEntity<byte[]> avatarAnzeigen(
            @org.springframework.security.core.annotation.AuthenticationPrincipal org.springframework.security.core.userdetails.User u
    ){
        var antwort = dienst.avatarHolen(u.getUsername());
        if (antwort == null) return org.springframework.http.ResponseEntity.notFound().build();

        var headers = new org.springframework.http.HttpHeaders();
        headers.setCacheControl(org.springframework.http.CacheControl.noCache());
        if (antwort.geaendertAm() != null) {
            headers.setLastModified(antwort.geaendertAm().toEpochMilli());
        }
        return org.springframework.http.ResponseEntity
                .ok()
                .contentType(org.springframework.http.MediaType.parseMediaType(antwort.contentType()))
                .headers(headers)
                .body(antwort.daten());
    }
}