package group.backend.auth;

import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_geraet",
        uniqueConstraints = @UniqueConstraint(columnNames = {"benutzer_id","geraete_hash"}))
public class LoginGeraet {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Benutzer benutzer;

    @Column(name="geraete_hash", length=128, nullable=false)
    private String geraeteHash;

    @Column(nullable=false)
    private LocalDateTime erstelltAm = LocalDateTime.now();

}
