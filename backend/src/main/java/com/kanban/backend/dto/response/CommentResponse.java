package com.kanban.backend.dto.response;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
public class CommentResponse {
    private Long id;
    private String content;
    private Long userId;
    private String userFullName;
    private String userAvatarUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
