package group.backend.anfrage;

import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;
import lombok.Data;

import java.time.LocalDateTime;

/**
 * Entity für eine Hilfsanfrage ("Anfrage").
 * Mapped auf Tabelle "posts".
 */
@Entity
@Data
@Table(name = "posts_test")
public class Anfrage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "post_id")
    private Long id;

    // Ersteller (Pflicht; verweist auf users.user_id)
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private Benutzer ersteller;

    @Column(name = "title", nullable = false, length = 150)
    private String titel;

    @Column(name = "description", columnDefinition = "TEXT")
    private String beschreibung;

    @Column(name = "category", length = 100)
    private String kategorie;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime erstelltAm = LocalDateTime.now();

    @Column(name = "completed_at")
    private LocalDateTime abgeschlossenAm;

    // Adresse (Pflichtfelder)
    @Column(name = "city", nullable = false, length = 100)
    private String stadt;

    @Column(name = "postal_code", nullable = false, length = 10)
    private String plz;

    @Column(name = "street", nullable = false, length = 150)
    private String strasse;

    // Helfer (optional; verweist auf users.user_id)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "helper_id")
    private Benutzer helfer;

    //    @Convert(converter = AnfrageStatusConverter.class)
    @Column(name = "status", nullable = false, length = 20)
    private String status = "open"; // Standardwert "open"



}

