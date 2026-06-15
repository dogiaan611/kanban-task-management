package com.kanban.backend.entity;

import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "roles")
@Getter
@Setter
@NoArgsConstructor // Tạo constructor (không tham số)
@AllArgsConstructor // Tạo Constructor (có đầy đủ tham số)
@Builder// Tạo đối tượng theo Pattern Builder

public class Role {
    @Id //Khai báo khóa chính
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Tự động sinh giá trị cho khóa chính khi lưu 1 bản ghi mới
    private Integer id;

    @Column(nullable = false, unique = true, length = 50)
    private String name;
}
