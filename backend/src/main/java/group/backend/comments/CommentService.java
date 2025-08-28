package group.backend.comments;


import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository repo;
    public Comment save(Comment c){ return repo.save(c); }
    public Optional<Comment> find(Long id){ return repo.findById(id); }
    public List<Comment> all(){ return repo.findAll(); }
}