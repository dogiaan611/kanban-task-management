-- Align legacy workspace_invitations schema with current entity
-- RENAME COLUMN expiry_date TO expires_at; (Already renamed)
ALTER TABLE workspace_invitations
    ADD COLUMN IF NOT EXISTS invited_by BIGINT;

UPDATE workspace_invitations wi
SET invited_by = (
    SELECT u.id FROM users u ORDER BY u.id LIMIT 1
)
WHERE wi.invited_by IS NULL;

ALTER TABLE workspace_invitations
    ALTER COLUMN invited_by SET NOT NULL;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'fk_wi_invited_by'
    ) THEN
        ALTER TABLE workspace_invitations
            ADD CONSTRAINT fk_wi_invited_by
            FOREIGN KEY (invited_by) REFERENCES users(id) ON DELETE CASCADE;
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_workspace_invitations_token ON workspace_invitations(token);
CREATE INDEX IF NOT EXISTS idx_workspace_invitations_email ON workspace_invitations(email);
