package com.kanban.backend.controller;

import com.kanban.backend.dto.request.LoginRequest;
import com.kanban.backend.dto.request.RegisterRequest;
import com.kanban.backend.dto.request.TokenRefreshRequest;
import com.kanban.backend.dto.response.JwtResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.dto.response.TokenRefreshResponse;
import com.kanban.backend.entity.RefreshToken;
import com.kanban.backend.security.JwtTokenProvider;
import com.kanban.backend.service.AuthService;
import com.kanban.backend.service.RefreshTokenService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final RefreshTokenService refreshTokenService;
    private final JwtTokenProvider jwtTokenProvider;

    // API Đăng nhập
    // Đường dẫn: POST http://localhost:8080/api/auth/login
    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            JwtResponse jwtResponse = authService.authenticateUser(loginRequest);
            return ResponseEntity.ok(jwtResponse);
        } catch (Exception e) {
            // Nếu sai tài khoản mật khẩu, trả về lỗi 401 Unauthorized
            return ResponseEntity.status(401).body(new MessageResponse("Error: Invalid email or password"));
        }
    }

    // API Đăng ký
    // Đường dẫn: POST http://localhost:8080/api/auth/register
    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody RegisterRequest registerRequest) {
        try {
            authService.registerUser(registerRequest);
            return ResponseEntity.ok(new MessageResponse("User registered successfully!"));
        } catch (RuntimeException e) {
            // Nếu email đã tồn tại, ném lỗi 400 Bad Request
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }


    @PostMapping("/refreshtoken")
    public ResponseEntity<?> refreshtoken(@Valid @RequestBody TokenRefreshRequest request) {
        String requestRefreshToken = request.getRefreshToken();
        return refreshTokenService.findByToken(requestRefreshToken)
                .map(refreshTokenService::verifyExpiration)
                .map(RefreshToken::getUser)
                .map(user -> {
                    String token = jwtTokenProvider.generateTokenFromUsername(user.getEmail());
                    return ResponseEntity.ok(new TokenRefreshResponse(token, requestRefreshToken));
                })
                .orElseThrow(() -> new RuntimeException(
                        "Refresh token is not in database!"));
    }
}