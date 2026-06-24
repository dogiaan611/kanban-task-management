package com.kanban.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
public class UpdateCardDetailRequest {
    private String description;
    private LocalDateTime dueDate;
    private Long assigneeId;
}
