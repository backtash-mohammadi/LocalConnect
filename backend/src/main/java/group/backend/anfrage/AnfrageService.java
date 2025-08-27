package group.backend.anfrage;
//import com.localconnect.anfrage.domain.*;
//import com.localconnect.anfrage.repo.*;
//import com.localconnect.anfrage.web.dto.*;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;


/**
 * Geschäftslogik für Anfragen.
 */
@Service
public class AnfrageService {
    private final AnfrageRepository anfrageRepository;
    private final BenutzerRepository benutzerRepository;


    public AnfrageService(AnfrageRepository anfrageRepository, BenutzerRepository benutzerRepository) {
        this.anfrageRepository = anfrageRepository; this.benutzerRepository = benutzerRepository;
    }

    @Transactional
    public Anfrage createAnfrage(Long erstellerUserId, AnfrageErstellenDTO dto){
        Benutzer ersteller = benutzerRepository.findById(erstellerUserId)
                .orElseThrow(() -> new IllegalArgumentException("Benutzer nicht gefunden: " + erstellerUserId));

        Anfrage a = new Anfrage();
        a.setErsteller(ersteller);
        a.setTitel(dto.getTitel());
        a.setBeschreibung(dto.getBeschreibung());
        a.setKategorie(dto.getKategorie());
        a.setStadt(dto.getStadt());
        a.setStrasse(dto.getStrasse());
        a.setPlz(dto.getPlz());
        a.setStatus("open");

        return anfrageRepository.save(a);
    }

    @Transactional
    public List<Anfrage> getBenutzerAnfragen(Long userId) {
        Optional<List<Anfrage>> anfragenOptional = this.anfrageRepository.findByErstellerId(userId);
        if(anfragenOptional.isEmpty()){
            throw new IllegalArgumentException("Benutzer nicht gefunden: " + userId);
        }
        List<Anfrage> anfrageList = anfragenOptional.orElse(new ArrayList<>());

        return anfrageList;
    }




}