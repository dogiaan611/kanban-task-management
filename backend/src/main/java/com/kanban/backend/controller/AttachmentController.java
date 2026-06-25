package com.kanban.backend.controller;

import com.kanban.backend.dto.response.AttachmentResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.AttachmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class AttachmentController {

    private final AttachmentService attachmentService;

    @PostMapping("/cards/{cardId}/attachments")
    public ResponseEntity<AttachmentResponse> uploadAttachment(
            @PathVariable Long cardId,
            @RequestParam("file") MultipartFile file,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            AttachmentResponse response = attachmentService.uploadAttachment(cardId, file, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(null);
        }
    }

    @GetMapping("/cards/{cardId}/attachments")
    public ResponseEntity<List<AttachmentResponse>> getAttachments(
            @PathVariable Long cardId) {
        return ResponseEntity.ok(attachmentService.getAttachmentsByCard(cardId));
    }

    @DeleteMapping("/attachments/{id}")
    public ResponseEntity<?> deleteAttachment(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            attachmentService.deleteAttachment(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Attachment deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
