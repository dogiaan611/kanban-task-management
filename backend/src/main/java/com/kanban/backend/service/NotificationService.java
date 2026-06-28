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
import java.util.Set;
import java.util.HashSet;
import java.util.stream.Collectors;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Checklist;
import com.kanban.backend.entity.Comment;
import com.kanban.backend.repository.ChecklistRepository;
import com.kanban.backend.repository.CommentRepository;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;
    private final ChecklistRepository checklistRepository;
    private final CommentRepository commentRepository;
    private final SimpMessagingTemplate messagingTemplate;

    @Transactional
    public void notifyWorkspaceInvitation(User targetUser, User inviter, Workspace workspace, String inviteToken) {
        Notification notification = Notification.builder()
                .user(targetUser)
                .type("WORKSPACE_INVITE")
                .title("Workspace Invitation")
                .message(inviter.getFullName() + " invited you to \"" + workspace.getName() + "\"")
                .link("/invite/" + inviteToken)
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSend("/topic/user/" + targetUser.getId() + "/notifications", response);
    }

    @Transactional
    public void notifyUserMention(User targetUser, User mentioner, com.kanban.backend.entity.Card card) {
        if (targetUser.getId().equals(mentioner.getId())) return; // Do not notify if user mentions themselves
        
        Notification notification = Notification.builder()
                .user(targetUser)
                .type("MENTION")
                .title("You were mentioned")
                .message(mentioner.getFullName() + " mentioned you in a comment on card \"" + card.getTitle() + "\"")
                .link("/board/" + card.getList().getBoard().getId() + "?cardId=" + card.getId())
                .read(false)
                .build();

        notification = notificationRepository.save(notification);
        NotificationResponse response = toResponse(notification);
        messagingTemplate.convertAndSend("/topic/user/" + targetUser.getId() + "/notifications", response);
    }

    @Transactional
    public void notifyCardActivity(Card card, User actor, String action, String details) {
        Set<User> recipients = new HashSet<>();

        // 1. Assignee của Card
        if (card.getAssignee() != null) {
            recipients.add(card.getAssignee());
        }

        // 2. Assignees của Checklist
        List<Checklist> checklists = checklistRepository.findByCardOrderByPositionAsc(card);
        for (Checklist item : checklists) {
            if (item.getAssignee() != null) {
                recipients.add(item.getAssignee());
            }
        }

        // 3. Những người từng Comment
        List<Comment> comments = commentRepository.findByCardOrderByCreatedAtDesc(card);
        for (Comment comment : comments) {
            recipients.add(comment.getUser());
        }

        // Loại bỏ người thực hiện hành động
        recipients.removeIf(user -> user.getId().equals(actor.getId()));

        for (User targetUser : recipients) {
            String message = actor.getFullName() + " " + action;
            if (details != null && !details.isEmpty()) {
                message += ": " + details;
            }

            Notification notification = Notification.builder()
                    .user(targetUser)
                    .type("CARD_ACTIVITY")
                    .title("Cập nhật thẻ: " + card.getTitle())
                    .message(message)
                    .link("/board/" + card.getList().getBoard().getId() + "?cardId=" + card.getId())
                    .read(false)
                    .build();

            notification = notificationRepository.save(notification);
            NotificationResponse response = toResponse(notification);
            messagingTemplate.convertAndSend("/topic/user/" + targetUser.getId() + "/notifications", response);
        }
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
