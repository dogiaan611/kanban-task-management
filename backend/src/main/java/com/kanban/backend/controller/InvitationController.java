package com.kanban.backend.controller;

import com.kanban.backend.dto.request.InviteMemberRequest;
import com.kanban.backend.dto.response.InvitationResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.dto.response.WorkspaceResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.InvitationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequiredArgsConstructor
public class InvitationController {

    private final InvitationService invitationService;

    // POST: /api/workspaces/{workspaceId}/invitations
    @PostMapping("/api/workspaces/{workspaceId}/invitations")
    public ResponseEntity<?> sendInvitation(
            @PathVariable Long workspaceId,
            @Valid @RequestBody InviteMemberRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            InvitationResponse response = invitationService.sendInvitation(workspaceId, request, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // GET: /api/invitations/{token} (public)
    @GetMapping("/api/invitations/{token}")
    public ResponseEntity<?> getInvitation(@PathVariable String token) {
        try {
            return ResponseEntity.ok(invitationService.getInvitationByToken(token));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // POST: /api/invitations/{token}/accept
    @PostMapping("/api/invitations/{token}/accept")
    public ResponseEntity<?> acceptInvitation(
            @PathVariable String token,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            WorkspaceResponse response = invitationService.acceptInvitation(token, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
