package com.kanban.backend.dto.response;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.time.LocalDateTime;
@Getter
@Setter
@AllArgsConstructor
public class ActivityResponse {
    private Long id;
    private Long userId;
    private String userFullName;
    private String userAvatarUrl;
    private String action;
    private String detail;
    private LocalDateTime createdAt;
}
