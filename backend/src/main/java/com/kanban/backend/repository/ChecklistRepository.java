package com.kanban.backend.repository;

import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByCardOrderByPositionAsc(Card card);
    Optional<Checklist> findTopByCardOrderByPositionDesc(Card card);
}
