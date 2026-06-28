package com.kanban.backend.security;

import com.kanban.backend.entity.User;
import com.kanban.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        // Tìm user trong database bằng email
        User user = userRepository.findByEmailNormalized(email.trim())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + email));

        // Trả về đối tượng CustomUserDetails chứa thông tin user
        return new CustomUserDetails(user);
    }
}