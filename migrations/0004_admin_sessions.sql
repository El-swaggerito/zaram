-- Zaram Hotels
-- Secure admin login sessions

CREATE TABLE admin_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    admin_id INTEGER NOT NULL,

    -- SHA-256 hash of the random session token.
    -- The raw token is stored only in the browser cookie.
    token_hash TEXT NOT NULL UNIQUE,

    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_seen_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id)
        REFERENCES admins(id)
        ON DELETE CASCADE
);

CREATE INDEX idx_admin_sessions_token_hash
ON admin_sessions(token_hash);

CREATE INDEX idx_admin_sessions_admin
ON admin_sessions(admin_id);

CREATE INDEX idx_admin_sessions_expires
ON admin_sessions(expires_at);
