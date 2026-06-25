package com.kanban.backend.controller;
import com.kanban.backend.dto.request.CommentRequest;
import com.kanban.backend.dto.response.CommentResponse;
import com.kanban.backend.service.CommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
@RequiredArgsConstructor
public class CommentController {
    private final CommentService commentService;

    @GetMapping("/card/{cardId}")
    public ResponseEntity<List<CommentResponse>> getCommentsByCard(@PathVariable Long cardId, Authentication authentication) {
        return ResponseEntity.ok(commentService.getCommentsByCard(cardId, authentication.getName()));
    }

    @PostMapping("/card/{cardId}")
    public ResponseEntity<CommentResponse> addComment(@PathVariable Long cardId, @Valid @RequestBody CommentRequest request, Authentication authentication) {
        return ResponseEntity.ok(commentService.addComment(cardId, request, authentication.getName()));
    }
    @PutMapping("/{commentId}")
    public ResponseEntity<CommentResponse> updateComment(@PathVariable Long commentId, @Valid @RequestBody CommentRequest request, Authentication authentication) {
        return ResponseEntity.ok(commentService.updateComment(commentId, request, authentication.getName()));
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<Void> deleteComment(@PathVariable Long commentId, Authentication authentication) {
        commentService.deleteComment(commentId, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}
