package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class BoardMemberResponse {
    private Long id; // board_member_id
    private Long userId;
    private String fullName;
    private String email;
    private String role;
    private String avatarUrl;
}
