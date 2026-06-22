package com.kanban.backend.repository;

import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.KanbanList;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CardRepository extends JpaRepository<Card, Long> {
    List<Card> findByListOrderByPositionAsc(KanbanList list);
    Optional<Card> findTopByListOrderByPositionDesc(KanbanList list);
}
