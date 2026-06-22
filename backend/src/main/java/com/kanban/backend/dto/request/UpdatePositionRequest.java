package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdatePositionRequest {
    @NotNull(message = "Position is required")
    private Double position;

    // Optional for List movement, but Required for Card movement to another list
    private Long parentId; 
}
