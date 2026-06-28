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
    private final NotificationService notificationService;
    private final PermissionService permissionService;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    public List<ChecklistResponse> getChecklistsByCard(Long cardId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardViewerOrAbove(card.getList().getBoard(), user);

        return checklistRepository.findByCardOrderByPositionAsc(card).stream()
                .map(item -> new ChecklistResponse(
                        item.getId(),
                        card.getId(),
                        item.getTitle(),
                        item.getIsCompleted(),
                        item.getPosition(),
                        item.getAssignee() != null ? item.getAssignee().getId() : null,
                        item.getAssignee() != null ? item.getAssignee().getFullName() : null,
                        item.getAssignee() != null ? item.getAssignee().getAvatarUrl() : null,
                        item.getCreatedAt()
                )).collect(Collectors.toList());
    }

    @Transactional
    public ChecklistResponse createChecklist(Long cardId, ChecklistRequest request, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

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
        
        activityService.logActivity(card, user, "added checklist item", item.getTitle());
        notificationService.notifyCardActivity(card, user, "added checklist item", item.getTitle());

        return new ChecklistResponse(
                item.getId(),
                card.getId(),
                item.getTitle(),
                item.getIsCompleted(),
                item.getPosition(),
                null,
                null,
                null,
                item.getCreatedAt()
        );
    }

    @Transactional
    public ChecklistResponse updateChecklist(Long id, UpdateChecklistRequest request, String userEmail) {
        Checklist item = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(item.getCard().getList().getBoard(), user);

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

        if (request.getAssigneeId() != null) {
            if (request.getAssigneeId() == -1) {
                item.setAssignee(null);
            } else {
                User assignee = userRepository.findById(request.getAssigneeId())
                        .orElseThrow(() -> new RuntimeException("Assignee not found"));
                item.setAssignee(assignee);
                notificationService.notifyCardActivity(item.getCard(), user, "assigned checklist item to", assignee.getFullName());
            }
        }

        item = checklistRepository.save(item);

        if (completionChanged) {
            activityService.logActivity(item.getCard(), user, newCompletionState ? "completed checklist item" : "uncompleted checklist item", item.getTitle());
            if (newCompletionState) {
                notificationService.notifyCardActivity(item.getCard(), user, "completed checklist item", item.getTitle());
            }
        }

        return new ChecklistResponse(
                item.getId(),
                item.getCard().getId(),
                item.getTitle(),
                item.getIsCompleted(),
                item.getPosition(),
                item.getAssignee() != null ? item.getAssignee().getId() : null,
                item.getAssignee() != null ? item.getAssignee().getFullName() : null,
                item.getAssignee() != null ? item.getAssignee().getAvatarUrl() : null,
                item.getCreatedAt()
        );
    }

    @Transactional
    public void markAllComplete(Card card, User user) {
        List<Checklist> items = checklistRepository.findByCardOrderByPositionAsc(card);
        boolean changed = false;
        for (Checklist item : items) {
            if (!Boolean.TRUE.equals(item.getIsCompleted())) {
                item.setIsCompleted(true);
                changed = true;
            }
        }
        if (changed) {
            checklistRepository.saveAll(items);
            activityService.logActivity(card, user, "Automation", "Marked all checklists as complete");
        }
    }

    @Transactional
    public void deleteChecklist(Long id, String userEmail) {
        Checklist item = checklistRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Checklist item not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(item.getCard().getList().getBoard(), user);

        activityService.logActivity(item.getCard(), user, "deleted checklist item", item.getTitle());
        checklistRepository.delete(item);
    }
}
