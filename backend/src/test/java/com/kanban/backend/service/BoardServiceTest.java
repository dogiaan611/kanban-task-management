package com.kanban.backend.service;

import com.kanban.backend.dto.request.AddBoardMemberRequest;
import com.kanban.backend.dto.request.BoardRequest;
import com.kanban.backend.dto.response.BoardMemberResponse;
import com.kanban.backend.dto.response.BoardResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.BoardMember;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.entity.WorkspaceMember;
import com.kanban.backend.repository.BoardMemberRepository;
import com.kanban.backend.repository.BoardRepository;
import com.kanban.backend.repository.KanbanListRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import com.kanban.backend.repository.WorkspaceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BoardServiceTest {

    @Mock
    private BoardRepository boardRepository;
    @Mock
    private WorkspaceRepository workspaceRepository;
    @Mock
    private WorkspaceMemberRepository workspaceMemberRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private KanbanListRepository kanbanListRepository;
    @Mock
    private BoardMemberRepository boardMemberRepository;
    @Mock
    private PermissionService permissionService;

    @InjectMocks
    private BoardService boardService;

    private User mockUser;
    private Workspace mockWorkspace;
    private Board mockBoard;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .fullName("User")
                .build();

        mockWorkspace = Workspace.builder()
                .id(1L)
                .name("Workspace 1")
                .build();

        mockBoard = Board.builder()
                .id(1L)
                .name("Board 1")
                .workspace(mockWorkspace)
                .build();
    }

    @Test
    void createBoard_Success() {
        // Arrange
        BoardRequest request = new BoardRequest();
        request.setWorkspaceId(1L);
        request.setName("New Board");

        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        when(workspaceRepository.findById(1L)).thenReturn(Optional.of(mockWorkspace));
        
        // Mock permission check to do nothing (success)
        doNothing().when(permissionService).checkWorkspaceMember(mockWorkspace, mockUser);
        
        Board savedBoard = Board.builder()
                .id(2L)
                .name("New Board")
                .workspace(mockWorkspace)
                .build();
        when(boardRepository.save(any(Board.class))).thenReturn(savedBoard);

        // Act
        BoardResponse response = boardService.createBoard(request, "user@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("New Board", response.getName());
        assertEquals(2L, response.getId());
        
        // Ensure 3 default lists are created
        verify(kanbanListRepository).saveAll(any(List.class));
        
        // Ensure user is added as board admin
        verify(boardMemberRepository).save(any(BoardMember.class));
    }

    @Test
    void addBoardMember_Success_NewWorkspaceMember() {
        // Arrange
        AddBoardMemberRequest request = new AddBoardMemberRequest();
        request.setEmail("target@example.com");

        User targetUser = User.builder().id(2L).email("target@example.com").fullName("Target User").build();

        when(boardRepository.findById(1L)).thenReturn(Optional.of(mockBoard));
        when(userRepository.findByEmail("target@example.com")).thenReturn(Optional.of(targetUser));
        when(workspaceMemberRepository.existsByWorkspaceAndUser(mockWorkspace, targetUser)).thenReturn(false);

        WorkspaceMember savedMember = WorkspaceMember.builder()
                .id(10L)
                .workspace(mockWorkspace)
                .user(targetUser)
                .role("ROLE_MEMBER")
                .build();
        when(workspaceMemberRepository.save(any(WorkspaceMember.class))).thenReturn(savedMember);

        // Act
        BoardMemberResponse response = boardService.addBoardMember(1L, request, "admin@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("Target User", response.getFullName());
        assertEquals("target@example.com", response.getEmail());
        assertEquals("ROLE_MEMBER", response.getRole());
        
        verify(workspaceMemberRepository).save(any(WorkspaceMember.class));
    }

    @Test
    void addBoardMember_Success_ExistingWorkspaceMember() {
        // Arrange
        AddBoardMemberRequest request = new AddBoardMemberRequest();
        request.setEmail("target@example.com");

        User targetUser = User.builder().id(2L).email("target@example.com").fullName("Target User").build();

        when(boardRepository.findById(1L)).thenReturn(Optional.of(mockBoard));
        when(userRepository.findByEmail("target@example.com")).thenReturn(Optional.of(targetUser));
        when(workspaceMemberRepository.existsByWorkspaceAndUser(mockWorkspace, targetUser)).thenReturn(true);

        WorkspaceMember existingMember = WorkspaceMember.builder()
                .id(10L)
                .workspace(mockWorkspace)
                .user(targetUser)
                .role("ROLE_ADMIN")
                .build();
        when(workspaceMemberRepository.findByWorkspaceAndUser(mockWorkspace, targetUser)).thenReturn(Optional.of(existingMember));

        // Act
        BoardMemberResponse response = boardService.addBoardMember(1L, request, "admin@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("Target User", response.getFullName());
        assertEquals("ROLE_ADMIN", response.getRole());
        
        verify(workspaceMemberRepository, never()).save(any(WorkspaceMember.class));
    }
}
