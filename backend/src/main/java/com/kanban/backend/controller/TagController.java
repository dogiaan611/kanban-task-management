package com.kanban.backend.controller;

import com.kanban.backend.dto.request.TagRequest;
import com.kanban.backend.dto.response.TagResponse;
import com.kanban.backend.service.TagService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tags")
@RequiredArgsConstructor
public class TagController {

    private final TagService tagService;

    @GetMapping("/board/{boardId}")
    public ResponseEntity<List<TagResponse>> getTagsByBoard(@PathVariable Long boardId, Authentication authentication) {
        return ResponseEntity.ok(tagService.getTagsByBoard(boardId, authentication.getName()));
    }

    @PostMapping("/board/{boardId}")
    public ResponseEntity<TagResponse> createTag(@PathVariable Long boardId, @Valid @RequestBody TagRequest request, Authentication authentication) {
        return ResponseEntity.ok(tagService.createTag(boardId, request, authentication.getName()));
    }

    @DeleteMapping("/{tagId}")
    public ResponseEntity<Void> deleteTag(@PathVariable Long tagId, Authentication authentication) {
        tagService.deleteTag(tagId, authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/card/{cardId}/tag/{tagId}")
    public ResponseEntity<Void> addTagToCard(@PathVariable Long cardId, @PathVariable Long tagId, Authentication authentication) {
        tagService.addTagToCard(cardId, tagId, authentication.getName());
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/card/{cardId}/tag/{tagId}")
    public ResponseEntity<Void> removeTagFromCard(@PathVariable Long cardId, @PathVariable Long tagId, Authentication authentication) {
        tagService.removeTagFromCard(cardId, tagId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
