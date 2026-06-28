package com.kanban.backend.service;

import com.kanban.backend.dto.request.BoardRequest;
import com.kanban.backend.dto.response.BoardResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.KanbanList;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.repository.BoardRepository;
import com.kanban.backend.repository.KanbanListRepository;
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
public class BoardService {

    private final BoardRepository boardRepository;
    private final WorkspaceRepository workspaceRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final KanbanListRepository kanbanListRepository;
    private final com.kanban.backend.repository.BoardMemberRepository boardMemberRepository;
    private final InvitationService invitationService;
    private final PermissionService permissionService;

    // 1. TẠO BOARD MỚI TRONG WORKSPACE
    @Transactional
    public BoardResponse createBoard(BoardRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        permissionService.checkWorkspaceMember(workspace, user);

        Board board = Board.builder()
                .workspace(workspace)
                .name(request.getName())
                .build();
        board = boardRepository.save(board);

        // Tạo 3 lists mặc định: To Do, In Progress, Done
        KanbanList todo = KanbanList.builder().board(board).title("To Do").position(65536.0).build();
        KanbanList inProgress = KanbanList.builder().board(board).title("In Progress").position(131072.0).build();
        KanbanList done = KanbanList.builder().board(board).title("Done").position(196608.0).build();

        kanbanListRepository.saveAll(List.of(todo, inProgress, done));

        // Người tạo bảng sẽ là ADMIN của bảng đó
        com.kanban.backend.entity.BoardMember boardMember = com.kanban.backend.entity.BoardMember.builder()
                .board(board)
                .user(user)
                .role("ADMIN")
                .build();
        boardMemberRepository.save(boardMember);

        return new BoardResponse(
                board.getId(),
                workspace.getId(),
                board.getName(),
                board.getCreatedAt()
        );
    }

    // 2a. LẤY THÔNG TIN MỘT BOARD CỤ THỂ
    public BoardResponse getBoardById(Long boardId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        permissionService.checkBoardViewerOrAbove(board, user);

        return new BoardResponse(board.getId(), board.getWorkspace().getId(), board.getName(), board.getCreatedAt());
    }

    // 2. LẤY DANH SÁCH BOARD CỦA 1 WORKSPACE
    public List<BoardResponse> getBoardsByWorkspace(Long workspaceId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        permissionService.checkWorkspaceMember(workspace, user);

        List<Board> boards = boardRepository.findByWorkspace(workspace);

        return boards.stream().map(board -> new BoardResponse(
                board.getId(),
                workspace.getId(),
                board.getName(),
                board.getCreatedAt()
        )).collect(Collectors.toList());
    }

    // 3. XÓA BOARD
    @Transactional
    public void deleteBoard(Long boardId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        permissionService.checkBoardAdmin(board, user);

        boardRepository.delete(board);
    }

    // 4. LẤY DANH SÁCH THÀNH VIÊN BOARD (Đồng bộ với Project/Workspace)
    public List<com.kanban.backend.dto.response.BoardMemberResponse> getBoardMembers(Long boardId, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        List<com.kanban.backend.entity.WorkspaceMember> members = workspaceMemberRepository.findByWorkspace(board.getWorkspace());
        return members.stream().map(m -> {
            String finalRole = "MEMBER";
            if ("ROLE_ADMIN".equals(m.getRole())) {
                finalRole = "ADMIN";
            } else {
                java.util.Optional<com.kanban.backend.entity.BoardMember> bmOpt = boardMemberRepository.findByBoardAndUser(board, m.getUser());
                if (bmOpt.isPresent()) {
                    finalRole = bmOpt.get().getRole();
                }
            }
            return new com.kanban.backend.dto.response.BoardMemberResponse(
                    m.getId(), m.getUser().getId(), m.getUser().getFullName(), m.getUser().getEmail(), finalRole, m.getUser().getAvatarUrl()
            );
        }).collect(Collectors.toList());
    }

    // 5. THÊM THÀNH VIÊN VÀO BOARD
    @Transactional
    public com.kanban.backend.dto.response.BoardMemberResponse addBoardMember(Long boardId, com.kanban.backend.dto.request.AddBoardMemberRequest request, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        User targetUser = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Chỉ cần thêm vào Workspace vì Board dùng chung Workspace Members
        Workspace workspace = board.getWorkspace();
        com.kanban.backend.entity.WorkspaceMember newWorkspaceMember;
        
        if (!workspaceMemberRepository.existsByWorkspaceAndUser(workspace, targetUser)) {
            newWorkspaceMember = com.kanban.backend.entity.WorkspaceMember.builder()
                    .workspace(workspace)
                    .user(targetUser)
                    .role("ROLE_MEMBER")
                    .build();
            newWorkspaceMember = workspaceMemberRepository.save(newWorkspaceMember);
        } else {
            newWorkspaceMember = workspaceMemberRepository.findByWorkspaceAndUser(workspace, targetUser)
                    .orElseThrow(() -> new RuntimeException("Member already exists"));
        }
        
        return new com.kanban.backend.dto.response.BoardMemberResponse(
                newWorkspaceMember.getId(), newWorkspaceMember.getUser().getId(), newWorkspaceMember.getUser().getFullName(), newWorkspaceMember.getUser().getEmail(), newWorkspaceMember.getRole(), newWorkspaceMember.getUser().getAvatarUrl()
        );
    }

    // 6. XÓA THÀNH VIÊN KHỎI BOARD
    @Transactional
    public void removeBoardMember(Long boardId, Long userId, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        permissionService.checkWorkspaceAdmin(board.getWorkspace(), user);

        com.kanban.backend.entity.WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), targetUser)
                .orElseThrow(() -> new RuntimeException("Member not found in workspace"));

        workspaceMemberRepository.delete(member);
        
        // Also remove from board members if exists
        boardMemberRepository.findByBoardAndUser(board, targetUser)
                .ifPresent(boardMemberRepository::delete);
    }

    // 6.5. CẬP NHẬT QUYỀN TRÊN BOARD
    @Transactional
    public void updateBoardMemberRole(Long boardId, Long userId, String newRole, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        permissionService.checkBoardAdmin(board, user);

        User targetUser = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
        
        com.kanban.backend.entity.WorkspaceMember targetWsMember = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), targetUser)
                .orElseThrow(() -> new RuntimeException("Target user is not in workspace"));
        if ("ROLE_ADMIN".equals(targetWsMember.getRole())) {
            throw new RuntimeException("Không thể thay đổi quyền của Quản trị viên Không gian làm việc.");
        }

        com.kanban.backend.entity.BoardMember boardMember = boardMemberRepository.findByBoardAndUser(board, targetUser).orElse(null);
        if (boardMember == null) {
            boardMember = com.kanban.backend.entity.BoardMember.builder()
                    .board(board)
                    .user(targetUser)
                    .role(newRole)
                    .build();
        } else {
            boardMember.setRole(newRole);
        }
        boardMemberRepository.save(boardMember);
    }

    // 7. GỬI EMAIL MỜI THÀNH VIÊN VÀO WORKSPACE (qua Board)
    public com.kanban.backend.dto.response.InvitationResponse inviteBoardMember(
            Long boardId,
            com.kanban.backend.dto.request.InviteMemberRequest request,
            String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        User user = userRepository.findByEmailNormalized(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        permissionService.checkWorkspaceAdmin(board.getWorkspace(), user);

        return invitationService.sendInvitation(board.getWorkspace().getId(), request, userEmail);
    }
}