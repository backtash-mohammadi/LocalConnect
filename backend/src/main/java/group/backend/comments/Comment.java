package group.backend.comments;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import group.backend.anfrage.Anfrage;
import group.backend.benutzer.Benutzer;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;

@Entity
@Table(name = "comments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Comment {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable=false)
    private String text; // keep it super simple


    @Column(name="created_at", nullable=false) private LocalDateTime createdAt;
    @Column(name="updated_at", nullable=false) private LocalDateTime updatedAt;

    @ManyToOne(optional=false)
    @JoinColumn(name="user_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonManagedReference("comment-user")
    private Benutzer user;

    @ManyToOne(optional=false)
    @JoinColumn(name="post_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonManagedReference("comment-post")
    private Anfrage post;

    @PrePersist
    void onCreate(){ createdAt = updatedAt = LocalDateTime.now(); }
    @PreUpdate
    void onUpdate(){ updatedAt = LocalDateTime.now(); }
}
