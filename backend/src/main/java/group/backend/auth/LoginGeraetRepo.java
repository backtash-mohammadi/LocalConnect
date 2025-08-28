package group.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;

public interface LoginGeraetRepo extends JpaRepository<LoginGeraet, Long> {
    boolean existsByBenutzerIdAndGeraeteHash(Long benutzerId, String geraeteHash);
    long countByBenutzer_Id(Long benutzerId);
}
