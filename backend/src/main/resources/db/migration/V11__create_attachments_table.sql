CREATE TABLE attachments (
    id BIGSERIAL PRIMARY KEY,
    card_id BIGINT NOT NULL,
    user_id BIGINT NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100),
    file_path VARCHAR(500) NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_attachments_card FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
    CONSTRAINT fk_attachments_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
