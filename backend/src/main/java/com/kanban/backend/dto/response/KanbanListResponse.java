package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class KanbanListResponse {
    private Long id;
    private Long boardId;
    private String title;
    private Double position;
    private LocalDateTime createdAt;
    private List<CardResponse> cards;
}
