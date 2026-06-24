package com.kanban.backend.controller;

import com.kanban.backend.dto.request.CardRequest;
import com.kanban.backend.dto.request.UpdatePositionRequest;
import com.kanban.backend.dto.response.CardResponse;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.CardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cards")
@RequiredArgsConstructor
public class CardController {

    private final CardService cardService;

    @PostMapping
    public ResponseEntity<CardResponse> createCard(
            @Valid @RequestBody CardRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        CardResponse response = cardService.createCard(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/position")
    public ResponseEntity<?> updateCardPosition(
            @PathVariable Long id,
            @Valid @RequestBody UpdatePositionRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            cardService.updateCardPosition(id, request, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Position updated successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateCardDetail(
            @PathVariable Long id,
            @Valid @RequestBody com.kanban.backend.dto.request.UpdateCardDetailRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            CardResponse response = cardService.updateCardDetail(id, request, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteCard(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            cardService.deleteCard(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Card deleted successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}
