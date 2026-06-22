package com.kanban.backend.controller;

import com.kanban.backend.dto.request.ListRequest;
import com.kanban.backend.dto.request.UpdatePositionRequest;
import com.kanban.backend.dto.response.KanbanListResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.KanbanListService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/lists")
@RequiredArgsConstructor
public class KanbanListController {

    private final KanbanListService listService;

    @PostMapping
    public ResponseEntity<KanbanListResponse> createList(
            @Valid @RequestBody ListRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        KanbanListResponse response = listService.createList(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<KanbanListResponse>> getListsByBoard(
            @PathVariable Long boardId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        List<KanbanListResponse> responses = listService.getListsByBoard(boardId, userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }

    @PutMapping("/{id}/position")
    public ResponseEntity<?> updateListPosition(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePositionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            listService.updateListPosition(id, request, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Position updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteList(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            listService.deleteList(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("List deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
