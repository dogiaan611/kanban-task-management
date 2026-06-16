package com.kanban.backend.controller;

import com.kanban.backend.dto.request.WorkspaceRequest;
import com.kanban.backend.dto.response.MessageResponse;
import com.kanban.backend.dto.response.WorkspaceResponse;
import com.kanban.backend.security.CustomUserDetails;
import com.kanban.backend.service.WorkspaceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workspaces")
@RequiredArgsConstructor
public class WorkspaceController {

    private final WorkspaceService workspaceService;

    // 1. API Lấy danh sách Workspace của mình
    // GET: http://localhost:8080/api/workspaces
    @GetMapping
    public ResponseEntity<List<WorkspaceResponse>> getUserWorkspaces(
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        List<WorkspaceResponse> workspaces = workspaceService.getUserWorkspaces(userDetails.getUsername());
        return ResponseEntity.ok(workspaces);
    }

    // 2. API Tạo Workspace mới
    // POST: http://localhost:8080/api/workspaces
    @PostMapping
    public ResponseEntity<WorkspaceResponse> createWorkspace(
            @Valid @RequestBody WorkspaceRequest request,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        WorkspaceResponse workspace = workspaceService.createWorkspace(request, userDetails.getUsername());
        return ResponseEntity.ok(workspace);
    }

    // 3. API Xóa Workspace
    // DELETE: http://localhost:8080/api/workspaces/{id}
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteWorkspace(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        try {
            workspaceService.deleteWorkspace(id, userDetails.getUsername());
            return ResponseEntity.ok(new MessageResponse("Xóa Workspace thành công!"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new MessageResponse(e.getMessage()));
        }
    }
}