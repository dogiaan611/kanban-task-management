package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class BoardResponse {
    private Long id;
    private Long workspaceId;
    private String name;
    private LocalDateTime createdAt;
}