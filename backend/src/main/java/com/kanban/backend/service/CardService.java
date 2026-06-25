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

    private void checkAccess(Board board, String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(board.getWorkspace(), user);
        if (!isMember) {
            throw new RuntimeException("You do not have access to this board.");
        }
    }

    @Transactional
    public CardResponse createCard(CardRequest request, String userEmail) {
        KanbanList list = listRepository.findById(request.getListId())
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(list.getBoard().getWorkspace(), user);
        if (!isMember) {
            throw new RuntimeException("You do not have access to this board.");
        }

        Double maxPosition = cardRepository.findTopByListOrderByPositionDesc(list)
                .map(Card::getPosition)
                .orElse(0.0);

        Card newCard = Card.builder()
                .list(list)
                .title(request.getTitle())
                .description(request.getDescription())
                .position(maxPosition + 65536.0)
                .build();

        newCard = cardRepository.save(newCard);

        activityService.logActivity(newCard, user, "added this card to", list.getTitle());

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
                newCard.getTags() != null ? newCard.getTags().stream().map(t -> new TagResponse(t.getId(), t.getName(), t.getColor())).collect(Collectors.toList()) : new java.util.ArrayList<>()
        );
    }

    @Transactional
    public void updateCardPosition(Long cardId, UpdatePositionRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        checkAccess(card.getList().getBoard(), userEmail);

        boolean isListChanged = request.getParentId() != null && !card.getList().getId().equals(request.getParentId());

        // If card is moved to another list
        if (isListChanged) {
            KanbanList newList = listRepository.findById(request.getParentId())
                    .orElseThrow(() -> new RuntimeException("Destination list not found"));
            checkAccess(newList.getBoard(), userEmail);
            card.setList(newList);
        }

        card.setPosition(request.getPosition());
        cardRepository.save(card);
        
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        if (isListChanged) {
            activityService.logActivity(card, user, "moved this card to", card.getList().getTitle());
        }
    }

    @Transactional
    public CardResponse updateCardDetail(Long cardId, com.kanban.backend.dto.request.UpdateCardDetailRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        
        checkAccess(card.getList().getBoard(), userEmail);

        if (request.getDescription() != null) {
            card.setDescription(request.getDescription());
        }
        if (request.getDueDate() != null) {
            card.setDueDate(request.getDueDate());
        }
        if (request.getAssigneeId() != null) {
            User assignee = userRepository.findById(request.getAssigneeId())
                    .orElseThrow(() -> new RuntimeException("Assignee not found"));
            card.setAssignee(assignee);
        }

        card = cardRepository.save(card);
        
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        activityService.logActivity(card, user, "updated card details", null);
        
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
                card.getTags() != null ? card.getTags().stream().map(t -> new TagResponse(t.getId(), t.getName(), t.getColor())).collect(Collectors.toList()) : new java.util.ArrayList<>()
        );
    }

    @Transactional
    public void deleteCard(Long cardId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));

        checkAccess(card.getList().getBoard(), userEmail);

        cardRepository.delete(card);
    }
}
