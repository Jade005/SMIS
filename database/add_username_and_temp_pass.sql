-- =============================================================================
-- Migration: Add username and is_temp_password columns to users table
-- =============================================================================

USE smis;

-- Add username column if it doesn't exist
SET @dbname = DATABASE();
SET @tablename = "users";
SET @columnname = "username";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN username VARCHAR(100) NULL AFTER email, ADD UNIQUE INDEX uq_users_username (username);"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;

-- Add is_temp_password column if it doesn't exist
SET @columnname = "is_temp_password";
SET @preparedStatement = (SELECT IF(
  (
    SELECT COUNT(*) FROM INFORMATION_SCHEMA.COLUMNS
    WHERE
      TABLE_SCHEMA = @dbname
      AND TABLE_NAME = @tablename
      AND COLUMN_NAME = @columnname
  ) > 0,
  "SELECT 1",
  "ALTER TABLE users ADD COLUMN is_temp_password TINYINT(1) NOT NULL DEFAULT 0 AFTER is_active;"
));
PREPARE alterIfNotExists FROM @preparedStatement;
EXECUTE alterIfNotExists;
DEALLOCATE PREPARE alterIfNotExists;
