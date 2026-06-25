package com.kanban.backend.repository;

import com.kanban.backend.entity.Attachment;
import com.kanban.backend.entity.Card;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AttachmentRepository extends JpaRepository<Attachment, Long> {
    List<Attachment> findByCardOrderByUploadedAtDesc(Card card);
}
