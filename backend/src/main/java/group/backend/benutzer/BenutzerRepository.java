package group.backend.benutzer;

import org.springframework.data.jpa.repository.JpaRepository;


import java.util.Optional;


public interface BenutzerRepository extends JpaRepository<Benutzer, Long> {
    Optional<Benutzer> findByEmailAdresse(String emailAdresse);
    boolean existsByEmailAdresse(String emailAdresse);
}
