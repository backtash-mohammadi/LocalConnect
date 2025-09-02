package group.backend.auth;

import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "login_geraet",
        uniqueConstraints = @UniqueConstraint(
                name="uk_login_geraet",
                columnNames = {"benutzer_id","geraete_hash"}))
public class LoginGeraet {

    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(optional=false, fetch = FetchType.LAZY)
    @JoinColumn(name = "benutzer_id", nullable = false)
    private Benutzer benutzer;

    @Column(name = "geraete_hash", nullable = false, length = 128)
    private String geraeteHash;


    @Column(name = "bezeichnung", nullable = false, length = 255)
    private String bezeichnung;

    @Column(name = "erstellt_am", nullable=false)
    private LocalDateTime erstelltAm = LocalDateTime.now();

    public Long getId() { return id; }
    public Benutzer getBenutzer() { return benutzer; }
    public void setBenutzer(Benutzer b) { this.benutzer = b; }
    public String getGeraeteHash() { return geraeteHash; }
    public void setGeraeteHash(String h) { this.geraeteHash = h; }
    public String getBezeichnung() { return bezeichnung; }
    public void setBezeichnung(String n) { this.bezeichnung = n; }
    public LocalDateTime getErstelltAm() { return erstelltAm; }
}
