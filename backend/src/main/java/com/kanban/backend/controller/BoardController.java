package com.kanban.backend.controller;

import com.kanban.backend.dto.request.BoardRequest;
import com.kanban.backend.dto.response.BoardResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.BoardService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/boards")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    // 1. API Tạo Board mới
    // POST: http://localhost:8080/api/boards
    @PostMapping
    public ResponseEntity<BoardResponse> createBoard(
            @Valid @RequestBody BoardRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        BoardResponse response = boardService.createBoard(request, userDetails.getUsername());
        return ResponseEntity.ok(response);
    }

    // 2. API Lấy danh sách Board theo Workspace
    // GET: http://localhost:8080/api/boards/workspace/{workspaceId}
    @GetMapping("/workspace/{workspaceId}")
    public ResponseEntity<List<BoardResponse>> getBoardsByWorkspace(
            @PathVariable Long workspaceId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<BoardResponse> responses = boardService.getBoardsByWorkspace(workspaceId, userDetails.getUsername());
        return ResponseEntity.ok(responses);
    }
}