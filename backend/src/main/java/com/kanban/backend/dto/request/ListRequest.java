package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ListRequest {
    @NotNull(message = "Board ID is required")
    private Long boardId;

    @NotBlank(message = "Title is required")
    private String title;
}
