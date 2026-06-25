package com.kanban.backend.repository;

import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Tag;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TagRepository extends JpaRepository<Tag, Long> {
    List<Tag> findByBoard(Board board);
}
