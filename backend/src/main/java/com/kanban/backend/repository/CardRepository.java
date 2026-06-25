package com.kanban.backend.repository;

import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.User;
import com.kanban.backend.entity.KanbanList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByListOrderByPositionAsc(KanbanList list);
    Optional<Card> findTopByListOrderByPositionDesc(KanbanList list);

    long countByAssignee(User assignee);

    @Query("SELECT c.list.title, COUNT(c) FROM Card c WHERE c.assignee = :assignee GROUP BY c.list.title")
    List<Object[]> countCardsByListForAssignee(@Param("assignee") User assignee);
}
