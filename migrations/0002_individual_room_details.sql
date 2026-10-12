ALTER TABLE rooms ADD COLUMN slug TEXT;
ALTER TABLE rooms ADD COLUMN image_path TEXT;
ALTER TABLE rooms ADD COLUMN short_description TEXT;

UPDATE rooms
SET
    slug = 'nigeria',
    image_path = '/images/rooms/nigeria.jpg',
    short_description = 'A spacious VIP room offering elevated comfort and a relaxing stay.'
WHERE name = 'Nigeria';

UPDATE rooms
SET
    slug = 'morocco',
    image_path = '/images/rooms/morocco.jpg',
    short_description = 'A spacious VIP room offering elevated comfort and a relaxing stay.'
WHERE name = 'Morocco';

UPDATE rooms
SET
    slug = 'ghana',
    image_path = '/images/rooms/ghana.jpg',
    short_description = 'A generous Big Room designed for comfort, space and relaxation.'
WHERE name = 'Ghana';

UPDATE rooms
SET
    slug = 'kenya',
    image_path = '/images/rooms/kenya.jpg',
    short_description = 'A generous Big Room designed for comfort, space and relaxation.'
WHERE name = 'Kenya';

UPDATE rooms
SET
    slug = 'rwanda',
    image_path = '/images/rooms/rwanda.jpg',
    short_description = 'A generous Big Room designed for comfort, space and relaxation.'
WHERE name = 'Rwanda';

UPDATE rooms
SET
    slug = 'egypt',
    image_path = '/images/rooms/egypt.jpg',
    short_description = 'A comfortable Medium Room with everything needed for an enjoyable stay.'
WHERE name = 'Egypt';

UPDATE rooms
SET
    slug = 'mozambique',
    image_path = '/images/rooms/mozambique.jpg',
    short_description = 'A comfortable Medium Room with everything needed for an enjoyable stay.'
WHERE name = 'Mozambique';

UPDATE rooms
SET
    slug = 'botswana',
    image_path = '/images/rooms/botswana.jpg',
    short_description = 'A comfortable Medium Room with everything needed for an enjoyable stay.'
WHERE name = 'Botswana';

CREATE UNIQUE INDEX idx_rooms_slug
ON rooms(slug);
