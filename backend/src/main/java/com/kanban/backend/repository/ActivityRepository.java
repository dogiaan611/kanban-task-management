package com.kanban.backend.repository;
import com.kanban.backend.entity.Card;
import com.kanban.backend.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long> {
    List<Activity> findByCardOrderByCreatedAtDesc(Card card);
}
