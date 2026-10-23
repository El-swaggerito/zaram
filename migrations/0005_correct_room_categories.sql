-- Correct Morocco/Rwanda category mix-up.
-- Correct final grouping:
-- VIP: Nigeria, Rwanda
-- Big: Ghana, Kenya, Morocco
-- Medium: Egypt, Mozambique, Botswana

UPDATE rooms
SET
    category = 'big',
    base_rate_kobo = 5500000,
    vat_kobo = 412500,
    total_rate_kobo = 5912500
WHERE slug = 'morocco';

UPDATE rooms
SET
    category = 'vip',
    base_rate_kobo = 7000000,
    vat_kobo = 525000,
    total_rate_kobo = 7525000
WHERE slug = 'rwanda';
