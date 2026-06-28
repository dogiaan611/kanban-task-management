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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private UserRepository userRepository;
    @Mock
    private RoleRepository roleRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private JwtTokenProvider jwtTokenProvider;
    @Mock
    private RefreshTokenService refreshTokenService;

    @InjectMocks
    private AuthService authService;

    private User mockUser;
    private CustomUserDetails mockUserDetails;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("test@example.com")
                .password("encoded_password")
                .fullName("Test User")
                .roles(Collections.emptySet())
                .build();
        
        mockUserDetails = new CustomUserDetails(mockUser);
    }

    @Test
    void registerUser_Success() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");
        request.setFullName("Test User");
        request.setPassword("password123");

        Role roleUser = new Role();
        roleUser.setName("ROLE_USER");

        when(userRepository.existsByEmailNormalized("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encoded_password");
        when(roleRepository.findByName("ROLE_USER")).thenReturn(Optional.of(roleUser));
        when(userRepository.save(any(User.class))).thenReturn(mockUser);

        // Act
        assertDoesNotThrow(() -> authService.registerUser(request));

        // Assert
        verify(userRepository).save(any(User.class));
    }

    @Test
    void registerUser_EmailAlreadyExists_ThrowsException() {
        // Arrange
        RegisterRequest request = new RegisterRequest();
        request.setEmail("test@example.com");

        when(userRepository.existsByEmailNormalized("test@example.com")).thenReturn(true);

        // Act & Assert
        RuntimeException exception = assertThrows(RuntimeException.class, () -> authService.registerUser(request));
        assertEquals("Error: Email is already in use!", exception.getMessage());
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void authenticateUser_Success() {
        // Arrange
        LoginRequest request = new LoginRequest();
        request.setEmail("test@example.com");
        request.setPassword("password123");

        Authentication authentication = mock(Authentication.class);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenReturn(authentication);
        
        when(jwtTokenProvider.generateAccessToken(authentication)).thenReturn("mock_jwt_token");
        when(authentication.getPrincipal()).thenReturn(mockUserDetails);

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken("mock_refresh_token");
        when(refreshTokenService.createRefreshToken(mockUser.getId())).thenReturn(refreshToken);

        // Act
        JwtResponse response = authService.authenticateUser(request);

        // Assert
        assertNotNull(response);
        assertEquals("mock_jwt_token", response.getToken());
        assertEquals("mock_refresh_token", response.getRefreshToken());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("Test User", response.getFullName());
    }
}
