package com.kanban.backend.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
public class WorkspaceResponse {
    private Long id;
    private String name;
    private String description;
    // Cực kỳ quan trọng: Trả về role (quyền) của người dùng hiện tại để Frontend biết có được phép sửa/xóa hay không
    private String userRole;
    private LocalDateTime createdAt;
}