package com.kanban.backend.repository;

import com.kanban.backend.entity.Workspace;
import com.kanban.backend.entity.WorkspaceInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface WorkspaceInvitationRepository extends JpaRepository<WorkspaceInvitation, Long> {

    Optional<WorkspaceInvitation> findByToken(String token);

    Optional<WorkspaceInvitation> findByWorkspaceAndEmailAndStatus(Workspace workspace, String email, String status);

    @Query("SELECT CASE WHEN COUNT(wi) > 0 THEN true ELSE false END FROM WorkspaceInvitation wi " +
            "WHERE wi.workspace = :workspace AND LOWER(wi.email) = LOWER(:email) AND wi.status = :status")
    boolean existsByWorkspaceAndEmailAndStatus(
            @Param("workspace") Workspace workspace,
            @Param("email") String email,
            @Param("status") String status);
}
