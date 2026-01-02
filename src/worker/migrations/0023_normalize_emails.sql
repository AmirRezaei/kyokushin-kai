UPDATE user_settings
SET email = LOWER(email);

UPDATE user_roles
SET email = LOWER(email);
