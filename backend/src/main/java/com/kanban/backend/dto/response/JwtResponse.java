package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
public class JwtResponse {
    private String token;
    private String type = "Bearer";
    private Long id;
    private String email;
    private String fullName;
    private String avatarUrl;
    private String refreshToken;
    private List<String> roles;

    public JwtResponse(String token, Long id, String email, String fullName, String avatarUrl, String refreshToken, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.avatarUrl = avatarUrl;
        this.refreshToken = refreshToken;
        this.roles = roles;
    }
}