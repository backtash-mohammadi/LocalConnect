package group.backend.benutzer;

import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface BenutzerRepository extends JpaRepository<Benutzer, Long> {
    Optional<Benutzer> findByEmailAdresse(String emailAdresse);
    boolean existsByEmailAdresse(String emailAdresse);

    // Sucht nach Name oder E-Mail (Groß-/Kleinschreibung ignorieren) – mit Pagination
    Page<Benutzer> findByNameContainingIgnoreCaseOrEmailAdresseContainingIgnoreCase(
            String nameTeil, String emailTeil, Pageable pageable
    );
}
