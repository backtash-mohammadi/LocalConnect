package group.backend.comments;


import group.backend.comments.dto.CommentDto;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/comments")

public class CommentController {
    private final CommentService svc;
    public CommentController(CommentService svc){ this.svc = svc; }

    public static record NewCommentRequest(Long userId, Long postId, String text) {}

    @PostMapping public Comment create(@RequestBody NewCommentRequest r){
        return svc.create(r.userId(), r.postId(), r.text());
    }


    @GetMapping("/user/{userId}")
    public List<Comment> byUser(@PathVariable Long userId){ return svc.byUser(userId); }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id){ svc.delete(id); }


    // CommentController.java (use DTOs)
    @GetMapping("/post/{postId}")
    public List<CommentDto> byPost(@PathVariable Long postId){
        return svc.byPost(postId).stream().map(CommentDto::from).toList();
    }

}