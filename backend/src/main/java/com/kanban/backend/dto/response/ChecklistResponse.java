package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class ChecklistResponse {
    private Long id;
    private Long cardId;
    private String title;
    
    @com.fasterxml.jackson.annotation.JsonProperty("isCompleted")
    private Boolean isCompleted;
    
    private Double position;
    private Long assigneeId;
    private String assigneeName;
    private String assigneeAvatarUrl;
    private LocalDateTime createdAt;
}
