package group.backend.comments;


import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService service;

    @PostMapping
    public Comment create(@RequestBody Comment c){ return service.save(c); }

    @GetMapping("/{id}")
    public ResponseEntity<Comment> get(@PathVariable Long id){
        return service.find(id).map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
    }

    @GetMapping
    public List<Comment> list(){ return service.all(); }
}