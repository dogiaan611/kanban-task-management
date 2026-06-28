# 📋 PM-KABAN (Kanban Board Management)

PM-KABAN là một ứng dụng quản lý công việc (Kanban Board) Fullstack mạnh mẽ, lấy cảm hứng từ Trello, được xây dựng với mục tiêu quản lý dự án, tổ chức công việc trực quan và làm việc nhóm thời gian thực (real-time).

## 🚀 Công nghệ sử dụng

### 🖥️ Frontend
- **React.js (Vite)** + TypeScript
- **TailwindCSS** (Giao diện người dùng)
- **React Query** (Quản lý trạng thái server)
- **React Router** (Điều hướng trang)
- **@hello-pangea/dnd** (Kéo thả thẻ công việc mượt mà)
- **Recharts** (Vẽ biểu đồ thống kê)
- **SockJS & STOMP** (Giao tiếp WebSocket Real-time)

### ⚙️ Backend
- **Spring Boot 3** (Java 17)
- **Spring Security + JWT** (Xác thực và Phân quyền RBAC)
- **Spring Data JPA** (Hibernate)
- **Spring WebSocket** (Thông báo và cập nhật Real-time)
- **Spring Boot Starter Mail** (Gửi Email mời thành viên)
- **Flyway** (Quản lý phiên bản cơ sở dữ liệu)
- **Swagger / OpenAPI** (Tài liệu API)
- **JUnit 5 & Mockito** (Kiểm thử Unit Test)

### 🗄️ Database & DevOps
- **PostgreSQL** (Hệ quản trị cơ sở dữ liệu chính)
- **Docker & Docker Compose** (Môi trường chạy Database)

---

## 🌟 Tính năng nổi bật

- **Tổ chức Đa Tầng:** Quản lý theo cấu trúc `Workspace` -> `Board` -> `List` -> `Card`.
- **Kéo Thả Trực Quan (Drag & Drop):** Hỗ trợ kéo thả Thẻ (Card) qua lại giữa các Cột (List).
- **Cập Nhật Theo Thời Gian Thực (Real-time):** Mọi thao tác kéo thả, bình luận, thay đổi nội dung đều được đồng bộ tức thì đến tất cả thành viên trong Board thông qua WebSockets.
- **Tự Động Hóa (Automation):** Kéo thẻ vào cột "Done" sẽ tự động đánh dấu hoàn tất toàn bộ danh sách việc cần làm (Checklist).
- **Phân Quyền Chi Tiết (RBAC):** Quyền `ADMIN`, `MEMBER`, `VIEWER`. Viewer chỉ có thể xem, không thể kéo thả hay chỉnh sửa.
- **Tính Năng Thẻ Mở Rộng:** Hỗ trợ Thẻ (Tags), Hạn chót (Due Date), Bình luận (Mentions), File đính kèm, Danh sách công việc con (Checklist).
- **Lời Mời Thành Viên (Invitations):** Mời người khác vào Workspace thông qua Email với link chứa Token xác thực.
- **Biểu Đồ Thống Kê (Dashboard):** Biểu đồ hiển thị khối lượng công việc, tỷ lệ hoàn thành.
- **Chế Độ Xem Lịch (Calendar View):** Theo dõi các công việc theo Hạn chót trên giao diện Lịch tháng.

---

## 🛠️ Hướng dẫn Cài đặt & Chạy dự án

### Yêu cầu hệ thống:
- Java 17+
- Node.js 18+
- Docker & Docker Compose
- Maven (Tùy chọn, dự án đã có sẵn Maven Wrapper)

### Bước 1: Khởi động Database (PostgreSQL)
Mở terminal tại thư mục gốc của dự án và chạy lệnh sau để khởi động container PostgreSQL:
```bash
docker-compose up -d
```
Hệ thống sẽ chạy ở `localhost:5432` với user: `postgres`, password: `postgres`.

### Bước 2: Chạy Backend (Spring Boot)
Di chuyển vào thư mục `backend`:
```bash
cd backend
```
Nếu bạn dùng Windows:
```bash
.\mvnw spring-boot:run
```
Nếu bạn dùng Linux/Mac:
```bash
./mvnw spring-boot:run
```
Flyway sẽ tự động tạo bảng (Migration). Backend sẽ chạy ở cổng `http://localhost:8080`.

### Bước 3: Chạy Frontend (React)
Mở một terminal mới và di chuyển vào thư mục `frontend`:
```bash
cd frontend
npm install
npm run dev
```
Frontend sẽ chạy ở cổng `http://localhost:5173`. Truy cập vào link này để trải nghiệm ứng dụng.

---

## 📚 Tài liệu API (Swagger UI)
Sau khi Backend chạy thành công, bạn có thể truy cập tài liệu Swagger UI để xem và thử nghiệm toàn bộ các API của hệ thống (Đã được cấu hình xác thực Bearer Token):

👉 **[Truy cập Swagger UI](http://localhost:8080/swagger-ui/index.html)**

---

## 🧪 Chạy Unit Test
Dự án đã được trang bị bộ Unit Test cho các Service cốt lõi (`AuthService`, `BoardService`, `CardService`).
Để chạy kiểm thử, ở thư mục `backend`, dùng lệnh:
```bash
.\mvnw test
```

---
*Dự án được xây dựng với mục đích cung cấp một giải pháp quản lý công việc chuyên nghiệp và mạnh mẽ.*
