ALTER TABLE cards ADD COLUMN IF NOT EXISTS created_by BIGINT;

-- Cập nhật dữ liệu cho các card cũ
UPDATE cards 
SET created_by = COALESCE(
    assignee_id, 
    (SELECT id FROM users ORDER BY id ASC LIMIT 1)
)
WHERE created_by IS NULL;

-- Thiết lập ràng buộc NOT NULL và Khóa ngoại sau khi đã điền dữ liệu
ALTER TABLE cards ALTER COLUMN created_by SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_card_created_by') THEN
        ALTER TABLE cards 
        ADD CONSTRAINT fk_card_created_by 
        FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;
