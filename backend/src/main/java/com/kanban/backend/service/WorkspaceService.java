package com.kanban.backend.service;

import com.kanban.backend.dto.request.WorkspaceRequest;
import com.kanban.backend.dto.response.WorkspaceResponse;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.entity.WorkspaceMember;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import com.kanban.backend.repository.WorkspaceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WorkspaceService {

    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final PermissionService permissionService;

    // 1. TẠO WORKSPACE
    @Transactional
    public WorkspaceResponse createWorkspace(WorkspaceRequest request, String userEmail) {
        // Tìm User hiện đang đăng nhập
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Lưu Workspace mới vào DB
        Workspace workspace = Workspace.builder()
                .name(request.getName())
                .description(request.getDescription())
                .build();
        workspace = workspaceRepository.save(workspace);

        // Lưu thông tin người tạo vào bảng Members với quyền ROLE_ADMIN
        WorkspaceMember member = WorkspaceMember.builder()
                .workspace(workspace)
                .user(user)
                .role("ROLE_ADMIN")
                .build();
        workspaceMemberRepository.save(member);

        return new WorkspaceResponse(
                workspace.getId(),
                workspace.getName(),
                workspace.getDescription(),
                "ROLE_ADMIN",
                workspace.getCreatedAt()
        );
    }

    // 2. LẤY DANH SÁCH WORKSPACE CỦA USER ĐANG ĐĂNG NHẬP (CÓ HỖ TRỢ TÌM KIẾM)
    public List<WorkspaceResponse> getUserWorkspaces(String userEmail, String keyword) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        List<WorkspaceMember> memberships;
        if (keyword != null && !keyword.trim().isEmpty()) {
            memberships = workspaceMemberRepository.findByUserAndWorkspace_NameContainingIgnoreCase(user, keyword.trim());
        } else {
            memberships = workspaceMemberRepository.findByUser(user);
        }

        // Chuyển đổi thành dạng DTO trả về cho Frontend
        return memberships.stream().map(member -> new WorkspaceResponse(
                member.getWorkspace().getId(),
                member.getWorkspace().getName(),
                member.getWorkspace().getDescription(),
                member.getRole(),
                member.getWorkspace().getCreatedAt()
        )).collect(Collectors.toList());
    }

    // 3. XÓA WORKSPACE
    @Transactional
    public void deleteWorkspace(Long workspaceId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        permissionService.checkWorkspaceAdmin(workspace, user);

        // Xóa tất cả các members trước để tránh lỗi khóa ngoại (Foreign Key Constraint)
        workspaceMemberRepository.deleteByWorkspace(workspace);

        // Sau đó mới xóa workspace
        workspaceRepository.delete(workspace);
    }
}