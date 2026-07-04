package com.kanban.backend.service;

import com.kanban.backend.dto.request.TagRequest;
import com.kanban.backend.dto.response.TagResponse;
import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Tag;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.BoardRepository;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.TagRepository;
import com.kanban.backend.repository.UserRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TagService {

    private final TagRepository tagRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;
    private final UserRepository userRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final ActivityService activityService;
    private final PermissionService permissionService;

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional(readOnly = true)
    public List<TagResponse> getTagsByBoard(Long boardId, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardViewerOrAbove(board, user);

        return tagRepository.findByBoard(board).stream()
                .map(t -> new TagResponse(t.getId(), t.getName(), t.getColor()))
                .collect(Collectors.toList());
    }

    @Transactional
    public TagResponse createTag(Long boardId, TagRequest request, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(board, user);

        Tag tag = Tag.builder()
                .board(board)
                .name(request.getName() != null ? request.getName() : "")
                .color(request.getColor())
                .build();

        tag = tagRepository.save(tag);
        return new TagResponse(tag.getId(), tag.getName(), tag.getColor());
    }

    @Transactional
    public void deleteTag(Long tagId, String userEmail) {
        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardAdmin(tag.getBoard(), user);
        tagRepository.delete(tag);
    }

    @Transactional
    public void addTagToCard(Long cardId, Long tagId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

        boolean isAdmin = false;
        try {
            permissionService.checkBoardAdmin(card.getList().getBoard(), user);
            isAdmin = true;
        } catch (Exception e) {}
        boolean isCreator = card.getCreatedBy() != null && card.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isCreator) {
            throw new RuntimeException("Bạn không có quyền thêm nhãn vào thẻ này!");
        }

        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        if (!tag.getBoard().getId().equals(card.getList().getBoard().getId())) {
            throw new RuntimeException("Tag does not belong to the same board");
        }

        card.getTags().add(tag);
        cardRepository.save(card);
        activityService.logActivity(card, user, "added tag", tag.getName() != null && !tag.getName().isEmpty() ? tag.getName() : "color " + tag.getColor());
    }

    @Transactional
    public void removeTagFromCard(Long cardId, Long tagId, String userEmail) {
        Card card = cardRepository.findById(cardId)
                .orElseThrow(() -> new RuntimeException("Card not found"));
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(card.getList().getBoard(), user);

        boolean isAdmin = false;
        try {
            permissionService.checkBoardAdmin(card.getList().getBoard(), user);
            isAdmin = true;
        } catch (Exception e) {}
        boolean isCreator = card.getCreatedBy() != null && card.getCreatedBy().getId().equals(user.getId());

        if (!isAdmin && !isCreator) {
            throw new RuntimeException("Bạn không có quyền gỡ nhãn khỏi thẻ này!");
        }

        Tag tag = tagRepository.findById(tagId)
                .orElseThrow(() -> new RuntimeException("Tag not found"));

        card.getTags().remove(tag);
        cardRepository.save(card);
        activityService.logActivity(card, user, "removed tag", tag.getName() != null && !tag.getName().isEmpty() ? tag.getName() : "color " + tag.getColor());
    }
}
