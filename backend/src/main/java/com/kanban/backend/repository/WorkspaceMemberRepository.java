package com.kanban.backend.repository;

import com.kanban.backend.entity.User;
import com.kanban.backend.entity.Workspace;
import com.kanban.backend.entity.WorkspaceMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkspaceMemberRepository extends JpaRepository<WorkspaceMember, Long> {
    // Lấy danh sách các workspace mà một user đang tham gia
    List<WorkspaceMember> findByUser(User user);

    // Kiểm tra xem user này đã ở trong workspace chưa
    boolean existsByWorkspaceAndUser(Workspace workspace, User user);

    // Lấy chi tiết thông tin tham gia (để xem role là gì)
    Optional<WorkspaceMember> findByWorkspaceAndUser(Workspace workspace, User user);

    // Tìm kiếm workspace theo tên cho user
    List<WorkspaceMember> findByUserAndWorkspace_NameContainingIgnoreCase(User user, String keyword);

    // Xóa tất cả member của một workspace
    void deleteByWorkspace(Workspace workspace);
}