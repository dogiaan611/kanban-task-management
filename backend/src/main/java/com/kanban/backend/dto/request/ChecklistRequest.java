package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ChecklistRequest {
    @NotBlank(message = "Title is required")
    private String title;
}
