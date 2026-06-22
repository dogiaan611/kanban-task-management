package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class CardResponse {
    private Long id;
    private Long listId;
    private String title;
    private String description;
    private Double position;
    private LocalDateTime createdAt;
}
