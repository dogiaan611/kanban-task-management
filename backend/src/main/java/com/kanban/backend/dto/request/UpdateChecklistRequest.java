package com.kanban.backend.dto.request;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateChecklistRequest {
    private String title;
    
    @JsonProperty("isCompleted")
    private Boolean isCompleted;
    
    private Double position;
    private Long assigneeId;
}
