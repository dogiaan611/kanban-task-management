package com.kanban.backend.controller;

import com.kanban.backend.dto.request.BoardRequest;
import com.kanban.backend.dto.response.BoardResponse;
import com.kanban.backend.dto.response.MessageResponse;
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

    // 2a. API Lấy thông tin một Board cụ thể
    @GetMapping("/{id}")
    public ResponseEntity<?> getBoardById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            BoardResponse response = boardService.getBoardById(id, userDetails.getUsername());
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
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

    // 3. API Xóa Board
    // DELETE: http://localhost:8080/api/boards/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBoard(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            boardService.deleteBoard(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Xóa Board thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // 4. API Lấy danh sách thành viên Board
    @GetMapping("/{id}/members")
    public ResponseEntity<List<com.kanban.backend.dto.response.BoardMemberResponse>> getBoardMembers(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return ResponseEntity.ok(boardService.getBoardMembers(id, userDetails.getUsername()));
    }

    // 5. API Thêm thành viên vào Board
    @PostMapping("/{id}/members")
    public ResponseEntity<?> addBoardMember(
            @PathVariable Long id,
            @Valid @RequestBody com.kanban.backend.dto.request.AddBoardMemberRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            return ResponseEntity.ok(boardService.addBoardMember(id, request, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // 6. API Xóa thành viên khỏi Board
    @DeleteMapping("/{id}/members/{userId}")
    public ResponseEntity<?> removeBoardMember(
            @PathVariable Long id,
            @PathVariable Long userId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            boardService.removeBoardMember(id, userId, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Xóa thành viên thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // 6.5 API Cập nhật quyền thành viên trên Board
    @PutMapping("/{id}/members/{userId}/role")
    public ResponseEntity<?> updateBoardMemberRole(
            @PathVariable Long id,
            @PathVariable Long userId,
            @RequestBody java.util.Map<String, String> payload,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            String role = payload.get("role");
            if (role == null || role.isEmpty()) {
                return ResponseEntity.badRequest().body(new MessageResponse("Role không hợp lệ"));
            }
            boardService.updateBoardMemberRole(id, userId, role, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Cập nhật quyền thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }

    // 7. API Gửi email mời thành viên
    @PostMapping("/{id}/invitations")
    public ResponseEntity<?> inviteBoardMember(
            @PathVariable Long id,
            @Valid @RequestBody com.kanban.backend.dto.request.InviteMemberRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            return ResponseEntity.ok(boardService.inviteBoardMember(id, request, userDetails.getUsername()));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}