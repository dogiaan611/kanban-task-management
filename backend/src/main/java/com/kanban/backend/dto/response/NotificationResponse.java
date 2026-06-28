package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class NotificationResponse {
    private Long id;
    private String type;
    private String title;
    private String message;
    private String link;
    private boolean read;
    private LocalDateTime createdAt;
}
