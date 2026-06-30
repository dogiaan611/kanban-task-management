package com.kanban.backend.service;

import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.BoardMember;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.entity.WorkspaceMember;
import com.kanban.backend.repository.BoardMemberRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class PermissionService {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final BoardMemberRepository boardMemberRepository;

    public void checkWorkspaceAdmin(Workspace workspace, User user) {
        WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của Workspace này"));
        if (!"ROLE_ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Chỉ Quản trị viên (Admin) của Workspace mới có quyền thực hiện hành động này.");
        }
    }

    public void checkWorkspaceMember(Workspace workspace, User user) {
        if (!workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user)) {
            throw new RuntimeException("Bạn không phải là thành viên của Workspace này");
        }
    }

    public void checkBoardAdmin(Board board, User user) {
        // Workspace Admin always has Board Admin privileges
        WorkspaceMember wsMember = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), user)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của Workspace này"));
        if ("ROLE_ADMIN".equals(wsMember.getRole())) {
            return;
        }

        BoardMember member = boardMemberRepository.findByBoardAndUser(board, user).orElse(null);
        if (member == null || !"ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Chỉ Quản trị viên (Admin) của Board mới có quyền thực hiện hành động này.");
        }
    }

    public void checkBoardMemberOrAdmin(Board board, User user) {
        // Workspace Admin always has Board privileges
        WorkspaceMember wsMember = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), user)
                .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của Workspace này"));
        if ("ROLE_ADMIN".equals(wsMember.getRole())) {
            return;
        }

        BoardMember member = boardMemberRepository.findByBoardAndUser(board, user).orElse(null);
        if (member != null && "VIEWER".equals(member.getRole())) {
            throw new RuntimeException("Người xem (Viewer) không có quyền thay đổi dữ liệu.");
        }
    }

    public void checkBoardViewerOrAbove(Board board, User user) {
        // Only need to be in the workspace to view, OR specifically added to the board.
        // Actually, in Kanban tools, if you are in the Workspace, you can see all workspace boards.
        // Unless it's a private board. We have `isPrivate` in Board.
        if (board.getIsPrivate()) {
            WorkspaceMember wsMember = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), user)
                    .orElseThrow(() -> new RuntimeException("Bạn không phải là thành viên của Workspace này"));
            if ("ROLE_ADMIN".equals(wsMember.getRole())) {
                return;
            }
            if (!boardMemberRepository.existsByBoardAndUser(board, user)) {
                throw new RuntimeException("Bạn không có quyền truy cập bảng Private này.");
            }
        } else {
            if (!workspaceMemberRepository.existsByWorkspaceAndUser(board.getWorkspace(), user)) {
                throw new RuntimeException("Bạn không có quyền truy cập bảng này.");
            }
        }
    }
}
