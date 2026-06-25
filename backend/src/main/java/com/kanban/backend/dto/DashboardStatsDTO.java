package com.kanban.backend.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DashboardStatsDTO {
    private long totalWorkspaces;
    private long totalBoards;
    private long totalAssignedCards;
    private Map<String, Long> cardsByList;
}
