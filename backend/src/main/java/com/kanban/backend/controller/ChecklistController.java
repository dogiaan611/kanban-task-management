package com.kanban.backend.controller;

import com.kanban.backend.dto.request.ChecklistRequest;
import com.kanban.backend.dto.request.UpdateChecklistRequest;
import com.kanban.backend.dto.response.ChecklistResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.ChecklistService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ChecklistController {

    private final ChecklistService checklistService;

    @GetMapping("/cards/{cardId}/checklists")
    public ResponseEntity<List<ChecklistResponse>> getChecklists(
            @PathVariable Long cardId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<ChecklistResponse> responses = checklistService.getChecklistsByCard(cardId, userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/cards/{cardId}/checklists")
    public ResponseEntity<ChecklistResponse> createChecklist(
            @PathVariable Long cardId,
            @Valid @RequestBody ChecklistRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ChecklistResponse response = checklistService.createChecklist(cardId, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/checklists/{id}")
    public ResponseEntity<ChecklistResponse> updateChecklist(
            @PathVariable Long id,
            @RequestBody UpdateChecklistRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        ChecklistResponse response = checklistService.updateChecklist(id, request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/checklists/{id}")
    public ResponseEntity<?> deleteChecklist(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            checklistService.deleteChecklist(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Checklist item deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
