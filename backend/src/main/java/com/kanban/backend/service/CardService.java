package com.kanban.backend.service;

import com.kanban.backend.dto.request.CardRequest;
import com.kanban.backend.dto.request.UpdatePositionRequest;
import com.kanban.backend.dto.response.CardResponse;
import com.kanban.backend.dto.response.TagResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.KanbanList;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CardService {

    private final CardRepository cardRepository;
    private final KanbanListRepository listRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final ActivityService activityService;
    private final NotificationService notificationService;
    private final SimpMessagingTemplate messagingTemplate;
    private final PermissionService permissionService;
    private final ChecklistService checklistService;

    private void notifyBoardUpdate(Long boardId) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId, "{\"action\":\"BOARD_UPDATED\"}");
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public CardResponse createCard(CardRequest request, String userEmail) {
        KanbanList list = listRepository.findById(request.getListId())
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(list.getBoard(), user);

        Double maxPosition = cardRepository.findTopByListOrderByPositionDesc(list)
                .map(Card::getPosition)
                .orElse(0.0);

        Card newCard = Card.builder()
                .list(list)
                .title(request.getTitle())
                .description(request.getDescription())
                .position(maxPosition + 65536.0)
                .createdBy(user)
                .build();

        newCard = cardRepository.save(newCard);

        activityService.logActivity(newCard, user, "added this card to", list.getTitle());
        
        notifyBoardUpdate(list.getBoard().getId());

        return new CardResponse(
                newCard.getId(),
                list.getId(),
                newCard.getTitle(),
                newCard.getDescription(),
                newCard.getPosition(),
                newCard.getCreatedAt(),
                newCard.getDueDate(),
                newCard.getAssignee() != null ? newCard.getAssignee().getId() : null,
                newCard.getAssignee() != null ? newCard.getAssignee().getFullName() : null,
                newCard.getAssignee() != null ? newCard.getAssignee().getAvatarUrl() : null,
                newCard.getCreatedBy().getId(),
                newCard.getCreatedBy().getFullName(),
                newCard.getTags() != null ? newCard.getTags().stream().map(t -> new TagResponse(t.getId(), t.getName(), t.getColor())).collect(Collectors.toList()) : new java.util.ArrayList<>()
        );
    }

    @Transactional
    public void updateCardPosition(Long cardId, UpdatePositionRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

        boolean isListChanged = request.getParentId() != null && !card.getList().getId().equals(request.getParentId());

        // If card is moved to another list
        if (isListChanged) {
            KanbanList newList = listRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Destination list not found"));
            permissionService.checkBoardMemberOrAdmin(newList.getBoard(), user);
            card.setList(newList);
            
            // Automation: Check if moved to Done list
            String lowerTitle = newList.getTitle().toLowerCase();
            if (lowerTitle.contains("done") || lowerTitle.contains("hoàn thành")) {
                checklistService.markAllComplete(card, user);
            }
        }

        card.setPosition(request.getPosition());
        cardRepository.save(card);
        
        if (isListChanged) {
            activityService.logActivity(card, user, "moved this card to", card.getList().getTitle());
            notificationService.notifyCardActivity(card, user, "moved card", "to list " + card.getList().getTitle());
        }
        
        notifyBoardUpdate(card.getList().getBoard().getId());
    }

    @Transactional
    public CardResponse updateCardDetail(Long cardId, com.kanban.backend.dto.request.UpdateCardDetailRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

        boolean isAdmin = false;
        try {
            permissionService.checkBoardAdmin(card.getList().getBoard(), user);
            isAdmin = true;
        } catch (RuntimeException e) {
            // Không phải admin
        }

        boolean isCreator = card.getCreatedBy() != null && card.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isCreator) {
            throw new RuntimeException("Bạn không có quyền chỉnh sửa thẻ này!");
        }

        if (request.getTitle() != null && !request.getTitle().trim().isEmpty()) {
            card.setTitle(request.getTitle().trim());
        }
        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            card.setDueDate(request.getDueDate());
            notificationService.notifyCardActivity(card, user, "updated due date", request.getDueDate().toString());
        }
        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId() == -1) {
                card.setAssignee(null);
            } else {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                card.setAssignee(assignee);
                notificationService.notifyCardActivity(card, user, "assigned card to", assignee.getFullName());
            }
        }

        card = cardRepository.save(card);
        
        activityService.logActivity(card, user, "updated card details", null);
        
        notifyBoardUpdate(card.getList().getBoard().getId());
        
        return new CardResponse(
                card.getId(),
                card.getList().getId(),
                card.getTitle(),
                card.getDescription(),
                card.getPosition(),
                card.getCreatedAt(),
                card.getDueDate(),
                card.getAssignee() != null ? card.getAssignee().getId() : null,
                card.getAssignee() != null ? card.getAssignee().getFullName() : null,
                card.getAssignee() != null ? card.getAssignee().getAvatarUrl() : null,
                card.getCreatedBy() != null ? card.getCreatedBy().getId() : null,
                card.getCreatedBy() != null ? card.getCreatedBy().getFullName() : "Unknown",
                card.getTags() != null ? card.getTags().stream().map(t -> new TagResponse(t.getId(), t.getName(), t.getColor())).collect(Collectors.toList()) : new java.util.ArrayList<>()
        );
    }

    @Transactional
    public void deleteCard(Long cardId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);
        
        boolean isAdmin = false;
        try {
            permissionService.checkBoardAdmin(card.getList().getBoard(), user);
            isAdmin = true;
        } catch (RuntimeException e) {
            // Không phải admin
        }

        boolean isCreator = card.getCreatedBy() != null && card.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isCreator) {
            throw new RuntimeException("Bạn không có quyền xóa thẻ của người khác!");
        }

        Long boardId = card.getList().getBoard().getId();

        cardRepository.delete(card);
        
        notifyBoardUpdate(boardId);
    }
}
