package com.kanban.backend.service;

import com.kanban.backend.dto.response.AttachmentResponse;
import com.kanban.backend.entity.Attachment;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.AttachmentRepository;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttachmentService {

    private final AttachmentRepository attachmentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PermissionService permissionService;

    private void notifyBoardUpdate(Long boardId) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId, "{\"action\":\"BOARD_UPDATED\"}");
    }

    @Transactional
    public AttachmentResponse uploadAttachment(Long cardId, MultipartFile file, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

        String originalFileName = file.getOriginalFilename();
        String storedFileName = fileStorageService.storeFile(file);
        String contentType = file.getContentType();

        Attachment attachment = Attachment.builder()
                .card(card)
                .user(user)
                .fileName(originalFileName)
                .fileType(contentType)
                .filePath(storedFileName) // Store just the filename, build URL on read
                .build();

        attachment = attachmentRepository.save(attachment);
        activityService.logActivity(card, user, "attached a file: " + originalFileName, null);
        notificationService.notifyCardActivity(card, user, "attached a file", originalFileName);
        notifyBoardUpdate(card.getList().getBoard().getId());

        return mapToResponse(attachment);
    }

    public List<AttachmentResponse> getAttachmentsByCard(Long cardId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        permissionService.checkBoardViewerOrAbove(card.getList().getBoard(), user);
        return attachmentRepository.findByCardOrderByUploadedAtDesc(card).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteAttachment(Long attachmentId, String userEmail) {
        Attachment attachment = attachmentRepository.findById(attachmentId)
                .orElseThrow(() -> new RuntimeException("Attachment not found"));
        
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        permissionService.checkBoardMemberOrAdmin(attachment.getCard().getList().getBoard(), user);

        // Chỉ có Admin hoặc chính người tải tệp lên mới được xóa
        boolean isAdmin = false;
        try {
            permissionService.checkBoardAdmin(attachment.getCard().getList().getBoard(), user);
            isAdmin = true;
        } catch (RuntimeException e) {
            // Không phải admin
        }

        if (!isAdmin && !attachment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Bạn không có quyền xóa tệp đính kèm của người khác!");
        }

        fileStorageService.deleteFile(attachment.getFilePath());
        
        Card card = attachment.getCard();
        
        attachmentRepository.delete(attachment);
        
        activityService.logActivity(card, user, "deleted attachment: " + attachment.getFileName(), null);
        notifyBoardUpdate(card.getList().getBoard().getId());
    }

    private AttachmentResponse mapToResponse(Attachment attachment) {
        String fileDownloadUri = ServletUriComponentsBuilder.fromCurrentContextPath()
                .path("/uploads/")
                .path(attachment.getFilePath())
                .toUriString();

        return new AttachmentResponse(
                attachment.getId(),
                attachment.getCard().getId(),
                attachment.getUser().getId(),
                attachment.getUser().getFullName(),
                attachment.getFileName(),
                attachment.getFileType(),
                fileDownloadUri,
                attachment.getUploadedAt()
        );
    }
}
