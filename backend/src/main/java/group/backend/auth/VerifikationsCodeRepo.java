package group.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerifikationsCodeRepo extends JpaRepository<VerifikationsCode, Long> {

    void deleteByBenutzer_IdAndTyp(Long benutzerId, VerifikationsTyp typ);

    Optional<VerifikationsCode> findTopByBenutzer_IdAndTypAndCodeAndVerwendetFalse(
            Long benutzerId, VerifikationsTyp typ, String code
    );
}

