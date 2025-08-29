package group.backend.comments;

import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CommentRepository extends JpaRepository<Comment, Long> {
    @EntityGraph(attributePaths = {"user","post"})
    List<Comment> findByPostId(Long postId);
    @EntityGraph(attributePaths = {"user","post"})
    List<Comment> findByUserId(Long userId);
}