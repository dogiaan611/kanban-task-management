package com.kanban.backend.service;

import com.kanban.backend.dto.request.InviteMemberRequest;
import com.kanban.backend.dto.response.InvitationResponse;
import com.kanban.backend.dto.response.WorkspaceResponse;
import com.kanban.backend.entity.*;
import com.kanban.backend.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class InvitationService {

    private final WorkspaceInvitationRepository invitationRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final NotificationService notificationService;
    private final PermissionService permissionService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${app.mail.required:false}")
    private boolean mailRequired;

    @Transactional
    public InvitationResponse sendInvitation(Long workspaceId, InviteMemberRequest request, String userEmail) {
        User inviter = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        permissionService.checkWorkspaceAdmin(workspace, inviter);

        String email = request.getEmail().trim();

        if (email.equalsIgnoreCase(inviter.getEmail().trim())) {
            throw new RuntimeException("Bạn không thể mời chính mình");
        }

        User targetUser = userRepository.findByEmailNormalized(email)
                .orElseThrow(() -> new RuntimeException("Email chưa đăng ký tài khoản. Chỉ có thể mời người dùng đã có tài khoản."));

        if (workspaceMemberRepository.existsByWorkspaceAndUser(workspace, targetUser)) {
            throw new RuntimeException("Người dùng này đã là thành viên của workspace");
        }

        String normalizedEmail = targetUser.getEmail().trim().toLowerCase();

        WorkspaceInvitation invitation = invitationRepository
                .findByWorkspaceAndEmailAndStatus(workspace, normalizedEmail, "PENDING")
                .orElse(null);

        if (invitation != null) {
            invitation.setToken(UUID.randomUUID().toString());
            invitation.setExpiresAt(LocalDateTime.now().plusDays(7));
            invitation.setInvitedBy(inviter);
        } else {
            invitation = WorkspaceInvitation.builder()
                    .workspace(workspace)
                    .email(normalizedEmail)
                    .token(UUID.randomUUID().toString())
                    .invitedBy(inviter)
                    .role("ROLE_MEMBER")
                    .status("PENDING")
                    .expiresAt(LocalDateTime.now().plusDays(7))
                    .build();
        }

        invitation = invitationRepository.save(invitation);

        try {
            emailService.sendWorkspaceInvitation(
                    targetUser.getEmail(),
                    workspace.getName(),
                    inviter.getFullName(),
                    invitation.getToken()
            );
        } catch (RuntimeException e) {
            if (mailRequired) {
                throw e;
            }
            log.warn("Could not send invitation email to {}: {}", targetUser.getEmail(), e.getMessage());
        }

        notificationService.notifyWorkspaceInvitation(targetUser, inviter, workspace, invitation.getToken());

        return toResponse(invitation);
    }

    public InvitationResponse getInvitationByToken(String token) {
        WorkspaceInvitation invitation = findValidInvitation(token);
        return toResponse(invitation);
    }

    @Transactional
    public WorkspaceResponse acceptInvitation(String token, String userEmail) {
        WorkspaceInvitation invitation = findValidInvitation(token);
        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equalsIgnoreCase(invitation.getEmail())) {
            throw new RuntimeException("Email tài khoản không khớp với lời mời");
        }

        Workspace workspace = invitation.getWorkspace();

        if (!workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user)) {
            WorkspaceMember member = WorkspaceMember.builder()
                    .workspace(workspace)
                    .user(user)
                    .role(invitation.getRole())
                    .build();
            workspaceMemberRepository.save(member);
        }

        invitation.setStatus("ACCEPTED");
        invitationRepository.save(invitation);

        WorkspaceMember membership = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new RuntimeException("Failed to add member"));

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                membership.getRole(),
                workspace.getCreatedAt()
        );
    }

    private WorkspaceInvitation findValidInvitation(String token) {
        WorkspaceInvitation invitation = invitationRepository.findByToken(token)
                .orElseThrow(() -> new RuntimeException("Lời mời không tồn tại"));

        if ("ACCEPTED".equals(invitation.getStatus())) {
            throw new RuntimeException("Lời mời đã được chấp nhận");
        }

        if (LocalDateTime.now().isAfter(invitation.getExpiresAt())) {
            invitation.setStatus("EXPIRED");
            invitationRepository.save(invitation);
            throw new RuntimeException("Lời mời đã hết hạn");
        }

        return invitation;
    }

    private InvitationResponse toResponse(WorkspaceInvitation invitation) {
        String token = invitation.getToken();
        return new InvitationResponse(
                token,
                invitation.getEmail(),
                invitation.getWorkspace().getName(),
                invitation.getInvitedBy().getFullName(),
                invitation.getStatus(),
                invitation.getExpiresAt(),
                frontendUrl + "/invite/" + token
        );
    }
}
