package group.backend.anfrage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnfrageRepository extends JpaRepository<Anfrage, Long> {
    Optional<List<Anfrage>> findByErstellerId(Long userId);
    List<Anfrage> findByStadt(String stadt);
}