package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class AttachmentResponse {
    private Long id;
    private Long cardId;
    private Long userId;
    private String userFullName;
    private String fileName;
    private String fileType;
    private String fileUrl; // The URL to access the file, not the local path
    private LocalDateTime uploadedAt;
}
