package group.backend.comments;


import group.backend.anfrage.Anfrage;
import group.backend.anfrage.AnfrageRepository;
import group.backend.benutzer.Benutzer;
import group.backend.benutzer.BenutzerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class CommentService{
    private final CommentRepository comments;
    private final BenutzerRepository users;
    private final AnfrageRepository posts;

    public CommentService(CommentRepository c, BenutzerRepository u, AnfrageRepository p){
        this.comments = c; this.users = u; this.posts = p;
    }

    public Comment create(Long userId, Long postId, String text){
        Benutzer u = users.findById(userId).orElseThrow();
        Anfrage p = posts.findById(postId).orElseThrow();
        Comment c = new Comment(); c.setUser(u); c.setPost(p); c.setText(text);
        return comments.save(c);
    }

    public List<Comment> byPost(Long postId){ return comments.findByPostId(postId); }
    public List<Comment> byUser(Long userId){ return comments.findByUserId(userId); }
    public void delete(Long id){ comments.deleteById(id); }
}

