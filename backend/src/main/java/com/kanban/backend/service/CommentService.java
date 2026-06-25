package com.kanban.backend.service;
import com.kanban.backend.dto.request.CommentRequest;
import com.kanban.backend.dto.response.CommentResponse;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Comment;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.CommentRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CommentService {
    private final CommentRepository commentRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ActivityService activityService;

    private User getUserAndCheckAccess(Card card, String email) {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        boolean isMember = workspaceMemberRepository.existsByWorkspaceAndUser(card.getList().getBoard().getWorkspace(), user);
        if (!isMember) throw new RuntimeException("Access denied");
        return user;
    }

    @Transactional
    public CommentResponse addComment(Long cardId, CommentRequest request, String email) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        User user = getUserAndCheckAccess(card, email);

        Comment comment = Comment.builder()
                .card(card)
                .user(user)
                .content(request.getContent())
                .build();
        comment = commentRepository.save(comment);

        activityService.logActivity(card, user, "commented", request.getContent());

        return new CommentResponse(comment.getId(), comment.getContent(), user.getId(), user.getFullName(), user.getAvatarUrl(), comment.getCreatedAt(), comment.getUpdatedAt());
    }

    @Transactional
    public CommentResponse updateComment(Long commentId, CommentRequest request, String email) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        if (!comment.getUser().getId().equals(user.getId())) {
            throw new RuntimeException("Cannot edit other user's comment");
        }
        comment.setContent(request.getContent());
        comment = commentRepository.save(comment);
        activityService.logActivity(comment.getCard(), user, "edited a comment", request.getContent());
        return new CommentResponse(comment.getId(), comment.getContent(), user.getId(), user.getFullName(), user.getAvatarUrl(), comment.getCreatedAt(), comment.getUpdatedAt());
    }

    @Transactional
    public void deleteComment(Long commentId, String email) {
        Comment comment = commentRepository.findById(commentId).orElseThrow(() -> new RuntimeException("Comment not found"));
        User user = userRepository.findByEmail(email).orElseThrow(() -> new RuntimeException("User not found"));
        
        com.kanban.backend.entity.Workspace workspace = comment.getCard().getList().getBoard().getWorkspace();
        com.kanban.backend.entity.WorkspaceMember member = workspaceMemberRepository.findByWorkspaceAndUser(workspace, user)
                .orElseThrow(() -> new RuntimeException("Access denied"));

        if (!comment.getUser().getId().equals(user.getId()) && !"ROLE_ADMIN".equals(member.getRole())) {
            throw new RuntimeException("Cannot delete other user's comment");
        }
        commentRepository.delete(comment);
        activityService.logActivity(comment.getCard(), user, "deleted a comment", null);
    }
    
    @Transactional(readOnly = true)
    public List<CommentResponse> getCommentsByCard(Long cardId, String email) {
        Card card = cardRepository.findById(cardId).orElseThrow(() -> new RuntimeException("Card not found"));
        getUserAndCheckAccess(card, email);
        return commentRepository.findByCardOrderByCreatedAtDesc(card).stream()
                .map(c -> new CommentResponse(c.getId(), c.getContent(), c.getUser().getId(), c.getUser().getFullName(), c.getUser().getAvatarUrl(), c.getCreatedAt(), c.getUpdatedAt()))
                .collect(Collectors.toList());
    }
}
