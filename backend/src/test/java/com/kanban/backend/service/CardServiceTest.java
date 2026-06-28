package com.kanban.backend.service;

import com.kanban.backend.dto.request.CardRequest;
import com.kanban.backend.dto.request.UpdatePositionRequest;
import com.kanban.backend.dto.response.CardResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.KanbanList;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.KanbanListRepository;
import com.kanban.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CardServiceTest {

    @Mock
    private CardRepository cardRepository;
    @Mock
    private KanbanListRepository listRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private ActivityService activityService;
    @Mock
    private NotificationService notificationService;
    @Mock
    private SimpMessagingTemplate messagingTemplate;
    @Mock
    private PermissionService permissionService;
    @Mock
    private ChecklistService checklistService;

    @InjectMocks
    private CardService cardService;

    private User mockUser;
    private Board mockBoard;
    private KanbanList mockList;
    private Card mockCard;

    @BeforeEach
    void setUp() {
        mockUser = User.builder()
                .id(1L)
                .email("user@example.com")
                .build();

        mockBoard = Board.builder()
                .id(1L)
                .name("Test Board")
                .build();

        mockList = KanbanList.builder()
                .id(1L)
                .title("To Do")
                .board(mockBoard)
                .build();

        mockCard = Card.builder()
                .id(1L)
                .title("Test Card")
                .list(mockList)
                .position(65536.0)
                .build();
    }

    @Test
    void createCard_Success() {
        // Arrange
        CardRequest request = new CardRequest();
        request.setListId(1L);
        request.setTitle("New Card");
        request.setDescription("Description");

        when(listRepository.findById(1L)).thenReturn(Optional.of(mockList));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        doNothing().when(permissionService).checkBoardMemberOrAdmin(mockBoard, mockUser);
        when(cardRepository.findTopByListOrderByPositionDesc(mockList)).thenReturn(Optional.of(mockCard));

        Card savedCard = Card.builder()
                .id(2L)
                .title("New Card")
                .description("Description")
                .list(mockList)
                .position(131072.0)
                .build();
        when(cardRepository.save(any(Card.class))).thenReturn(savedCard);

        // Act
        CardResponse response = cardService.createCard(request, "user@example.com");

        // Assert
        assertNotNull(response);
        assertEquals("New Card", response.getTitle());
        assertEquals("Description", response.getDescription());
        assertEquals(131072.0, response.getPosition());

        verify(activityService).logActivity(any(Card.class), eq(mockUser), eq("added this card to"), eq("To Do"));
        verify(messagingTemplate).convertAndSend(eq("/topic/board/1"), anyString());
    }

    @Test
    void updateCardPosition_Success_SameList() {
        // Arrange
        UpdatePositionRequest request = new UpdatePositionRequest();
        request.setPosition(100000.0);
        request.setParentId(1L); // Same list ID

        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        doNothing().when(permissionService).checkBoardMemberOrAdmin(mockBoard, mockUser);
        when(cardRepository.save(any(Card.class))).thenReturn(mockCard);

        // Act
        cardService.updateCardPosition(1L, request, "user@example.com");

        // Assert
        assertEquals(100000.0, mockCard.getPosition());
        verify(cardRepository).save(mockCard);
        verify(messagingTemplate).convertAndSend(eq("/topic/board/1"), anyString());
    }

    @Test
    void updateCardPosition_MoveToDoneList_TriggersAutomation() {
        // Arrange
        UpdatePositionRequest request = new UpdatePositionRequest();
        request.setPosition(50000.0);
        request.setParentId(2L); // Different list ID

        KanbanList doneList = KanbanList.builder()
                .id(2L)
                .title("Done")
                .board(mockBoard)
                .build();

        when(cardRepository.findById(1L)).thenReturn(Optional.of(mockCard));
        when(userRepository.findByEmail("user@example.com")).thenReturn(Optional.of(mockUser));
        doNothing().when(permissionService).checkBoardMemberOrAdmin(mockBoard, mockUser);
        when(listRepository.findById(2L)).thenReturn(Optional.of(doneList));
        when(cardRepository.save(any(Card.class))).thenReturn(mockCard);

        // Act
        cardService.updateCardPosition(1L, request, "user@example.com");

        // Assert
        assertEquals(50000.0, mockCard.getPosition());
        assertEquals(2L, mockCard.getList().getId());
        
        verify(checklistService).markAllComplete(mockCard, mockUser);
        verify(activityService).logActivity(mockCard, mockUser, "moved this card to", "Done");
        verify(notificationService).notifyCardActivity(eq(mockCard), eq(mockUser), contains("moved card"), any());
        verify(messagingTemplate).convertAndSend(eq("/topic/board/1"), anyString());
    }
}
