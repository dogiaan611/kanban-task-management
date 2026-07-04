package com.kanban.backend.service;

import com.kanban.backend.dto.request.ListRequest;
import com.kanban.backend.dto.request.UpdatePositionRequest;
import com.kanban.backend.dto.response.CardResponse;
import com.kanban.backend.dto.response.KanbanListResponse;
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

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class KanbanListService {

    private final KanbanListRepository listRepository;
    private final CardRepository cardRepository;
    private final BoardRepository boardRepository;
    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final UserRepository userRepository;
    private final SimpMessagingTemplate messagingTemplate;
    private final PermissionService permissionService;

    private void notifyBoardUpdate(Long boardId) {
        messagingTemplate.convertAndSend("/topic/board/" + boardId, "{\"action\":\"BOARD_UPDATED\"}");
    }

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Transactional
    public KanbanListResponse createList(ListRequest request, String userEmail) {
        Board board = boardRepository.findById(request.getBoardId())
                .orElseThrow(() -> new RuntimeException("Board not found"));

        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(board, user);

        Double maxPosition = listRepository.findTopByBoardOrderByPositionDesc(board)
                .map(KanbanList::getPosition)
                .orElse(0.0);

        KanbanList newList = KanbanList.builder()
                .board(board)
                .title(request.getTitle())
                .position(maxPosition + 65536.0) // using gap 65536
                .build();

        newList = listRepository.save(newList);

        notifyBoardUpdate(board.getId());

        return new KanbanListResponse(
                newList.getId(),
                board.getId(),
                newList.getTitle(),
                newList.getPosition(),
                newList.getCreatedAt(),
                List.of()
        );
    }

    public List<KanbanListResponse> getListsByBoard(Long boardId, String userEmail) {
        Board board = boardRepository.findById(boardId)
                .orElseThrow(() -> new RuntimeException("Board not found"));

        User user = getUser(userEmail);
        permissionService.checkBoardViewerOrAbove(board, user);

        List<KanbanList> lists = listRepository.findByBoardOrderByPositionAsc(board);

        return lists.stream().map(list -> {
            List<Card> cards = cardRepository.findByListOrderByPositionAsc(list);
            List<CardResponse> cardResponses = cards.stream().map(card -> new CardResponse(
                    card.getId(),
                    list.getId(),
                    card.getTitle(),
                    card.getDescription(),
                    card.getPosition(),
                    card.getCreatedAt(),
                    card.getDueDate(),
                    card.getAssignee() != null ? card.getAssignee().getId() : null,
                    card.getAssignee() != null ? card.getAssignee().getFullName() : null,
                    card.getAssignee() != null ? card.getAssignee().getAvatarUrl() : null,
                    card.getCreatedBy().getId(),
                    card.getCreatedBy().getFullName(),
                    card.getTags() != null ? card.getTags().stream().map(t -> new TagResponse(t.getId(), t.getName(), t.getColor())).collect(Collectors.toList()) : new java.util.ArrayList<>()
            )).collect(Collectors.toList());

            return new KanbanListResponse(
                    list.getId(),
                    board.getId(),
                    list.getTitle(),
                    list.getPosition(),
                    list.getCreatedAt(),
                    cardResponses
            );
        }).collect(Collectors.toList());
    }

    @Transactional
    public void updateListPosition(Long listId, UpdatePositionRequest request, String userEmail) {
        KanbanList list = listRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));
        
        User user = getUser(userEmail);
        permissionService.checkBoardMemberOrAdmin(list.getBoard(), user);

        list.setPosition(request.getPosition());
        listRepository.save(list);
        
        notifyBoardUpdate(list.getBoard().getId());
    }

    @Transactional
    public void deleteList(Long listId, String userEmail) {
        KanbanList list = listRepository.findById(listId)
                .orElseThrow(() -> new RuntimeException("List not found"));

        User user = getUser(userEmail);
        permissionService.checkBoardAdmin(list.getBoard(), user);
        Long boardId = list.getBoard().getId();

        listRepository.delete(list);
        
        notifyBoardUpdate(boardId);
    }
}
