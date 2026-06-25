package com.kanban.backend.service;

import com.kanban.backend.dto.request.ChecklistRequest;
import com.kanban.backend.dto.request.UpdateChecklistRequest;
import com.kanban.backend.dto.response.ChecklistResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Checklist;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.ChecklistRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChecklistService {

    private final ChecklistRepository checklistRepository;
    private final CardRepository cardRepository;
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

    public List<ChecklistResponse> getChecklistsByCard(Long cardId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        checkAccess(card.getList().getBoard(), userEmail);

        return checklistRepository.findByCardOrderByPositionAsc(card).stream()
                .map(item -> new ChecklistResponse(
                        item.getId(),
                        card.getId(),
                        item.getTitle(),
                        item.getIsCompleted(),
                        item.getPosition(),
                        item.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @Transactional
    public ChecklistResponse createChecklist(Long cardId, ChecklistRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        checkAccess(card.getList().getBoard(), userEmail);

        Double maxPosition = checklistRepository.findTopByCardOrderByPositionDesc(card)
                .map(Checklist::getPosition)
                .orElse(0.0);

        Checklist item = Checklist.builder()
                .card(card)
                .title(request.getTitle())
                .isCompleted(false)
                .position(maxPosition + 65536.0)
                .build();

        item = checklistRepository.save(item);
        
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        activityService.logActivity(card, user, "added checklist item", item.getTitle());

        return new ChecklistResponse(
                item.getId(),
                card.getId(),
                item.getTitle(),
                item.getIsCompleted(),
                item.getPosition(),
                item.getCreatedAt()
        );
    }

    @Transactional
    public ChecklistResponse updateChecklist(Long id, UpdateChecklistRequest request, String userEmail) {
        Checklist item = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        checkAccess(item.getCard().getList().getBoard(), userEmail);

        if (request.getTitle() != null) {
            item.setTitle(request.getTitle());
        }
        
        boolean completionChanged = false;
        boolean newCompletionState = false;
        if (request.getIsCompleted() != null && !request.getIsCompleted().equals(item.getIsCompleted())) {
            completionChanged = true;
            newCompletionState = request.getIsCompleted();
            item.setIsCompleted(request.getIsCompleted());
        }

        item = checklistRepository.save(item);

        if (completionChanged) {
            User user = userRepository.findByEmail(userEmail).orElseThrow();
            activityService.logActivity(item.getCard(), user, newCompletionState ? "completed checklist item" : "uncompleted checklist item", item.getTitle());
        }

        return new ChecklistResponse(
                item.getId(),
                item.getCard().getId(),
                item.getTitle(),
                item.getIsCompleted(),
                item.getPosition(),
                item.getCreatedAt()
        );
    }

    @Transactional
    public void deleteChecklist(Long id, String userEmail) {
        Checklist item = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        checkAccess(item.getCard().getList().getBoard(), userEmail);

        User user = userRepository.findByEmail(userEmail).orElseThrow();
        activityService.logActivity(item.getCard(), user, "deleted checklist item", item.getTitle());
        checklistRepository.delete(item);
    }
}
