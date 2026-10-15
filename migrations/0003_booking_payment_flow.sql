-- Zaram Hotels
-- Booking hold and payment-flow support

ALTER TABLE bookings
ADD COLUMN hold_expires_at TEXT;

ALTER TABLE bookings
ADD COLUMN payment_provider TEXT
CHECK (
    payment_provider IS NULL
    OR payment_provider IN ('mock', 'paystack')
);

ALTER TABLE bookings
ADD COLUMN payment_reference TEXT;

ALTER TABLE bookings
ADD COLUMN paid_at TEXT;

CREATE UNIQUE INDEX idx_bookings_payment_reference
ON bookings(payment_reference)
WHERE payment_reference IS NOT NULL;

CREATE INDEX idx_bookings_room_dates_status
ON bookings(
    room_id,
    check_in,
    check_out,
    booking_status
);

CREATE INDEX idx_bookings_hold_expires
ON bookings(
    booking_status,
    hold_expires_at
)
WHERE booking_status = 'pending';
