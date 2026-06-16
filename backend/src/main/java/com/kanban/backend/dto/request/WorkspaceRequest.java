package com.kanban.backend.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class WorkspaceRequest {
    @NotBlank(message = "Tên Workspace không được để trống")
    private String name;

    private String description;
}