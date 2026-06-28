package com.kanban.backend.service;

import com.kanban.backend.dto.response.NotificationResponse;
import com.kanban.backend.entity.Notification;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.repository.NotificationRepository;
import com.kanban.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void notifyWorkspaceInvitation(User targetUser, User inviter, Workspace workspace, String inviteToken) {
        Notification notification = Notification.builder()
                .user(targetUser)
                .type("WORKSPACE_INVITE")
                .title("Lời mời tham gia workspace")
                .message(inviter.getFullName() + " đã mời bạn tham gia \"" + workspace.getName() + "\"")
                .link("/invite/" + inviteToken)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSend("/topic/user/" + targetUser.getId() + "/notifications", response);
    }

    public List<NotificationResponse> getUserNotifications(String userEmail) {
        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        return notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public long getUnreadCount(String userEmail) {
        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.countByUserAndReadFalse(user);
    }

    @Transactional
    public void markAsRead(Long notificationId, String userEmail) {
        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Notification notification = notificationRepository.findById(notificationId)
                .orElseThrow(() -> new RuntimeException("Notification not found"));

        if (!notification.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Access denied");
        }

        notification.setRead(true);
        notificationRepository.save(notification);
    }

    @Transactional
    public void markAllAsRead(String userEmail) {
        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        notificationRepository.findByUserOrderByCreatedAtDesc(user).stream()
                .filter(n -> !n.isRead())
                .forEach(n -> n.setRead(true));
    }

    private NotificationResponse toResponse(Notification notification) {
        return new NotificationResponse(
                notification.getId(),
                notification.getType(),
                notification.getTitle(),
                notification.getMessage(),
                notification.getLink(),
                notification.isRead(),
                notification.getCreatedAt()
        );
    }
}
