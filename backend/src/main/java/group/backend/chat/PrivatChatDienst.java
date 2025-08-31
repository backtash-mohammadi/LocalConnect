package group.backend.chat;

import group.backend.anfrage.Anfrage;
import group.backend.anfrage.AnfrageRepository;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import group.backend.comments.Comment;
import group.backend.comments.CommentRepository;
import group.backend.mail.MailDienst;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PrivatChatDienst {

    @Transactional(readOnly = true)
    public List<KonversationDto> meineKonversationen(Long benutzerId){
        var alle = konvRepo.findByTeilnehmerA_IdOrTeilnehmerB_Id(benutzerId, benutzerId);
        List<KonversationDto> out = new java.util.ArrayList<>();
        for (var k : alle){
            Long partnerId = k.andererTeilnehmerId(benutzerId);
            String partnerName = null;
            if (partnerId != null){
                try {
                    var p = benutzerRepo.findById(partnerId).orElse(null);
                    partnerName = p != null ? p.getName() : null;
                } catch(Exception ignored){}
            }
            long ungelesen = nachrRepo.countUngelesenInKonversation(k.getId(), benutzerId);
            out.add(KonversationDto.builder()
                    .id(k.getId())
                    .partnerId(partnerId)
                    .partnerName(partnerName)
                    .anfrageId(k.getAnfrage()!=null ? k.getAnfrage().getId() : null)
                    .ungelesen(ungelesen)
                    .build());
        }
        return out;
    }


    private final KonversationRepository konvRepo;
    private final NachrichtRepository nachrRepo;
    private final BenutzerRepository benutzerRepo;
    private final AnfrageRepository anfrageRepo;
    private final CommentRepository commentRepo;
    private final MailDienst mail;

    private Benutzer benutzerOder404(Long id){
        return benutzerRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Benutzer nicht gefunden"));
    }
    private Anfrage anfrageOder404(Long id){
        return anfrageRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Anfrage nicht gefunden"));
    }
    private Konversation konvOder404(Long id){
        return konvRepo.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Konversation nicht gefunden"));
    }

    @Transactional
    public Konversation starteVonKommentar(Long kommentarId, Long aktuellerBenutzerId){
        Comment c = commentRepo.findById(kommentarId).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Kommentar nicht gefunden"));
        Anfrage a = c.getPost();
        if (a == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Kommentar ohne Bezug zur Anfrage");
        Benutzer ersteller = a.getErsteller();
        Benutzer helfer = c.getUser();
        if (ersteller == null || helfer == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Teilnehmer fehlen");
        if (!(ersteller.getId().equals(aktuellerBenutzerId) || helfer.getId().equals(aktuellerBenutzerId))){
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Kein Zugriff");
        }
        Long aId = a.getId();
        Long helferId = helfer.getId();
        Long erstellerId = ersteller.getId();
        var vorhanden = konvRepo.findeZwischen(aId, erstellerId, helferId).orElse(null);
        if (vorhanden != null) return vorhanden;
        Konversation k = Konversation.builder()
                .anfrage(a)
                .teilnehmerA(ersteller)
                .teilnehmerB(helfer)
                .build();
        return konvRepo.save(k);
    }

    @Transactional
    public List<Nachricht> ladeNachrichten(Long konvId, Long aktuellerBenutzerId, boolean alsGelesenMarkieren){
        Konversation k = konvOder404(konvId);
        if (!k.enthaeltBenutzer(aktuellerBenutzerId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Kein Zugriff");
        var liste = nachrRepo.findByKonversation_IdOrderByErstelltAmAsc(k.getId());
        if (alsGelesenMarkieren){
            for (var n : liste){
                if (!n.isGelesen() && n.getEmpfaenger() != null && aktuellerBenutzerId.equals(n.getEmpfaenger().getId())) {
                    n.setGelesen(true);
                    n.setGelesenAm(java.time.LocalDateTime.now());
                }
            }
            nachrRepo.saveAll(liste);
        }
        return liste;
    }

    @Transactional
    public Nachricht sende(Long konvId, Long absenderId, String text){
        if (text == null || text.trim().isEmpty()) throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Text fehlt");
        Konversation k = konvOder404(konvId);
        if (!k.enthaeltBenutzer(absenderId)) throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Kein Zugriff");
        Long empfId = k.andererTeilnehmerId(absenderId);
        if (empfId == null) throw new ResponseStatusException(HttpStatus.CONFLICT, "Empfänger fehlt");
        Benutzer abs = benutzerOder404(absenderId);
        Benutzer empf = benutzerOder404(empfId);
        Nachricht n = Nachricht.builder()
                .konversation(k)
                .absender(abs)
                .empfaenger(empf)
                .text(text.trim())
                .build();
        var gespeichert = nachrRepo.save(n);

        try {
            if (empf.getEmailAdresse() != null) {
                mail.sende(empf.getEmailAdresse(),
                        "Neue private Nachricht",
                        "Du hast eine neue private Nachricht von " + (abs.getName() != null ? abs.getName() : "jemandem") + ".\n\nInhalt: " + text.trim());
            }
        } catch (Exception ignored){}
        return gespeichert;
    }

    @Transactional(readOnly = true)
    public long zaehleUngelesen(Long benutzerId){
        return nachrRepo.countByEmpfaenger_IdAndGelesenFalse(benutzerId);
    }
}
