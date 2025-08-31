package group.backend.chat;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface KonversationRepository extends JpaRepository<Konversation, Long> {

    @Query("""
        select k from Konversation k
        where ((:anfrageId is null and k.anfrage is null) or (k.anfrage.id = :anfrageId))
          and (
                (k.teilnehmerA.id = :a and k.teilnehmerB.id = :b) or
                (k.teilnehmerA.id = :b and k.teilnehmerB.id = :a)
              )
    """)
    Optional<Konversation> findeZwischen(@Param("anfrageId") Long anfrageId,
                                         @Param("a") Long teilnehmerAId,
                                         @Param("b") Long teilnehmerBId);

    List<Konversation> findByTeilnehmerA_IdOrTeilnehmerB_Id(Long aId, Long bId);
}
