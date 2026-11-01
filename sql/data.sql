-- ============================================================
-- Anime Store Seed Data (`data.sql`)
-- EXACT 12 Finalized Products
-- ============================================================

USE anime_store_db;

INSERT INTO products (id, name, description, price, rating, image_url) VALUES
(1, 'Ash''s Cap', 'The Winner''s Cap!', 499.00, 4.4, '../assets/prod/Ashh.jpg'),
(2, 'Death Note', 'Do you like writing names!?', 1399.00, 4.3, '../assets/prod/DeathNote.jpg'),
(3, 'Red Scarf', 'Stock Unavailable!', 544.00, 5.0, '../assets/prod/mykasa.jpg'),
(4, 'T-Shirt', 'I am not Zenin, Took my wife''s name!', 599.00, 4.3, '../assets/prod/notZenin.jpg'),
(5, 'Mouse Pad', 'Make your Mouse "Ultra Instinct"', 399.00, 4.9, '../assets/prod/Og.jpg'),
(6, 'Anya-Man', 'The Honoured One!', 399.00, 4.7, '../assets/prod/theGoat.jpg'),
(7, 'The Mask', 'These fools can never make me sweat.', 499.00, 4.9, '../assets/prod/tobi.jpg'),
(8, 'Mini-Waguri', 'Cake Loverss all around!', 399.00, 4.4, '../assets/prod/Waguri.jpg'),
(9, 'Umbrella', 'Get your Infinity!', 350.00, 4.5, '../assets/prod/GojoUmb.jpg'),
(10, 'iPhone Case', 'Why no one thinks about denji''s heart!?', 300.00, 4.2, '../assets/prod/Denji.jpg'),
(11, 'The Cup', 'Peace.', 179.00, 4.6, '../assets/prod/Thorfinn.jpg'),
(12, 'Hoodie', 'It''s time to wake the inner monster!', 699.00, 4.1, '../assets/prod/BlueLock.jpg')
ON DUPLICATE KEY UPDATE
    name = VALUES(name),
    description = VALUES(description),
    price = VALUES(price),
    rating = VALUES(rating),
    image_url = VALUES(image_url);
