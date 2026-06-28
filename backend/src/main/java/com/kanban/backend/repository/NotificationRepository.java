package com.kanban.backend.repository;

import com.kanban.backend.entity.Notification;
import com.kanban.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);

    long countByUserAndReadFalse(User user);
}
