package com.kanban.backend.repository;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface CommentRepository extends JpaRepository<Comment, Long> {
    List<Comment> findByCardOrderByCreatedAtDesc(Card card);
}
