package group.backend.chat;

import com.fasterxml.jackson.annotation.JsonIgnore;
import group.backend.anfrage.Anfrage;
import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "konversationen")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Konversation {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "anfrage_id")
    @JsonIgnore
    private Anfrage anfrage;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "teilnehmer_a_id", nullable = false)
    private Benutzer teilnehmerA;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "teilnehmer_b_id", nullable = false)
    private Benutzer teilnehmerB;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "aktualisiert_am", nullable = false)
    private LocalDateTime aktualisiertAm;

    @PrePersist
    void onCreate(){ erstelltAm = aktualisiertAm = LocalDateTime.now(); }

    @PreUpdate
    void onUpdate(){ aktualisiertAm = LocalDateTime.now(); }

    @JsonIgnore
    public boolean enthaeltBenutzer(Long benutzerId){
        if (benutzerId == null) return false;
        return (teilnehmerA != null && benutzerId.equals(teilnehmerA.getId()))
            || (teilnehmerB != null && benutzerId.equals(teilnehmerB.getId()));
    }

    @JsonIgnore
    public Long andererTeilnehmerId(Long meineId){
        if (teilnehmerA != null && meineId != null && meineId.equals(teilnehmerA.getId())) {
            return teilnehmerB != null ? teilnehmerB.getId() : null;
        }
        if (teilnehmerB != null && meineId != null && meineId.equals(teilnehmerB.getId())) {
            return teilnehmerA != null ? teilnehmerA.getId() : null;
        }
        return null;
    }
}
