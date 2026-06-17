package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BoardRequest {
    @NotNull(message = "Workspace ID không được để trống")
    private Long workspaceId;

    @NotBlank(message = "Tên Board không được để trống")
    private String name;
}