package com.kanban.backend.service;

import com.kanban.backend.dto.DashboardStatsDTO;
import com.kanban.backend.entity.User;
import com.kanban.backend.repository.BoardRepository;
import com.kanban.backend.repository.CardRepository;
import com.kanban.backend.repository.WorkspaceMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final WorkspaceMemberRepository workspaceMemberRepository;
    private final BoardRepository boardRepository;
    private final CardRepository cardRepository;

    public DashboardStatsDTO getStatsForUser(User user) {
        long totalWorkspaces = workspaceMemberRepository.countByUser(user);
        long totalBoards = boardRepository.countBoardsByUser(user);
        long totalAssignedCards = cardRepository.countByAssignee(user);

        List<Object[]> cardsByListRaw = cardRepository.countCardsByListForAssignee(user);
        Map<String, Long> cardsByList = new HashMap<>();
        for (Object[] row : cardsByListRaw) {
            String listTitle = (String) row[0];
            Long count = (Long) row[1];
            cardsByList.put(listTitle, count);
        }

        return DashboardStatsDTO.builder()
                .totalWorkspaces(totalWorkspaces)
                .totalBoards(totalBoards)
                .totalAssignedCards(totalAssignedCards)
                .cardsByList(cardsByList)
                .build();
    }
}
