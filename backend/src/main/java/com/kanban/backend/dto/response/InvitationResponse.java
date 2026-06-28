package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class InvitationResponse {
    private String token;
    private String email;
    private String workspaceName;
    private String invitedByName;
    private String status;
    private LocalDateTime expiresAt;
    private String inviteLink;
}
