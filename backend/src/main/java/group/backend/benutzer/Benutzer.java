package group.backend.benutzer;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Table(name = "benutzer", uniqueConstraints = @UniqueConstraint(name = "uk_benutzer_email", columnNames = "email_adresse"))
public class Benutzer {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank @Column(nullable = false)
    private String name;

    @Email @NotBlank @Column(name = "email_adresse", nullable = false, length = 160)
    private String emailAdresse;

    @NotBlank @Column(name = "passwort_hash", nullable = false, length = 200)
    private String passwortHash;

    @Column(nullable = false)
    private int karma = 0;

    @Column(length = 1000)
    private String faehigkeiten;

    private String fotoUrl;

    @Column(nullable = false)
    private Instant erstelltAm = Instant.now();

}