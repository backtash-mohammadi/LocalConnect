package group.backend.chat;

import com.fasterxml.jackson.annotation.JsonIgnore;
import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "nachrichten")
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class Nachricht {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "konversation_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    private Konversation konversation;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "absender_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Benutzer absender;

    @ManyToOne(fetch = FetchType.LAZY) @JoinColumn(name = "empfaenger_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Benutzer empfaenger;

    @Column(name = "text", nullable = false, length = 4000)
    private String text;

    @Column(name = "erstellt_am", nullable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "gelesen", nullable = false)
    private boolean gelesen;

    @Column(name = "gelesen_am")
    private LocalDateTime gelesenAm;

    @PrePersist
    void onCreate(){ erstelltAm = LocalDateTime.now(); gelesen = false; }
}
