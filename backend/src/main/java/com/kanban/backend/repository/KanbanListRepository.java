package com.kanban.backend.repository;

import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.KanbanList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface KanbanListRepository extends JpaRepository<KanbanList, Long> {
    List<KanbanList> findByBoardOrderByPositionAsc(Board board);
    Optional<KanbanList> findTopByBoardOrderByPositionDesc(Board board);
}
