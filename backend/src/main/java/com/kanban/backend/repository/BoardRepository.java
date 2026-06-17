package com.kanban.backend.repository;

import com.kanban.backend.entity.Board;
import com.kanban.backend.entity.Workspace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BoardRepository extends JpaRepository<Board, Long> {
    // Hàm này giúp lấy toàn bộ Board nằm trong một Workspace cụ thể
    List<Board> findByWorkspace(Workspace workspace);
}