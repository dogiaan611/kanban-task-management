# Theo dõi tiến độ dự án Kanban Fullstack

Đây là danh sách các công việc cụ thể chúng ta sẽ làm. Tôi sẽ cập nhật tiến độ này trong suốt quá trình đồng hành cùng bạn.

## Tuần 1: Thiết lập nền tảng, Database & Đăng nhập/Xác thực

### 1. Thiết lập Database & Kiến trúc cơ bản
- `[x]` Khởi tạo cấu trúc thư mục dự án (backend, frontend)
- `[x]` Viết file `docker-compose.yml` để chạy PostgreSQL
- `[ ]` Phác thảo Entity Relationship Diagram (ERD) cơ bản

### 2. Khởi tạo Backend (Spring Boot)
- `[x]` Tạo project Spring Boot 3 bằng Spring Initializr
- `[x]` Cấu hình kết nối Database (`application.properties`)
- `[x]` Tích hợp Flyway và tạo script SQL khởi tạo bảng Users, Roles

### 3. Cấu hình Bảo mật (Spring Security & JWT)
- `[x]` Cấu hình Spring Security 6
- `[x]` Viết JWT Utility (Tạo token, Validate token)
- `[x]` Cấu hình Filters chặn request không có token

### 4. Xây dựng API Authentication
- `[x]` Tạo Entity, Repository, DTO cho User
- `[x]` Viết Service xử lý Đăng ký, Đăng nhập
- `[x]` Viết Controller API Đăng ký, Đăng nhập
- `[x]` Viết API Refresh Token

### 5. Khởi tạo Frontend (React + Vite)
- `[x]` Khởi tạo Vite + React + TS
- `[x]` Cài đặt TailwindCSS
- `[x]` Thiết lập React Router, Axios, React Query
- `[x]` Dựng màn hình Đăng ký / Đăng nhập

## Tuần 2: Quản lý Workspace & Board

### 6. Backend - API Workspace
- `[x]` Migration: Tạo bảng workspaces, workspace_members
- `[x]` Tạo Entity, Repository, DTO cho Workspace
- `[x]` Viết Service xử lý nghiệp vụ Workspace (Tạo, Sửa, Xóa, Lấy danh sách)
- `[x]` Viết Controller các API Workspace

### 7. Backend - API Board
- `[x]` Migration: Tạo bảng boards
- `[x]` Tạo Entity, Repository, DTO cho Board
- `[x]` Viết Service nghiệp vụ Board (Tạo mới, Lấy danh sách board trong workspace)
- `[x]` Viết Controller API Board

### 8. Frontend - Giao diện cốt lõi & API Integration
- `[x]` Dựng layout chính (Sidebar, Header, Dashboard)
- `[x]` Viết các hook/service kết nối Axios gọi API Workspace, Board
- `[x]` Dựng trang danh sách Workspace và tạo mới Workspace
- `[x]` Dựng trang danh sách Board bên trong một Workspace

## Tuần 3: Lõi Kanban (List, Card) & Kéo thả

### 9. Backend - API List & Card
- `[x]` Migration: Tạo bảng lists, cards
- `[x]` Tạo Entity, Repository, DTO cho List và Card
- `[x]` Viết Service xử lý nghiệp vụ List (Tạo, Đổi tên, Đổi vị trí)
- `[x]` Viết Service xử lý nghiệp vụ Card (Tạo, Xóa, Di chuyển)
- `[x]` Viết Controller API cho List và Card

### 10. Frontend - Giao diện Kanban Board
- `[x]` Dựng trang Kanban Board (Board Detail)
- `[x]` Dựng Component KanbanList và KanbanCard
- `[x]` Tích hợp thư viện @hello-pangea/dnd cho tính năng kéo thả (Drag & Drop)
- `[x]` Cập nhật vị trí Card/List thông qua API sau khi kéo thả (Optimistic Update)

## Tuần 4: Chi tiết Card, Phân quyền Board, Tương tác & User Profile

### 11. Backend - Chi tiết Card, Phân quyền & Tương tác
- `[/]` Migration: Tạo bảng board_members và thêm cột is_private cho boards
- `[/]` Migration: Tạo bảng checklists, comments, activities
- `[ ]` Tạo API quản lý Board Members (Add/Remove User khỏi Board)
- `[x]` Tạo API cập nhật chi tiết Card (Mô tả, Assignee, Due Date)
- `[x]` Tạo API Checklist (Thêm mục, Đánh dấu hoàn thành)
- `[ ]` Tạo API Comment (Thêm bình luận)
- `[ ]` Cấu hình Entity Listener ghi nhận Activity Log tự động
- `[ ]` Tạo API quản lý User Profile (Cập nhật thông tin cá nhân)

### 12. Frontend - Card Detail, Board Members & Profile
- `[ ]` Dựng giao diện quản lý Board Members (Danh sách Avatar và Nút Add trên Header)
- `[x]` Dựng Modal chi tiết Card (CardDetailModal)
- `[x]` Dựng Component ChecklistBlock (Thanh tiến trình)
- `[x]` Tích hợp Datepicker cho Due Date
- `[ ]` Dựng giao diện Comment và hiển thị Activity Log
- `[ ]` Dựng trang User Profile (Cập nhật thông tin cá nhân, ảnh đại diện)
- `[ ]` Thêm Biểu đồ thống kê gọn nhẹ trên Dashboard

## Tuần 5: WebSockets, Mời thành viên, Kiểm thử & Đóng gói

### 13. Cập nhật Real-time (WebSockets)
- `[ ]` Cấu hình Spring WebSocket (STOMP/SockJS) ở Backend
- `[ ]` Tích hợp WebSocket client ở Frontend để cập nhật Board tức thì

### 14. Kiểm thử & Tối ưu hóa
- `[ ]` Viết Unit Test cho các API cốt lõi (JUnit/MockMvc)
- `[ ]` Xử lý lỗi toàn cục phía Frontend (Toast Notifications)
- `[ ]` Tối ưu Responsive (Giao diện Board khi cuộn ngang, Mobile/Tablet)

### 15. Gửi Email Mời Thành Viên (Flow Có Token Xác Nhận)
- `[ ]` Cấu hình JavaMailSender ở Backend để gửi thư
- `[ ]` Migration: Tạo bảng workspace_invitations chứa mã Token xác nhận
- `[ ]` Backend: Viết API tạo mã Token gửi Email & API xác thực Token để Add vào Workspace
- `[ ]` Frontend: Dựng trang Xác nhận Lời mời (Accept Invite Page) cho người dùng click từ Email
- `[ ]` Viết file README.md hướng dẫn cài đặt và chạy dự án
- `[ ]` Hoàn thiện Swagger API Docs và rà soát tổng thể
