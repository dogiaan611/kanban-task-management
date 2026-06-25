package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class CardResponse {
    private Long id;
    private Long listId;
    private String title;
    private String description;
    private Double position;
    private LocalDateTime createdAt;
    private LocalDateTime dueDate;
    private Long assigneeId;
    private String assigneeName;
    private List<TagResponse> tags;
}
