package com.kanban.backend.repository;

import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.BoardMember;
import com.kanban.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface BoardMemberRepository extends JpaRepository<BoardMember, Long> {
    List<BoardMember> findByBoard(Board board);
    Optional<BoardMember> findByBoardAndUser(Board board, User user);
    boolean existsByBoardAndUser(Board board, User user);
}
