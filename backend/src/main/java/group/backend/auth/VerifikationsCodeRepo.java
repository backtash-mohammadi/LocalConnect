package group.backend.auth;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface VerifikationsCodeRepo extends JpaRepository<VerifikationsCode, Long> {
    Optional<VerifikationsCode> findFirstByBenutzerIdAndTypAndCodeAndVerwendetFalse(Long benutzerId, VerifikationsTyp typ, String code);
    @Modifying
    @Query("delete from VerifikationsCode v where v.ablaufZeit < :now or v.verwendet = true")
    int purgeAbgelaufen(@Param("now") LocalDateTime now);
}

