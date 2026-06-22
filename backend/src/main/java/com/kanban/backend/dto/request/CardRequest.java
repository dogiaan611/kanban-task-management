package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CardRequest {
    @NotNull(message = "List ID is required")
    private Long listId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
}
