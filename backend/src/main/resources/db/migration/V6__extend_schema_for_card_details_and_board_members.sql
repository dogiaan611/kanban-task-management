-- 1. Thêm cột is_private vào bảng boards
ALTER TABLE boards ADD COLUMN is_private BOOLEAN NOT NULL DEFAULT FALSE;

-- 2. Tạo bảng board_members
CREATE TABLE board_members (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'MEMBER',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bm_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_bm_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(board_id, user_id)
);

-- 3. Bổ sung assignee_id và due_date cho bảng cards
ALTER TABLE cards ADD COLUMN assignee_id BIGINT;
ALTER TABLE cards ADD COLUMN due_date TIMESTAMP;
ALTER TABLE cards ADD CONSTRAINT fk_card_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;

-- 4. Tạo bảng checklists cho các task con của Card
CREATE TABLE checklists (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL,
    title VARCHAR(255) NOT NULL,
    is_completed BOOLEAN NOT NULL DEFAULT FALSE,
    position DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_checklist_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE
);

-- 5. Tạo bảng comments cho bình luận trong Card
CREATE TABLE comments (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. Tạo bảng activities để ghi nhận lịch sử hoạt động
CREATE TABLE activities (
    id BIGSERIAL PRIMARY KEY,
    board_id BIGINT NOT NULL,
    card_id BIGINT,
    user_id BIGINT NOT NULL,
    action_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activity_board FOREIGN KEY (board_id) REFERENCES boards(id) ON DELETE CASCADE,
    CONSTRAINT fk_activity_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE SET NULL,
    CONSTRAINT fk_activity_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
