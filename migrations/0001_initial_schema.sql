PRAGMA foreign_keys = ON;

CREATE TABLE rooms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    category TEXT NOT NULL CHECK (
        category IN ('vip', 'big', 'medium')
    ),
    base_rate_kobo INTEGER NOT NULL CHECK (base_rate_kobo >= 0),
    vat_kobo INTEGER NOT NULL CHECK (vat_kobo >= 0),
    total_rate_kobo INTEGER NOT NULL CHECK (total_rate_kobo >= 0),
    operational_status TEXT NOT NULL DEFAULT 'available' CHECK (
        operational_status IN (
            'available',
            'maintenance',
            'out_of_service'
        )
    ),
    is_active INTEGER NOT NULL DEFAULT 1 CHECK (
        is_active IN (0, 1)
    ),
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE guests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    nationality TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone);

CREATE TABLE bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_reference TEXT NOT NULL UNIQUE,
    guest_id INTEGER NOT NULL,
    room_id INTEGER NOT NULL,
    check_in TEXT NOT NULL,
    check_out TEXT NOT NULL,
    adults INTEGER NOT NULL DEFAULT 1 CHECK (adults >= 1),
    children INTEGER NOT NULL DEFAULT 0 CHECK (children >= 0),
    nightly_rate_kobo INTEGER NOT NULL CHECK (nightly_rate_kobo >= 0),
    number_of_nights INTEGER NOT NULL CHECK (number_of_nights >= 1),
    total_amount_kobo INTEGER NOT NULL CHECK (total_amount_kobo >= 0),

    booking_status TEXT NOT NULL DEFAULT 'confirmed' CHECK (
        booking_status IN (
            'pending',
            'confirmed',
            'checked_in',
            'checked_out',
            'cancelled',
            'no_show'
        )
    ),

    payment_status TEXT NOT NULL DEFAULT 'unpaid' CHECK (
        payment_status IN (
            'unpaid',
            'part_paid',
            'paid',
            'refunded'
        )
    ),

    amount_paid_kobo INTEGER NOT NULL DEFAULT 0 CHECK (amount_paid_kobo >= 0),
    source TEXT NOT NULL DEFAULT 'website',
    special_requests TEXT,
    management_notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (guest_id)
        REFERENCES guests(id)
        ON DELETE RESTRICT,

    FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE RESTRICT,

    CHECK (check_out > check_in)
);

CREATE INDEX idx_bookings_room_dates
ON bookings(room_id, check_in, check_out);

CREATE INDEX idx_bookings_status
ON bookings(booking_status);

CREATE INDEX idx_bookings_guest
ON bookings(guest_id);

CREATE TABLE room_blocks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    room_id INTEGER NOT NULL,
    start_date TEXT NOT NULL,
    end_date TEXT NOT NULL,

    reason TEXT NOT NULL CHECK (
        reason IN (
            'maintenance',
            'cleaning',
            'renovation',
            'management_hold',
            'out_of_service',
            'other'
        )
    ),

    notes TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (room_id)
        REFERENCES rooms(id)
        ON DELETE CASCADE,

    CHECK (end_date > start_date)
);

CREATE INDEX idx_room_blocks_room_dates
ON room_blocks(room_id, start_date, end_date);

CREATE TABLE admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name TEXT NOT NULL,

    role TEXT NOT NULL DEFAULT 'manager' CHECK (
        role IN ('admin', 'manager', 'reception')
    ),

    is_active INTEGER NOT NULL DEFAULT 1 CHECK (
        is_active IN (0, 1)
    ),

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE audit_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER,
    action TEXT NOT NULL,
    entity_type TEXT,
    entity_id TEXT,
    details TEXT,
    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (admin_id)
        REFERENCES admins(id)
        ON DELETE SET NULL
);

CREATE INDEX idx_audit_log_admin
ON audit_log(admin_id);

CREATE INDEX idx_audit_log_created
ON audit_log(created_at);

INSERT INTO rooms (
    name,
    category,
    base_rate_kobo,
    vat_kobo,
    total_rate_kobo
)
VALUES
('Nigeria', 'vip', 7000000, 525000, 7525000),
('Morocco', 'vip', 7000000, 525000, 7525000),

('Ghana', 'big', 5500000, 412500, 5912500),
('Kenya', 'big', 5500000, 412500, 5912500),
('Rwanda', 'big', 5500000, 412500, 5912500),

('Egypt', 'medium', 5000000, 375000, 5375000),
('Mozambique', 'medium', 5000000, 375000, 5375000),
('Botswana', 'medium', 5000000, 375000, 5375000);
