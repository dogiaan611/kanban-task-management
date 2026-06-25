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

    // 1. TẠO BOARD MỚI TRONG WORKSPACE
    @Transactional
    public BoardResponse createBoard(BoardRequest request, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(request.getWorkspaceId())
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Kiểm tra xem user hiện tại có phải là thành viên của Workspace này không
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user);
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền tạo Board trong Workspace này!");
        }

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

        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(board.getWorkspace(), user);
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền xem Board này!");
        }

        return new BoardResponse(board.getId(), board.getWorkspace().getId(), board.getName(), board.getCreatedAt());
    }

    // 2. LẤY DANH SÁCH BOARD CỦA 1 WORKSPACE
    public List<BoardResponse> getBoardsByWorkspace(Long workspaceId, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Workspace workspace = workspaceRepository.findById(workspaceId)
                .orElseThrow(() -> new RuntimeException("Workspace not found"));

        // Phải là thành viên mới được xem danh sách Board
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(workspace, user);
        if (!isMember) {
            throw new RuntimeException("Bạn không có quyền xem các Board trong Workspace này!");
        }

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

        // Kiểm tra quyền xóa: Phải là Admin của Workspace
        com.kanban.backend.entity.WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), user)
                .orElseThrow(() -> new RuntimeException("You are not a member of this workspace"));

        if (!"ROLE_ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Only ADMIN can delete boards in this workspace");
        }

        boardRepository.delete(board);
    }

    // 4. LẤY DANH SÁCH THÀNH VIÊN BOARD (Đồng bộ với Project/Workspace)
    public List<com.kanban.backend.dto.response.BoardMemberResponse> getBoardMembers(Long boardId, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        
        List<com.kanban.backend.entity.WorkspaceMember> members = workspaceMemberRepository.findByWorkspace(board.getWorkspace());
        return members.stream().map(m -> new com.kanban.backend.dto.response.BoardMemberResponse(
                m.getId(), m.getUser().getId(), m.getUser().getFullName(), m.getUser().getEmail(), m.getRole(), m.getUser().getAvatarUrl()
        )).collect(Collectors.toList());
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

        com.kanban.backend.entity.WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(board.getWorkspace(), targetUser)
                .orElseThrow(() -> new RuntimeException("Member not found in workspace"));

        workspaceMemberRepository.delete(member);
    }
}