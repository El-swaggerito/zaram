UPDATE rooms
SET
  short_description = 'A generous Big Room designed for comfort, space and relaxation.',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'morocco';

UPDATE rooms
SET
  short_description = 'A spacious VIP room offering elevated comfort and a relaxing stay.',
  updated_at = CURRENT_TIMESTAMP
WHERE slug = 'rwanda';
