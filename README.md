# 🚀 PM-KANBAN: Fullstack Project Management App

Chào mừng các bạn đã tham gia vào dự án PM-KANBAN! Đây là một ứng dụng quản lý dự án lấy cảm hứng từ Trello/Jira, được xây dựng với kiến trúc Fullstack hiện đại.

Tài liệu này đóng vai trò là **"Sách hướng dẫn nhập môn" (Onboarding Guide)**. Mọi thành viên trong team **BẮT BUỘC** phải đọc kỹ tài liệu này trước khi bắt đầu code để hiểu rõ luồng nghiệp vụ (Flow), kiến trúc và các quy định chung, tránh làm sai lệch định hướng ban đầu.

---

## 🛠 Tech Stack (Công nghệ sử dụng)

*   **Backend:** Java 17, Spring Boot 3, Spring Security, Spring Data JPA.
*   **Frontend:** React (Vite), TypeScript, TailwindCSS, React Query, React Router.
*   **Database:** PostgreSQL (Quản lý schema bằng Flyway).
*   **Infrastructure:** Docker & Docker Compose (cho Database).

---

## 🏗 Kiến trúc & Luồng nghiệp vụ (Core Flows)

Dự án được chia làm 2 cấp quản lý chính: **Workspace (Tổ chức/Công ty)** và **Board (Dự án)**.

### 1. Kiến trúc Database (ERD Concept)
*   `users`: Lưu thông tin tài khoản đăng nhập.
*   `workspaces`: Không gian làm việc chung (ví dụ: Công ty A, Nhóm B).
*   `workspace_members`: Bảng trung gian xác định User nào thuộc Workspace nào.
*   `boards`: Các bảng dự án nằm trong 1 Workspace.
*   `lists`: Các cột trạng thái trong 1 Board (vd: To Do, In Progress, Done).
*   `cards`: Các thẻ công việc nằm trong 1 List.

### 2. Luồng Xác thực (Authentication Flow)
*   Sử dụng **JWT (JSON Web Token)**.
*   Khi đăng nhập thành công, Backend trả về `accessToken` và `refreshToken`.
*   Frontend lưu token vào `localStorage` (hoặc cookie) và tự động đính kèm `Bearer {token}` vào Header của các request gửi lên Backend thông qua Axios Interceptor.

### 3. Luồng Kéo Thả (Drag & Drop Flow) - RẤT QUAN TRỌNG
Tính năng lõi của app là kéo thả thẻ (Card) và cột (List). Để tránh việc phải update lại toàn bộ thứ tự của các thẻ trong Database mỗi khi kéo thả, chúng ta áp dụng thuật toán tính toán vị trí bằng số thực (tương tự logic LexoRank của Jira).
*   Mỗi Card/List có một trường `position` (kiểu số double/float).
*   Khi kéo một Card vào giữa 2 Card khác, `position` mới của nó = `(position_trên + position_dưới) / 2`.
*   Frontend sử dụng `@hello-pangea/dnd`. Khi kéo thả xong, Frontend sẽ thực hiện **Optimistic Update** (cập nhật UI ngay lập tức cho mượt) rồi mới gọi API ngầm xuống Backend để lưu `position` mới.

---

## 📁 Cấu trúc thư mục

### Backend (`/backend`)
Áp dụng mô hình chuẩn MVC + Layered Architecture:
*   `controller/`: Nơi định nghĩa các API Endpoints (RESTful).
*   `service/`: Chứa toàn bộ logic nghiệp vụ (Business logic). **Tuyệt đối không viết logic xử lý dữ liệu trong Controller**.
*   `repository/`: Tương tác với Database (Spring Data JPA).
*   `entity/`: Định nghĩa các Table trong Database.
*   `dto/`: Data Transfer Objects (Request/Response payload). Bắt buộc dùng DTO để hứng request và trả response, không trả trực tiếp Entity ra ngoài API.
*   `resources/db/migration/`: Chứa các file SQL của Flyway để tạo bảng. Không sửa trực tiếp Database bằng tay, mọi thay đổi DB phải tạo file migration mới (VD: `V6__add_board_members.sql`).

### Frontend (`/frontend`)
*   `api/`: Các hàm Axios gọi API tới Backend, chia theo từng service (vd: `authService.ts`, `kanbanService.ts`).
*   `components/`: Các UI component độc lập.
*   `pages/`: Các màn hình chính của ứng dụng (Login, Dashboard, BoardDetail).
*   `layouts/`: Khung giao diện (Sidebar, Header).

---

## 🚀 Hướng dẫn cài đặt & Chạy dự án (Local Development)

### Bước 1: Khởi động Database
Yêu cầu máy phải cài đặt **Docker**. Mở Terminal tại thư mục gốc của dự án:
```bash
docker-compose up -d
```
Lệnh này sẽ dựng một container PostgreSQL ở cổng `5432`.

### Bước 2: Chạy Backend
Mở thư mục `backend` bằng IntelliJ IDEA (hoặc IDE Java bạn dùng).
Chạy file `BackendApplication.java`.
Backend sẽ chạy ở cổng `http://localhost:8080`.
*(Lưu ý: Flyway sẽ tự động chạy các script SQL để tạo bảng khi ứng dụng khởi động).*

### Bước 3: Chạy Frontend
Mở Terminal, di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy ở cổng `http://localhost:5173`.

---

## 📝 Định hướng phát triển & Công việc tiếp theo

Hiện tại dự án đã hoàn thành lõi kéo thả Kanban (Tuần 1 -> Tuần 3).
Công việc tiếp theo của Team nằm ở **Tuần 4 & Tuần 5**.

👉 **Vui lòng đọc file `task.md` (nếu có lưu ở máy tính cá nhân hoặc hỏi Leader) để biết chính xác từng task cụ thể cần làm.**

Một số tính năng chuẩn bị triển khai:
1.  **Phân quyền Board:** Tạo bảng `board_members` và thuộc tính `is_private` để giới hạn người xem Board (Giống Trello).
2.  **Card Details:** Popup hiển thị chi tiết công việc, mô tả, ngày hết hạn.
3.  **Checklist & Comments:** Tương tác trên thẻ công việc.
4.  **Invite qua Email:** Gửi thư mời tham gia Workspace bằng JavaMailSender kèm mã Token xác thực.

---
*Chúc cả team làm việc hiệu quả và tuân thủ chặt chẽ kiến trúc của dự án!*
