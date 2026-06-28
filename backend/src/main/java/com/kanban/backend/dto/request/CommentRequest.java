package com.kanban.backend.dto.request;
import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;
@Getter
@Setter
public class CommentRequest {
    @NotBlank
    private String content;

    private java.util.List<Long> mentionedUserIds;
}
