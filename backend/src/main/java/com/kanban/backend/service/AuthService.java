package com.kanban.backend.service;

import com.kanban.backend.dto.request.LoginRequest;
import com.kanban.backend.dto.request.RegisterRequest;
import com.kanban.backend.dto.response.JwtResponse;
import com.kanban.backend.entity.RefreshToken;
import com.kanban.backend.entity.Role;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.RoleRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final RefreshTokenService refreshTokenService;

    // --- XỬ LÝ ĐĂNG NHẬP ---
    public JwtResponse authenticateUser(LoginRequest loginRequest) {
        // Gọi Spring Security để kiểm tra email và password
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        // Nếu qua được dòng trên (không văng lỗi) -> Đăng nhập thành công
        SecurityContextHolder.getContext().setAuthentication(authentication);

        // Tạo JWT Token
        String jwt = jwtTokenProvider.generateAccessToken(authentication);

        // Lấy thông tin user để trả về Frontend
        CustomUserDetails userDetails = (CustomUserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(item -> item.getAuthority())
                .collect(Collectors.toList());

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(userDetails.getUser().getId());

        return new JwtResponse(
                jwt,
                userDetails.getUser().getId(),
                userDetails.getUsername(),
                userDetails.getUser().getFullName(),
                userDetails.getUser().getAvatarUrl(),
                refreshToken.getToken(),
                roles
        );
    }

    // --- XỬ LÝ ĐĂNG KÝ ---
    @Transactional
    public void registerUser(RegisterRequest signUpRequest) {
        // Kiểm tra xem email đã có người xài chưa
        if (userRepository.existsByEmail(signUpRequest.getEmail())) {
            throw new RuntimeException("Error: Email is already in use!");
        }

        // Tạo tài khoản mới, mã hóa mật khẩu trước khi lưu
        User user = User.builder()
                .fullName(signUpRequest.getFullName())
                .email(signUpRequest.getEmail())
                .password(passwordEncoder.encode(signUpRequest.getPassword()))
                .build();

        Set<Role> roles = new HashSet<>();

        // Mặc định tất cả người dùng đăng ký mới đều có quyền ROLE_USER
        Role userRole = roleRepository.findByName("ROLE_USER")
                .orElseThrow(() -> new RuntimeException("Error: Role is not found."));
        roles.add(userRole);

        user.setRoles(roles);

        // Lưu xuống database
        userRepository.save(user);
    }
}