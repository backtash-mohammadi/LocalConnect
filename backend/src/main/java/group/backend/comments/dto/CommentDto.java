package group.backend.comments.dto;

import group.backend.comments.Comment;

import java.util.function.Function;

// CommentDto.java
public record CommentDto(Long id, String text,
                         java.time.LocalDateTime createdAt,
                         Long userId, String userName,
                         Long postId, String postTitle) {

    public static CommentDto from(Comment c) {
        return new CommentDto(c.getId(), c.getText(), c.getCreatedAt(),
                c.getUser().getId(), c.getUser().getName(),
                c.getPost().getId(), c.getPost().getTitel());
    }

}
