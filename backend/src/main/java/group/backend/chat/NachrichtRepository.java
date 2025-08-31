package group.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface NachrichtRepository extends JpaRepository<Nachricht, Long> {
    List<Nachricht> findByKonversation_IdOrderByErstelltAmAsc(Long konversationId);

    long countByEmpfaenger_IdAndGelesenFalse(Long empfaengerId);

    @Query("""
        select count(n) from Nachricht n
        where n.konversation.id = :konvId and n.empfaenger.id = :empfId and n.gelesen = false
    """)
    long countUngelesenInKonversation(@Param("konvId") Long konvId, @Param("empfId") Long empfaengerId);
}
