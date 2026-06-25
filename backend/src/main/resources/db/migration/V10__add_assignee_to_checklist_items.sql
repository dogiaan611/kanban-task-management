ALTER TABLE checklists ADD COLUMN assignee_id BIGINT;
ALTER TABLE checklists ADD CONSTRAINT fk_checklists_assignee FOREIGN KEY (assignee_id) REFERENCES users(id) ON DELETE SET NULL;
