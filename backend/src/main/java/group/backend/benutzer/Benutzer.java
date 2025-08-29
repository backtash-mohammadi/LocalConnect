package group.backend.benutzer;

import com.fasterxml.jackson.annotation.JsonBackReference;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.List;
import group.backend.comments.Comment;

import java.time.Instant;



@Data
@AllArgsConstructor
@NoArgsConstructor
@Entity
@Getter
@Setter
@Table(name = "benutzer", uniqueConstraints = @UniqueConstraint(name = "uk_benutzer_email", columnNames = "email_adresse"))
@JsonIgnoreProperties({"hibernateLazyInitializer","handler"})

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

    @Column(nullable = true)
    private String twoFactorToken;

    @Column(nullable = false)
    private boolean gesperrt = false;

    @Column(name="email_bestaetigt", nullable = false)
    private boolean emailBestaetigt = false;

    // Relation to comments
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL, orphanRemoval = true)
    @JsonBackReference("comment-user")
    private List<Comment> comments = new java.util.ArrayList<>();

}