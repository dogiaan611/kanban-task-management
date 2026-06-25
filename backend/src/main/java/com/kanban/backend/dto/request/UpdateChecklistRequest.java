package com.kanban.backend.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateChecklistRequest {
    private String title;
    private Boolean isCompleted;
    private Double position;
    private Long assigneeId;
}
