package com.kanban.backend.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;

import java.security.Key;
import java.util.Date;

@Component
@Slf4j
public class JwtTokenProvider {

    // Lấy chuỗi bí mật từ application.properties (Ta sẽ cấu hình sau)
    @Value("${app.jwt.secret}")
    private String jwtSecret;

    // Thời gian sống của Access Token (Ví dụ: 24 giờ)
    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;

    // Tạo một Key an toàn dựa trên chuỗi bí mật
    private Key getSigningKey() {
        return Keys.hmacShaKeyFor(jwtSecret.getBytes());
    }

    // 1. Hàm tạo ra chuỗi Access Token khi User đăng nhập thành công
    public String generateAccessToken(Authentication authentication) {
        CustomUserDetails userPrincipal = (CustomUserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername())) // Lưu email vào token
                .setIssuedAt(new Date()) // Thời điểm tạo
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Thời điểm hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký bằng thuật toán HS256
                .compact();
    }

    // 2. Hàm lấy Email (Username) từ Token khi User gửi lên
    public String getEmailFromJwtToken(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody()
                .getSubject();
    }

    // 3. Hàm kiểm tra xem Token có hợp lệ không (có bị sửa đổi, hết hạn không)
    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(getSigningKey()).build().parseClaimsJws(authToken);
            return true;
        } catch (MalformedJwtException e) {
            log.error("Invalid JWT token: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.error("JWT token is expired: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.error("JWT token is unsupported: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.error("JWT claims string is empty: {}", e.getMessage());
        }
        return false;
    }

    public String generateTokenFromUsername(String username) {
        return Jwts.builder()
                .setSubject(username) // Lưu trực tiếp chuỗi email (username) vào token
                .setIssuedAt(new Date()) // Thời điểm tạo
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs)) // Thời điểm hết hạn
                .signWith(getSigningKey(), SignatureAlgorithm.HS256) // Ký bằng thuật toán HS256
                .compact();
    }
}