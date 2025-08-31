package group.backend.anfrage;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AnfrageRepository extends JpaRepository<Anfrage, Long> {
    Optional<List<Anfrage>> findByErstellerId(Long userId);
    List<Anfrage> findByStadtIgnoreCase(String stadt);

    List<Anfrage> findTop100ByStatusNotIgnoreCaseOrderByErstelltAmDesc(String status);
    List<Anfrage> findTop100ByStatusNotIgnoreCaseAndKategorieIgnoreCaseOrderByErstelltAmDesc(String status, String kategorie);

    Optional<List<Anfrage>> findByHelferIdAndStatusNotIgnoreCase(Long userId, String status);
}