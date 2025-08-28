package group.backend.auth;

import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "verifikations_code")
public class VerifikationsCode {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional = false)
    private Benutzer benutzer;

    @Enumerated(EnumType.STRING)
    private VerifikationsTyp typ;

    @Column(length = 6, nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDateTime ablaufZeit;

    @Column(nullable = false)
    private boolean verwendet = false;

    @Column(nullable = false)
    private LocalDateTime erstelltAm = LocalDateTime.now();

}

