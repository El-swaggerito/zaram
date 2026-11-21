-- Zaram Hotels
-- Paystack payment-attempt tracking
--
-- One booking may have multiple payment attempts.
-- bookings.payment_reference is reserved for the payment
-- that is ultimately verified as successful.

CREATE TABLE payment_transactions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    booking_id INTEGER NOT NULL,

    provider TEXT NOT NULL DEFAULT 'paystack'
    CHECK (
        provider IN ('paystack')
    ),

    reference TEXT NOT NULL UNIQUE,

    amount_kobo INTEGER NOT NULL
    CHECK (
        amount_kobo >= 0
    ),

    currency TEXT NOT NULL DEFAULT 'NGN',

    status TEXT NOT NULL DEFAULT 'initialized'
    CHECK (
        status IN (
            'initialized',
            'abandoned',
            'failed',
            'ongoing',
            'pending',
            'processing',
            'queued',
            'reversed',
            'success'
        )
    ),

    access_code TEXT,
    authorization_url TEXT,

    provider_transaction_id TEXT,
    gateway_response TEXT,

    paid_at TEXT,
    verified_at TEXT,

    created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (booking_id)
        REFERENCES bookings(id)
        ON DELETE RESTRICT
);

CREATE INDEX idx_payment_transactions_booking
ON payment_transactions(
    booking_id,
    created_at
);

CREATE INDEX idx_payment_transactions_status
ON payment_transactions(
    status
);

CREATE INDEX idx_payment_transactions_provider_id
ON payment_transactions(
    provider_transaction_id
)
WHERE provider_transaction_id IS NOT NULL;
