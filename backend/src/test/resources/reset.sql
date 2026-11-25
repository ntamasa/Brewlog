TRUNCATE brew, brew_method RESTART IDENTITY CASCADE;

INSERT INTO brew_method (name, icon_key, predefined, is_protected, position) VALUES
    ('Espresso', 'espresso', true, false, 1),
    ('Pour Over', 'pour-over', true, false, 2),
    ('French Press', 'french-press', true, false, 3),
    ('AeroPress', 'aeropress', true, false, 4),
    ('Moka Pot', 'moka-pot', true, false, 5),
    ('Cold Brew', 'cold-brew', true, false, 6),
    ('Other', 'cup', true, true, 99);
