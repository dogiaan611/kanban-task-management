package com.kanban.backend.service;
import com.kanban.backend.dto.response.ActivityResponse;
import com.kanban.backend.entity.Activity;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.ActivityRepository;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ActivityService {
    private final ActivityRepository activityRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;

    @Transactional
    public void logActivity(Card card, User user, String action, String detail) {
        Activity activity = Activity.builder()
                .board(card.getList().getBoard())
                .card(card)
                .user(user)
                .actionType(action)
                .description(detail == null ? "" : detail)
                .build();
        activityRepository.save(activity);
    }

    @Transactional(readOnly = true)
    public List<ActivityResponse> getActivitiesByCard(Long cardId, String email) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(card.getList().getBoard().getWorkspace(), user);
        if (!isMember) throw new RuntimeException("Access denied");

        return activityRepository.findByCardOrderByCreatedAtDesc(card).stream()
                .map(a -> new ActivityResponse(
                        a.getId(),
                        a.getUser() != null ? a.getUser().getId() : null,
                        a.getUser() != null ? a.getUser().getFullName() : "System",
                        a.getUser() != null ? a.getUser().getAvatarUrl() : null,
                        a.getActionType(),
                        a.getDescription(),
                        a.getCreatedAt()
                )).collect(Collectors.toList());
    }
}
