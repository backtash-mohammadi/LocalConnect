package group.backend.auth;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "verifikations_code")
@Getter @Setter
public class VerifikationsCode {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 16)
    private String code;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private VerifikationsTyp typ;

    @ManyToOne(optional = false, fetch = FetchType.LAZY)
    @JoinColumn(name = "benutzer_id", nullable = false)
    private group.backend.benutzer.Benutzer benutzer;

    @Column(name = "ablauf_zeit", nullable = false)
    private LocalDateTime ablaufZeit;

    @CreationTimestamp
    @Column(name = "erstellt_am", nullable = false, updatable = false)
    private LocalDateTime erstelltAm;

    @Column(name = "verwendet", nullable = false)
    private boolean verwendet = false;

    @PrePersist
    void initDefaults() {
        if (ablaufZeit == null) {
            ablaufZeit = LocalDateTime.now().plusMinutes(15);
        }
    }
}
